import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ComponentTypeService from './component-type.service';
import { type IComponentType } from '@/shared/model/component-type.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ComponentType',
  setup() {
    const { t: t$ } = useI18n();
    const componentTypeService = inject('componentTypeService', () => new ComponentTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const componentTypes: Ref<IComponentType[]> = ref([]);
    const allComponentTypes: Ref<IComponentType[]> = ref([]); // Pour stocker tous les types non filtrés
    const viewMode = ref('list'); // 'list' ou 'card'
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);

    const newComponentType = ref({
      type: '',
    });

    // Computed properties pour la pagination
    const paginatedComponentTypes = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return componentTypes.value.slice(start, end);
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
      if (componentTypes.value) {
        totalItems.value = componentTypes.value.length;
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
          componentTypes.value = [...allComponentTypes.value];
        } else {
          const searchTermLower = searchTerm.value.toLowerCase();
          componentTypes.value = allComponentTypes.value.filter(componentType =>
            componentType.type.toLowerCase().includes(searchTermLower),
          );
        }
        updateTotalItems();
        currentPage.value = 1; // Retour à la première page après une recherche
      }, 300);
    };

    const clear = () => {
      // Réinitialiser les filtres ou l'état si nécessaire
      searchTerm.value = '';
      componentTypes.value = [...allComponentTypes.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveComponentTypes = async () => {
      isFetching.value = true;
      try {
        const res = await componentTypeService().retrieve();
        componentTypes.value = res.data.map(componentType => ({
          ...componentType,
          isEditing: false,
          showDropdown: false,
          originalData: { ...componentType },
        }));
        allComponentTypes.value = [...componentTypes.value]; // Sauvegarde de tous les types pour la recherche
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveComponentTypes();
    };

    const prepareRemove = (instance: IComponentType) => {
      // Fermer tous les dropdowns ouverts
      componentTypes.value.forEach(ct => {
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

    const removeComponentType = async () => {
      try {
        await componentTypeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.componentType.deleted', { param: removeId.value }).toString();
        //alertService.showInfo(message, { variant: 'danger' });

        // Mettre à jour les listes
        componentTypes.value = componentTypes.value.filter(ct => ct.id !== removeId.value);
        allComponentTypes.value = allComponentTypes.value.filter(ct => ct.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewComponentType = async () => {
      const newType = newComponentType.value.type?.trim();

      if (!newType) {
        alertService().showError('Le champ type est requis.', 'danger');
        return;
      }

      // 🔎 Vérifie si le type existe déjà
      const exists = allComponentTypes.value.some(item => item.type?.trim().toLowerCase() === newType.toLowerCase());

      if (exists) {
        alertService().showError('Ce type de composant existe déjà.', 'danger');
        return;
      }

      try {
        const response = await componentTypeService().create(newComponentType.value);
        const addedComponentType = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        componentTypes.value.push(addedComponentType);
        allComponentTypes.value.push(addedComponentType);
        updateTotalItems();

        showAddRow.value = false;
        newComponentType.value = {
          type: '',
        };

        alertService().showSuccess('Type de composant ajouté avec succès.', 'success');
      } catch (error) {
        alertService().showHttpError(error.response);
      }
    };

    const cancelNewComponentType = () => {
      showAddRow.value = false;
      newComponentType.value = {
        type: '',
      };
    };

    const editComponentType = componentType => {
      // Fermer tous les dropdowns ouverts
      componentTypes.value.forEach(ct => {
        if (ct.showDropdown) {
          ct.showDropdown = false;
        }
      });

      componentType.originalData = { ...componentType };
      componentType.isEditing = true;
    };

    const saveComponentType = async componentType => {
      try {
        const dataToSend = {
          id: componentType.id,
          type: componentType.type,
        };

        const response = await componentTypeService().update(dataToSend);

        // Mettre à jour l'objet dans les deux listes
        const updatedComponentType = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        const index = componentTypes.value.findIndex(ct => ct.id === componentType.id);
        if (index !== -1) {
          componentTypes.value[index] = updatedComponentType;
        }

        const allIndex = allComponentTypes.value.findIndex(ct => ct.id === componentType.id);
        if (allIndex !== -1) {
          allComponentTypes.value[allIndex] = updatedComponentType;
        }

        alertService().showSuccess('Type de composant mis à jour avec succès.', 'success');
      } catch (error) {
        alertService().showHttpError(error.response);
      }
    };

    const cancelEdit = componentType => {
      Object.assign(componentType, componentType.originalData);
      componentType.isEditing = false;
    };

    const toggleDropdown = componentType => {
      componentTypes.value.forEach(item => {
        if (item.id !== componentType.id) {
          item.showDropdown = false;
        }
      });
      componentType.showDropdown = !componentType.showDropdown;
    };

    // Surveiller les changements dans componentTypes pour mettre à jour la pagination
    watch(
      componentTypes,
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
      await retrieveComponentTypes();

      // Fermer les dropdowns quand on clique ailleurs
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          componentTypes.value.forEach(item => {
            item.showDropdown = false;
          });
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newComponentType,
      cancelNewComponentType,
      saveNewComponentType,
      componentTypes,
      handleSyncList,
      isFetching,
      retrieveComponentTypes,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeComponentType,
      editComponentType,
      saveComponentType,
      cancelEdit,
      toggleDropdown,
      clear,
      t$,
      // Pagination
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedComponentTypes,
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
