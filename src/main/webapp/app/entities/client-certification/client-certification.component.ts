import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import ClientCertificationService from './client-certification.service';
import ClientService from '@/entities/client/client.service';
import CertificationService from '@/entities/certification/certification.service';
import { type IClientCertification } from '@/shared/model/client-certification.model';
import { type IClient } from '@/shared/model/client.model';
import { type ICertification } from '@/shared/model/certification.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientCertification',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const router = useRouter();
    const clientCertificationService = inject('clientCertificationService', () => new ClientCertificationService());
    const clientService = inject('clientService', () => new ClientService());
    const certificationService = inject('certificationService', () => new CertificationService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientCertifications: Ref<IClientCertification[]> = ref([]);
    const allClientCertifications: Ref<IClientCertification[]> = ref([]);
    const clients: Ref<IClient[]> = ref([]);
    const certifications: Ref<ICertification[]> = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);

    const selectedClientFilter = ref(null);
    const selectedCertificationFilter = ref(null);

    const newClientCertification = ref({
      client: null,
      certif: null,
      certification: '',
      certificationDate: new Date().toISOString().split('T')[0],
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
    });

    const paginatedClientCertifications = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return clientCertifications.value.slice(start, end);
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

    const formatDate = dateString => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString();
    };

    const getCertificationStatus = clientCertification => {
      if (!clientCertification.certif || !clientCertification.certif.expireDate) return 'Non défini';

      const today = new Date();
      const expireDate = new Date(clientCertification.certif.expireDate);

      if (expireDate < today) {
        return 'Expiré';
      }

      // Si la date d'expiration est dans moins de 30 jours
      const thirtyDaysFromNow = new Date();
      thirtyDaysFromNow.setDate(today.getDate() + 30);

      if (expireDate <= thirtyDaysFromNow) {
        return 'Expire bientôt';
      }

      return 'Valide';
    };

    const getCertificationStatusClass = clientCertification => {
      const status = getCertificationStatus(clientCertification);

      if (status === 'Expiré') {
        return 'status-expired';
      } else if (status === 'Expire bientôt') {
        return 'status-warning';
      } else if (status === 'Valide') {
        return 'status-valid';
      }

      return '';
    };

    const goToNextPage = () => {
      if (!isNextDisabled.value) currentPage.value++;
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) currentPage.value--;
    };

    const updateTotalItems = () => {
      totalItems.value = clientCertifications.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        applyFilters();
      }, 300);
    };

    const applyFilters = () => {
      let filtered = [...allClientCertifications.value];

      // Appliquer le filtre de recherche
      if (searchTerm.value.trim() !== '') {
        const searchLower = searchTerm.value.toLowerCase();
        filtered = filtered.filter(
          cert =>
            (cert.client && cert.client.name && cert.client.name.toLowerCase().includes(searchLower)) ||
            (cert.certif && cert.certif.name && cert.certif.name.toLowerCase().includes(searchLower)) ||
            (cert.notes && cert.notes.toLowerCase().includes(searchLower)),
        );
      }

      // Appliquer le filtre client
      if (selectedClientFilter.value) {
        filtered = filtered.filter(cert => cert.client && cert.client.id === selectedClientFilter.value.id);
      }

      // Appliquer le filtre certification
      if (selectedCertificationFilter.value) {
        filtered = filtered.filter(cert => cert.certif && cert.certif.id === selectedCertificationFilter.value.id);
      }

      clientCertifications.value = filtered;
      updateTotalItems();
      currentPage.value = 1;
    };

    const resetFilters = () => {
      searchTerm.value = '';
      selectedClientFilter.value = null;
      selectedCertificationFilter.value = null;
      clientCertifications.value = [...allClientCertifications.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveClients = async () => {
      try {
        const res = await clientService().retrieve();
        clients.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveCertifications = async () => {
      try {
        const res = await certificationService().retrieve();
        certifications.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveClientCertifications = async () => {
      isFetching.value = true;
      try {
        const res = await clientCertificationService().retrieve();
        clientCertifications.value = res.data.map(cert => ({
          ...cert,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(cert)),
        }));
        allClientCertifications.value = [...clientCertifications.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => retrieveClientCertifications();

    const prepareRemove = (instance: IClientCertification) => {
      clientCertifications.value.forEach(cert => (cert.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => removeEntity.value.hide();

    const removeClientCertification = async () => {
      try {
        await clientCertificationService().delete(removeId.value);
        alertService.showInfo(t$('sdiFrontendApp.clientCertification.deleted', { param: removeId.value }).toString(), {
          variant: 'danger',
        });

        clientCertifications.value = clientCertifications.value.filter(cert => cert.id !== removeId.value);
        allClientCertifications.value = allClientCertifications.value.filter(cert => cert.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewClientCertification = async () => {
      if (!newClientCertification.value.client || !newClientCertification.value.certif) {
        alertService.showAlert('Les champs client et certification sont requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          ...newClientCertification.value,
          certification: newClientCertification.value.certif.name,
        };

        const response = await clientCertificationService().create(toSend);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        clientCertifications.value.push(added);
        allClientCertifications.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newClientCertification.value = {
          client: null,
          certif: null,
          certification: '',
          certificationDate: new Date().toISOString().split('T')[0],
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
        };

        alertService.showAlert('Certification client ajoutée avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewClientCertification = () => {
      showAddRow.value = false;
      newClientCertification.value = {
        client: null,
        certif: null,
        certification: '',
        certificationDate: new Date().toISOString().split('T')[0],
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
      };
    };

    const editClientCertification = clientCertification => {
      clientCertifications.value.forEach(cert => (cert.showDropdown = false));
      clientCertification.originalData = JSON.parse(
        JSON.stringify({
          client: clientCertification.client,
          certif: clientCertification.certif,
          certification: clientCertification.certification,
          certificationDate: clientCertification.certificationDate,
          createDate: clientCertification.createDate,
          updateDate: clientCertification.updateDate,
          notes: clientCertification.notes,
        }),
      );
      clientCertification.isEditing = true;
    };

    const saveClientCertification = async clientCertification => {
      if (!clientCertification.client || !clientCertification.certif) {
        alertService.showAlert('Les champs client et certification sont requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: clientCertification.id,
          client: clientCertification.client,
          certif: clientCertification.certif,
          certification: clientCertification.certif.name,
          certificationDate: clientCertification.certificationDate,
          createDate: clientCertification.createDate,
          updateDate: new Date().toISOString().split('T')[0],
          notes: clientCertification.notes,
        };

        const response = await clientCertificationService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = clientCertifications.value.findIndex(cert => cert.id === clientCertification.id);
        if (index !== -1) clientCertifications.value.splice(index, 1, updated);

        const allIndex = allClientCertifications.value.findIndex(cert => cert.id === clientCertification.id);
        if (allIndex !== -1) allClientCertifications.value.splice(allIndex, 1, updated);

        alertService.showAlert('Certification client mise à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = clientCertification => {
      clientCertification.client = clientCertification.originalData.client;
      clientCertification.certif = clientCertification.originalData.certif;
      clientCertification.certification = clientCertification.originalData.certification;
      clientCertification.certificationDate = clientCertification.originalData.certificationDate;
      clientCertification.createDate = clientCertification.originalData.createDate;
      clientCertification.updateDate = clientCertification.originalData.updateDate;
      clientCertification.notes = clientCertification.originalData.notes;
      clientCertification.isEditing = false;
    };

    const toggleDropdown = clientCertification => {
      clientCertifications.value.forEach(cert => {
        if (cert.id !== clientCertification.id) cert.showDropdown = false;
      });
      clientCertification.showDropdown = !clientCertification.showDropdown;
    };

    const viewClientCertification = clientCertification => {
      router.push({ name: 'ClientCertificationView', params: { clientCertificationId: clientCertification.id } });
    };

    watch(
      clientCertifications,
      () => {
        updateTotalItems();
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    onMounted(async () => {
      await Promise.all([retrieveClientCertifications(), retrieveClients(), retrieveCertifications()]);

      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          clientCertifications.value.forEach(cert => (cert.showDropdown = false));
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newClientCertification,
      cancelNewClientCertification,
      saveNewClientCertification,
      clientCertifications,
      clients,
      certifications,
      handleSyncList,
      isFetching,
      retrieveClientCertifications,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientCertification,
      editClientCertification,
      saveClientCertification,
      cancelEdit,
      toggleDropdown,
      viewClientCertification,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedClientCertifications,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      searchTerm,
      handleSearch,
      formatDate,
      selectedClientFilter,
      selectedCertificationFilter,
      applyFilters,
      resetFilters,
      getCertificationStatus,
      getCertificationStatusClass,
      ...dataUtils,
    };
  },
});
