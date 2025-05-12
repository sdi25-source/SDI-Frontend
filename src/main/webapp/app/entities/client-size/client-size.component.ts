import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ClientSizeService from './client-size.service';
import { type IClientSize } from '@/shared/model/client-size.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientSize',
  setup() {
    const { t: t$ } = useI18n();
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientSizes: Ref<IClientSize[]> = ref([]);
    const allClientSizes: Ref<IClientSize[]> = ref([]); // Pour stocker tous les éléments non filtrés
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);

    const newClientSize = ref({
      sizeName: '',
      sizeCode: '',
      sizeDescription: '',
    });

    // Computed properties pour la pagination
    const paginatedClientSizes = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return clientSizes.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / itemsPerPage.value);
    });

    const isPrevDisabled = computed(() => {
      return currentPage.value <= 1;
    });

    const isNextDisabled = computed(() => {
      return currentPage.value >= totalPages.value;
    });

    const paginationInfo = computed(() => {
      if (totalItems.value === 0) return '0-0 / 0';

      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(start + itemsPerPage.value - 1, totalItems.value);
      return `${start}-${end} / ${totalItems.value}`;
    });

    // Méthodes de pagination
    const goToNextPage = () => {
      if (!isNextDisabled.value) {
        currentPage.value++;
      }
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) {
        currentPage.value--;
      }
    };

    const updateTotalItems = () => {
      if (clientSizes.value) {
        totalItems.value = clientSizes.value.length;
      } else {
        totalItems.value = 0;
      }
    };

    // Méthode de recherche
    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          clientSizes.value = [...allClientSizes.value];
        } else {
          const searchTermLower = searchTerm.value.toLowerCase();
          clientSizes.value = allClientSizes.value.filter(clientSize =>
            Object.values(clientSize).some(
              value => value && value.toString().toLowerCase().includes(searchTermLower)
            )
          );
        }
        updateTotalItems();
        currentPage.value = 1; // Retour à la première page après une recherche
      }, 300);
    };

    const clear = () => {
      searchTerm.value = '';
      clientSizes.value = [...allClientSizes.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveClientSizes = async () => {
      isFetching.value = true;
      try {
        const res = await clientSizeService().retrieve();
        clientSizes.value = res.data.map(clientSize => ({
          ...clientSize,
          isEditing: false,
          originalData: { ...clientSize },
        }));
        allClientSizes.value = [...clientSizes.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClientSizes();
    };

    const prepareRemove = (instance: IClientSize) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeClientSize = async () => {
      try {
        await clientSizeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.clientSize.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });

        // Mettre à jour les listes
        clientSizes.value = clientSizes.value.filter(cs => cs.id !== removeId.value);
        allClientSizes.value = allClientSizes.value.filter(cs => cs.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewClientSize = async () => {
      if (!newClientSize.value.sizeName || !newClientSize.value.sizeCode) {
        alertService.showAlert('Les champs Nom et Code sont requis.', 'danger');
        return;
      }

      try {
        const response = await clientSizeService().create(newClientSize.value);
        const addedClientSize = {
          ...response,
          isEditing: false,
          originalData: { ...response },
        };

        clientSizes.value.push(addedClientSize);
        allClientSizes.value.push(addedClientSize);
        updateTotalItems();

        showAddRow.value = false;
        newClientSize.value = {
          sizeName: '',
          sizeCode: '',
          sizeDescription: '',
        };

        alertService.showAlert('Taille de client ajoutée avec succès.', 'success');
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewClientSize = () => {
      showAddRow.value = false;
      newClientSize.value = {
        sizeName: '',
        sizeCode: '',
        sizeDescription: '',
      };
    };

    const editClientSize = clientSize => {
      clientSize.originalData = { ...clientSize };
      clientSize.isEditing = true;
    };

    const saveClientSize = async clientSize => {
      try {
        const dataToSend = {
          id: clientSize.id,
          sizeName: clientSize.sizeName,
          sizeCode: clientSize.sizeCode,
          sizeDescription: clientSize.sizeDescription,
        };

        const response = await clientSizeService().update(dataToSend);

        // Mettre à jour l'objet dans les deux listes
        const updatedClientSize = {
          ...response,
          isEditing: false,
          originalData: { ...response },
        };

        const index = clientSizes.value.findIndex(cs => cs.id === clientSize.id);
        if (index !== -1) {
          clientSizes.value[index] = updatedClientSize;
        }

        const allIndex = allClientSizes.value.findIndex(cs => cs.id === clientSize.id);
        if (allIndex !== -1) {
          allClientSizes.value[allIndex] = updatedClientSize;
        }

        alertService.showAlert('Taille de client mise à jour avec succès.', 'success');
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = clientSize => {
      Object.assign(clientSize, clientSize.originalData);
      clientSize.isEditing = false;
    };

    // Surveiller les changements dans clientSizes pour mettre à jour la pagination
    watch(
      clientSizes,
      () => {
        updateTotalItems();
        // Si la page actuelle est supérieure au nombre total de pages, revenir à la dernière page
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true }
    );

    onMounted(async () => {
      await retrieveClientSizes();
    });

    return {
      clientSizes,
      handleSyncList,
      isFetching,
      retrieveClientSizes,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientSize,
      editClientSize,
      saveClientSize,
      cancelEdit,
      t$,
      // Nouveaux éléments
      showAddRow,
      newClientSize,
      saveNewClientSize,
      cancelNewClientSize,
      // Pagination
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedClientSizes,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      // Recherche
      searchTerm,
      handleSearch,
    };
  },
});
