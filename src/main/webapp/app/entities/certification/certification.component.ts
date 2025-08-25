import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import CertificationService from './certification.service';
import CertificationVersionService from './certification-version.service';
import { type ICertification, type ICertificationVersion } from '@/shared/model/certification.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Certification',
  setup() {
    const { t: t$ } = useI18n();
    const certificationService = inject('certificationService', () => new CertificationService());
    const certificationVersionService = inject('certificationVersionService', () => new CertificationVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const certifications: Ref<ICertification[]> = ref([]);
    const allCertifications: Ref<ICertification[]> = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);

    const newCertification = ref({
      name: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      expireDate: '',
    });

    // Variables pour le modal des versions
    const versionsModal = ref(null);
    const selectedCertification = ref(null);
    const certificationVersions = ref([]);
    const allCertificationVersions = ref([]);
    const filteredVersions = ref([]);
    const versionViewMode = ref('list');
    const versionSearchTerm = ref('');
    const versionSearchTimeout = ref(null);
    const isVersionFetching = ref(false);
    const showAddVersionRow = ref(false);
    const removeVersionId = ref(null);
    const removeVersionEntity = ref(null);

    // Pagination des versions
    const versionCurrentPage = ref(1);
    const versionItemsPerPage = ref(5);
    const versionTotalItems = ref(0);

    const newVersion = ref({
      version: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      expireDate: null,
      certification: null,
    });

    const paginatedCertifications = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return certifications.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

    const isPrevDisabled = computed(() => currentPage.value <= 1);
    const isNextDisabled = computed(() => currentPage.value >= totalPages.value);

    const paginationInfo = computed(() => {
      if (totalItems.value === 0) return '0-0 / 0';
      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(start + itemsPerPage.value - 1, totalItems.value);
      return `${start}-${end} / ${totalItems.value}`;
    });

    // Computed properties pour la pagination des versions
    const paginatedVersions = computed(() => {
      const start = (versionCurrentPage.value - 1) * versionItemsPerPage.value;
      const end = start + versionItemsPerPage.value;
      return filteredVersions.value.slice(start, end);
    });

    const versionTotalPages = computed(() => {
      return Math.ceil(versionTotalItems.value / versionItemsPerPage.value);
    });

    const isVersionPrevDisabled = computed(() => {
      return versionCurrentPage.value <= 1;
    });

    const isVersionNextDisabled = computed(() => {
      return versionCurrentPage.value >= versionTotalPages.value;
    });

    const versionPaginationInfo = computed(() => {
      if (versionTotalItems.value === 0) return '0-0 / 0';
      const start = (versionCurrentPage.value - 1) * versionItemsPerPage.value + 1;
      const end = Math.min(start + versionItemsPerPage.value - 1, versionTotalItems.value);
      return `${start}-${end} / ${versionTotalItems.value}`;
    });

    const formatDate = dateString => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    const goToNextPage = () => {
      if (!isNextDisabled.value) currentPage.value++;
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) currentPage.value--;
    };

    const updateTotalItems = () => {
      totalItems.value = certifications.value?.length || 0;
    };

    // Méthodes de pagination pour les versions
    const goToVersionNextPage = () => {
      if (!isVersionNextDisabled.value) {
        versionCurrentPage.value++;
      }
    };

    const goToVersionPrevPage = () => {
      if (!isVersionPrevDisabled.value) {
        versionCurrentPage.value--;
      }
    };

    const updateVersionTotalItems = () => {
      if (filteredVersions.value) {
        versionTotalItems.value = filteredVersions.value.length;
      } else {
        versionTotalItems.value = 0;
      }
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          certifications.value = [...allCertifications.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          certifications.value = allCertifications.value.filter(
            cert =>
              (cert.name && cert.name.toLowerCase().includes(searchLower)) ||
              (cert.description && cert.description.toLowerCase().includes(searchLower)),
          );
        }
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    // Méthode de recherche pour les versions
    const handleVersionSearch = () => {
      if (versionSearchTimeout.value) {
        clearTimeout(versionSearchTimeout.value);
      }

      versionSearchTimeout.value = setTimeout(() => {
        if (versionSearchTerm.value.trim() === '') {
          filteredVersions.value = [...certificationVersions.value];
        } else {
          const searchTermLower = versionSearchTerm.value.toLowerCase();
          filteredVersions.value = certificationVersions.value.filter(
            version =>
              (version.version && version.version.toLowerCase().includes(searchTermLower)) ||
              (version.description && version.description.toLowerCase().includes(searchTermLower)),
          );
        }
        updateVersionTotalItems();
        versionCurrentPage.value = 1;
      }, 300);
    };

    const clear = () => {
      searchTerm.value = '';
      certifications.value = [...allCertifications.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveCertifications = async () => {
      isFetching.value = true;
      try {
        const res = await certificationService().retrieve();
        certifications.value = res.data.map(cert => ({
          ...cert,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(cert)),
        }));
        allCertifications.value = [...certifications.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => retrieveCertifications();

    const prepareRemove = (instance: ICertification) => {
      certifications.value.forEach(cert => (cert.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => removeEntity.value.hide();

    const removeCertification = async () => {
      try {
        await certificationService().delete(removeId.value);
        alertService.showInfo(t$('sdiFrontendApp.certification.deleted', { param: removeId.value }).toString(), { variant: 'danger' });

        certifications.value = certifications.value.filter(cert => cert.id !== removeId.value);
        allCertifications.value = allCertifications.value.filter(cert => cert.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewCertification = async () => {
      const name = newCertification.value.name?.trim();

      if (!name) {
        alertService.showError('Le champ nom est requis.', 'danger');
        return;
      }

      // 🔎 Vérifie si le nom de certification existe déjà (insensible à la casse)
      const exists = allCertifications.value.some(item => item.name?.trim().toLowerCase() === name.toLowerCase());

      if (exists) {
        alertService.showError('Cette certification existe déjà.', 'danger');
        return;
      }

      try {
        const response = await certificationService().create(newCertification.value);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        certifications.value.push(added);
        allCertifications.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newCertification.value = {
          name: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          expireDate: '',
        };

        alertService.showSuccess('Certification ajoutée avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewCertification = () => {
      showAddRow.value = false;
      newCertification.value = {
        name: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        expireDate: '',
      };
    };

    const editCertification = certification => {
      certifications.value.forEach(cert => (cert.showDropdown = false));
      certification.originalData = JSON.parse(
        JSON.stringify({
          name: certification.name,
          description: certification.description,
          createDate: certification.createDate,
          updateDate: certification.updateDate,
          expireDate: certification.expireDate,
        }),
      );
      certification.isEditing = true;
    };

    const saveCertification = async certification => {
      if (!certification.name) {
        alertService.showError('Le champ nom est requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: certification.id,
          name: certification.name,
          description: certification.description,
          createDate: certification.createDate,
          updateDate: new Date().toISOString().split('T')[0],
          expireDate: certification.expireDate,
        };

        const response = await certificationService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = certifications.value.findIndex(cert => cert.id === certification.id);
        if (index !== -1) certifications.value.splice(index, 1, updated);

        const allIndex = allCertifications.value.findIndex(cert => cert.id === certification.id);
        if (allIndex !== -1) allCertifications.value.splice(allIndex, 1, updated);

        alertService.showSuccess('Certification mise à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = certification => {
      certification.name = certification.originalData.name;
      certification.description = certification.originalData.description;
      certification.createDate = certification.originalData.createDate;
      certification.updateDate = certification.originalData.updateDate;
      certification.expireDate = certification.originalData.expireDate;
      certification.isEditing = false;
    };

    const toggleDropdown = certification => {
      certifications.value.forEach(cert => {
        if (cert.id !== certification.id) cert.showDropdown = false;
      });
      certification.showDropdown = !certification.showDropdown;
    };

    // Méthodes pour le modal des versions
    const openVersionsModal = async certification => {
      selectedCertification.value = certification;

      // Reset pagination and search variables
      versionCurrentPage.value = 1;
      versionSearchTerm.value = '';

      // Retrieve versions for this certification
      await retrieveVersionsForCertification(certification.id);

      // Initialize new version with the selected certification
      newVersion.value = {
        version: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        certification: certification,
      };

      // Show the modal
      if (versionsModal.value && typeof versionsModal.value.show === 'function') {
        versionsModal.value.show();
      } else {
        console.error('versionsModal is not properly initialized or show method is unavailable');
      }
    };
    const closeVersionsModal = () => {
      versionsModal.value.hide();
      showAddVersionRow.value = false;
    };

    const retrieveVersionsForCertification = async certificationId => {
      isVersionFetching.value = true;
      try {
        // Récupérer toutes les versions
        const res = await certificationVersionService().retrieve();

        // Filtrer les versions pour cette certification
        const certVersions = res.data
          .filter(version => version.certification && version.certification.id === certificationId)
          .map(version => ({
            ...version,
            isEditing: false,
            showDropdown: false,
            originalData: { ...version },
          }));

        certificationVersions.value = certVersions;
        allCertificationVersions.value = [...certVersions];
        filteredVersions.value = [...certVersions];
        updateVersionTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isVersionFetching.value = false;
      }
    };

    const editCertificationVersion = version => {
      certificationVersions.value.forEach(v => {
        if (v.showDropdown) {
          v.showDropdown = false;
        }
      });

      version.originalData = { ...version };
      version.isEditing = true;
    };

    const saveCertificationVersion = async version => {
      try {
        const dataToSend = {
          id: version.id,
          version: version.version,
          description: version.description,
          createDate: version.createDate,
          updateDate: version.updateDate,
          certification: version.certification,
        };

        const response = await certificationVersionService().update(dataToSend);

        const updatedVersion = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        const updateInList = (list, updatedItem) => {
          const index = list.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            list[index] = updatedItem;
          }
        };

        updateInList(certificationVersions.value, updatedVersion);
        updateInList(allCertificationVersions.value, updatedVersion);
        updateInList(filteredVersions.value, updatedVersion);

        alertService.showInfo('Version mise à jour avec succès.', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelVersionEdit = version => {
      Object.assign(version, version.originalData);
      version.isEditing = false;
    };

    const saveNewVersion = async () => {
      if (!newVersion.value.version) {
        alertService.showInfo('Le champ version est requis.', { variant: 'danger' });
        return;
      }

      try {
        const response = await certificationVersionService().create(newVersion.value);
        const addedVersion = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        certificationVersions.value.push(addedVersion);
        allCertificationVersions.value.push(addedVersion);
        filteredVersions.value.push(addedVersion);
        updateVersionTotalItems();

        showAddVersionRow.value = false;
        newVersion.value = {
          version: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          certification: selectedCertification.value,
        };

        alertService.showInfo('Version ajoutée avec succès.', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewVersion = () => {
      showAddVersionRow.value = false;
      newVersion.value = {
        version: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        certification: selectedCertification.value,
      };
    };

    const prepareRemoveVersion = version => {
      certificationVersions.value.forEach(v => {
        if (v.showDropdown) {
          v.showDropdown = false;
        }
      });

      removeVersionId.value = version.id;
      removeVersionEntity.value.show();
    };

    const closeVersionDialog = () => {
      removeVersionEntity.value.hide();
    };

    const removeCertificationVersion = async () => {
      try {
        await certificationVersionService().delete(removeVersionId.value);
        const message = t$('sdiFrontendApp.certificationVersion.deleted', { param: removeVersionId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });

        const removeFromList = (list, id) => {
          return list.filter(item => item.id !== id);
        };

        certificationVersions.value = removeFromList(certificationVersions.value, removeVersionId.value);
        allCertificationVersions.value = removeFromList(allCertificationVersions.value, removeVersionId.value);
        filteredVersions.value = removeFromList(filteredVersions.value, removeVersionId.value);
        updateVersionTotalItems();

        removeVersionId.value = null;
        closeVersionDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    watch(
      certifications,
      () => {
        updateTotalItems();
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    watch(
      filteredVersions,
      () => {
        updateVersionTotalItems();
        if (versionCurrentPage.value > versionTotalPages.value && versionTotalPages.value > 0) {
          versionCurrentPage.value = versionTotalPages.value;
        }
      },
      { deep: true },
    );

    onMounted(async () => {
      await retrieveCertifications();
      //   versionsModal.value = ref('versionsModal');
      removeEntity.value = ref('removeEntity');
      removeVersionEntity.value = ref('removeVersionEntity');

      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          certifications.value.forEach(cert => (cert.showDropdown = false));
          certificationVersions.value.forEach(item => (item.showDropdown = false));
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newCertification,
      cancelNewCertification,
      saveNewCertification,
      certifications,
      handleSyncList,
      isFetching,
      retrieveCertifications,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeCertification,
      editCertification,
      saveCertification,
      cancelEdit,
      toggleDropdown,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedCertifications,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      searchTerm,
      handleSearch,
      formatDate,
      // Modal versions
      versionsModal,
      selectedCertification,
      openVersionsModal,
      closeVersionsModal,
      versionViewMode,
      filteredVersions,
      paginatedVersions,
      versionSearchTerm,
      handleVersionSearch,
      isVersionFetching,
      versionCurrentPage,
      versionItemsPerPage,
      versionTotalItems,
      versionTotalPages,
      isVersionPrevDisabled,
      isVersionNextDisabled,
      versionPaginationInfo,
      goToVersionNextPage,
      goToVersionPrevPage,
      showAddVersionRow,
      newVersion,
      saveNewVersion,
      cancelNewVersion,
      editCertificationVersion,
      saveCertificationVersion,
      cancelVersionEdit,
      prepareRemoveVersion,
      removeVersionId,
      removeVersionEntity,
      closeVersionDialog,
      removeCertificationVersion,
    };
  },
});
