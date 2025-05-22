import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import CertificationService from './certification.service';
import { type ICertification } from '@/shared/model/certification.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Certification',
  setup() {
    const { t: t$ } = useI18n();
    const certificationService = inject('certificationService', () => new CertificationService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const certifications: Ref<ICertification[]> = ref([]);
    const allCertifications: Ref<ICertification[]> = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    const currentPage = ref(1);
    const itemsPerPage = ref(5);
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

    const formatDate = (dateString) => {
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

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          certifications.value = [...allCertifications.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          certifications.value = allCertifications.value.filter(cert =>
            (cert.name && cert.name.toLowerCase().includes(searchLower)) ||
            (cert.description && cert.description.toLowerCase().includes(searchLower))
          );
        }
        updateTotalItems();
        currentPage.value = 1;
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
        alertService.showInfo(
          t$('sdiFrontendApp.certification.deleted', { param: removeId.value }).toString(),
          { variant: 'danger' }
        );

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
      if (!newCertification.value.name) {
        alertService.showAlert('Le champ nom est requis.', 'danger');
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

        alertService.showAlert('Certification ajoutée avec succès.', 'success', { variant: 'success' });
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
      certification.originalData = JSON.parse(JSON.stringify({
        name: certification.name,
        description: certification.description,
        createDate: certification.createDate,
        updateDate: certification.updateDate,
        expireDate: certification.expireDate
      }));
      certification.isEditing = true;
    };

    const saveCertification = async certification => {
      if (!certification.name) {
        alertService.showAlert('Le champ nom est requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: certification.id,
          name: certification.name,
          description: certification.description,
          createDate: certification.createDate,
          updateDate: new Date().toISOString().split('T')[0],
          expireDate: certification.expireDate
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

        alertService.showAlert('Certification mise à jour avec succès.', 'success', { variant: 'success' });
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

    watch(certifications, () => {
      updateTotalItems();
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
      }
    }, { deep: true });

    onMounted(async () => {
      await retrieveCertifications();
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          certifications.value.forEach(cert => (cert.showDropdown = false));
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
      clear,
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
    };
  },
});
