import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import ClientEventTypeService from './client-event-type.service';
import { type IClientEventType } from '@/shared/model/client-event-type.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEventType',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const clientEventTypeService = inject('clientEventTypeService', () => new ClientEventTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientEventTypes: Ref<IClientEventType[]> = ref([]);
    const allClientEventTypes: Ref<IClientEventType[]> = ref([]);
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

    const newClientEventType = ref({
      type: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
    });

    const paginatedClientEventTypes = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return clientEventTypes.value.slice(start, end);
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

    const getEventTypeClass = (type) => {
      if (!type) return '';

      const typeLower = type.toLowerCase();

      if (typeLower.includes('meeting') || typeLower.includes('réunion')) {
        return 'type-meeting';
      } else if (typeLower.includes('call') || typeLower.includes('appel')) {
        return 'type-call';
      } else if (typeLower.includes('email') || typeLower.includes('mail')) {
        return 'type-email';
      } else if (typeLower.includes('visit') || typeLower.includes('visite')) {
        return 'type-visit';
      } else if (typeLower.includes('demo') || typeLower.includes('présentation')) {
        return 'type-demo';
      } else if (typeLower.includes('follow') || typeLower.includes('suivi')) {
        return 'type-followup';
      } else {
        return 'type-other';
      }
    };

    const goToNextPage = () => {
      if (!isNextDisabled.value) currentPage.value++;
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) currentPage.value--;
    };

    const updateTotalItems = () => {
      totalItems.value = clientEventTypes.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          clientEventTypes.value = [...allClientEventTypes.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          clientEventTypes.value = allClientEventTypes.value.filter(type =>
            (type.type && type.type.toLowerCase().includes(searchLower)) ||
            (type.description && type.description.toLowerCase().includes(searchLower))
          );
        }
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    const clear = () => {
      searchTerm.value = '';
      clientEventTypes.value = [...allClientEventTypes.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveClientEventTypes = async () => {
      isFetching.value = true;
      try {
        const res = await clientEventTypeService().retrieve();
        clientEventTypes.value = res.data.map(type => ({
          ...type,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(type)),
        }));
        allClientEventTypes.value = [...clientEventTypes.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => retrieveClientEventTypes();

    const prepareRemove = (instance: IClientEventType) => {
      clientEventTypes.value.forEach(type => (type.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => removeEntity.value.hide();

    const removeClientEventType = async () => {
      try {
        await clientEventTypeService().delete(removeId.value);
        alertService.showInfo(
          t$('sdiFrontendApp.clientEventType.deleted', { param: removeId.value }).toString(),
          { variant: 'danger' }
        );

        clientEventTypes.value = clientEventTypes.value.filter(type => type.id !== removeId.value);
        allClientEventTypes.value = allClientEventTypes.value.filter(type => type.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewClientEventType = async () => {
      if (!newClientEventType.value.type) {
        alertService.showAlert('Le champ type est requis.', 'danger');
        return;
      }

      try {
        const response = await clientEventTypeService().create(newClientEventType.value);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        clientEventTypes.value.push(added);
        allClientEventTypes.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newClientEventType.value = {
          type: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
        };

        alertService.showAlert('Type d\'événement ajouté avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewClientEventType = () => {
      showAddRow.value = false;
      newClientEventType.value = {
        type: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
      };
    };

    const editClientEventType = clientEventType => {
      clientEventTypes.value.forEach(type => (type.showDropdown = false));
      clientEventType.originalData = JSON.parse(JSON.stringify({
        type: clientEventType.type,
        description: clientEventType.description,
        createDate: clientEventType.createDate,
        updateDate: clientEventType.updateDate,
      }));
      clientEventType.isEditing = true;
    };

    const saveClientEventType = async clientEventType => {
      if (!clientEventType.type) {
        alertService.showAlert('Le champ type est requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: clientEventType.id,
          type: clientEventType.type,
          description: clientEventType.description,
          createDate: clientEventType.createDate,
          updateDate: new Date().toISOString().split('T')[0],
        };

        const response = await clientEventTypeService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = clientEventTypes.value.findIndex(type => type.id === clientEventType.id);
        if (index !== -1) clientEventTypes.value.splice(index, 1, updated);

        const allIndex = allClientEventTypes.value.findIndex(type => type.id === clientEventType.id);
        if (allIndex !== -1) allClientEventTypes.value.splice(allIndex, 1, updated);

        alertService.showAlert('Type d\'événement mis à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = clientEventType => {
      clientEventType.type = clientEventType.originalData.type;
      clientEventType.description = clientEventType.originalData.description;
      clientEventType.createDate = clientEventType.originalData.createDate;
      clientEventType.updateDate = clientEventType.originalData.updateDate;
      clientEventType.isEditing = false;
    };

    const toggleDropdown = clientEventType => {
      clientEventTypes.value.forEach(type => {
        if (type.id !== clientEventType.id) type.showDropdown = false;
      });
      clientEventType.showDropdown = !clientEventType.showDropdown;
    };

    const viewClientEventType = clientEventType => {
      router.push({ name: 'ClientEventTypeView', params: { clientEventTypeId: clientEventType.id } });
    };

    watch(clientEventTypes, () => {
      updateTotalItems();
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
      }
    }, { deep: true });

    onMounted(async () => {
      await retrieveClientEventTypes();
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          clientEventTypes.value.forEach(type => (type.showDropdown = false));
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newClientEventType,
      cancelNewClientEventType,
      saveNewClientEventType,
      clientEventTypes,
      handleSyncList,
      isFetching,
      retrieveClientEventTypes,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientEventType,
      editClientEventType,
      saveClientEventType,
      cancelEdit,
      toggleDropdown,
      viewClientEventType,
      clear,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedClientEventTypes,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      searchTerm,
      handleSearch,
      formatDate,
      getEventTypeClass,
    };
  },
});
