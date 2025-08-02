import { defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ClientTypeService from './client-type.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientType',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientTypes = ref([]);
    const allClientTypes = ref([]); // Pour stocker tous les types de clients non filtrés
    const viewMode = ref('list'); // 'list' ou 'card'
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId = ref(null);
    const removeEntity = ref(null);

    const newClientType = ref({
      type: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
    });

    // Computed properties pour la pagination
    const paginatedClientTypes = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return clientTypes.value.slice(start, end);
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
      if (clientTypes.value) {
        totalItems.value = clientTypes.value.length;
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
          clientTypes.value = [...allClientTypes.value];
        } else {
          const searchTermLower = searchTerm.value.toLowerCase();
          clientTypes.value = allClientTypes.value.filter(
            clientType =>
              clientType.type.toLowerCase().includes(searchTermLower) ||
              (clientType.notes && clientType.notes.toLowerCase().includes(searchTermLower)),
          );
        }
        updateTotalItems();
        currentPage.value = 1; // Retour à la première page après une recherche
      }, 300);
    };

    const retrieveClientTypes = async () => {
      isFetching.value = true;
      try {
        const res = await clientTypeService().retrieve();
        clientTypes.value = res.data.map(clientType => ({
          ...clientType,
          isEditing: false,
          showDropdown: false,
          originalData: { ...clientType },
        }));
        allClientTypes.value = [...clientTypes.value]; // Sauvegarde de tous les types pour la recherche
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClientTypes();
    };

    const prepareRemove = instance => {
      // Fermer tous les dropdowns ouverts
      clientTypes.value.forEach(ct => {
        if (ct.showDropdown) {
          ct.showDropdown = false;
        }
      });

      removeId.value = instance.id;
      removeEntity.value = true;
    };

    const closeDialog = () => {
      removeEntity.value = false;
    };

    const removeClientType = async () => {
      try {
        await clientTypeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.clientType.deleted', { param: removeId.value }).toString();
       // alertService.showInfo(message, { variant: 'danger' });

        // Mettre à jour les listes
        clientTypes.value = clientTypes.value.filter(ct => ct.id !== removeId.value);
        allClientTypes.value = allClientTypes.value.filter(ct => ct.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewClientType = async () => {
      const type = newClientType.value.type?.trim();

      if (!type) {
        alertService.showError('Le champ type est requis.', 'danger');
        return;
      }

      // 🔎 Vérifie si le type existe déjà (insensible à la casse)
      const exists = allClientTypes.value.some(item => item.type?.trim().toLowerCase() === type.toLowerCase());

      if (exists) {
        alertService.showError('Ce type de client existe déjà.', 'danger');
        return;
      }

      try {
        const response = await clientTypeService().create(newClientType.value);
        const addedClientType = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        clientTypes.value.push(addedClientType);
        allClientTypes.value.push(addedClientType);
        updateTotalItems();

        showAddRow.value = false;
        newClientType.value = {
          type: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
        };

        alertService.showSuccess('Type de client ajouté avec succès.', 'success');
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewClientType = () => {
      showAddRow.value = false;
      newClientType.value = {
        type: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
      };
    };

    const editClientType = clientType => {
      // Fermer tous les dropdowns ouverts
      clientTypes.value.forEach(ct => {
        if (ct.showDropdown) {
          ct.showDropdown = false;
        }
      });

      clientType.originalData = { ...clientType };
      clientType.isEditing = true;
    };

    const saveClientType = async clientType => {
      try {
        const dataToSend = {
          id: clientType.id,
          type: clientType.type,
          createDate: clientType.createDate,
          updateDate: clientType.updateDate,
          notes: clientType.notes,
        };

        const response = await clientTypeService().update(dataToSend);

        // Mettre à jour l'objet dans les deux listes
        const updatedClientType = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        const index = clientTypes.value.findIndex(ct => ct.id === clientType.id);
        if (index !== -1) {
          clientTypes.value[index] = updatedClientType;
        }

        const allIndex = allClientTypes.value.findIndex(ct => ct.id === clientType.id);
        if (allIndex !== -1) {
          allClientTypes.value[allIndex] = updatedClientType;
        }

        alertService().showSuccess('Type de client mis à jour avec succès.', 'success');
      } catch (error) {
        alertService().showHttpError(error.response);
      }
    };

    const cancelEdit = clientType => {
      Object.assign(clientType, clientType.originalData);
      clientType.isEditing = false;
    };

    const toggleDropdown = clientType => {
      clientTypes.value.forEach(item => {
        if (item.id !== clientType.id) {
          item.showDropdown = false;
        }
      });
      clientType.showDropdown = !clientType.showDropdown;
    };

    // Surveiller les changements dans clientTypes pour mettre à jour la pagination
    watch(
      clientTypes,
      () => {
        updateTotalItems();
        // Si la page actuelle est supérieure au nombre total de pages, revenir à la dernière page
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    onMounted(async () => {
      await retrieveClientTypes();

      // Fermer les dropdowns quand on clique ailleurs
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          clientTypes.value.forEach(item => {
            item.showDropdown = false;
          });
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newClientType,
      cancelNewClientType,
      saveNewClientType,
      clientTypes,
      handleSyncList,
      isFetching,
      retrieveClientTypes,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientType,
      editClientType,
      saveClientType,
      cancelEdit,
      toggleDropdown,
      t$,
      // Pagination
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedClientTypes,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      // Recherche
      searchTerm,
      handleSearch,
      ...dataUtils,
    };
  },
});
