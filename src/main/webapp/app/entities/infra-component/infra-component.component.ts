import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import InfraComponentService from './infra-component.service';
import InfraComponentVersionService from '../infra-component-version/infra-component-version.service';
import { type IInfraComponent } from '@/shared/model/infra-component.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';
import ComponentTypeService from '@/entities/component-type/component-type.service.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InfraComponent',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const componentTypeService = inject('componentTypeService', () => new ComponentTypeService());
    const infraComponentService = inject('infraComponentService', () => new InfraComponentService());
    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const infraComponents: Ref<IInfraComponent[]> = ref([]);
    const allInfraComponents = ref([]);
    const componentTypes = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId = ref(null);
    const removeEntity = ref(null);

    const newInfraComponent = ref({
      name: '',
      vendor: '',
      notes: '',
      createDate: new Date().toISOString().split('T')[0],
      componentType: null,
    });

    // Variables pour le modal des versions
    const versionsModal = ref(null);
    const selectedComponent = ref(null);
    const infraComponentVersions = ref([]);
    const allInfraComponentVersions = ref([]);
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
      updateDate: new Date().toISOString().split('T')[0],
      infraComponent: null,
    });

    // Computed properties pour la pagination
    const paginatedInfraComponents = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return infraComponents.value.slice(start, end);
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
      if (infraComponents.value) {
        totalItems.value = infraComponents.value.length;
      } else {
        totalItems.value = 0;
      }
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

    // Méthode de recherche
    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          infraComponents.value = [...allInfraComponents.value];
        } else {
          const searchTermLower = searchTerm.value.toLowerCase();
          infraComponents.value = allInfraComponents.value.filter(
            component =>
              (component.name && component.name.toLowerCase().includes(searchTermLower)) ||
              (component.vendor && component.vendor.toLowerCase().includes(searchTermLower)) ||
              (component.notes && component.notes.toLowerCase().includes(searchTermLower)) ||
              (component.componentType &&
                component.componentType.type &&
                component.componentType.type.toLowerCase().includes(searchTermLower)),
          );
        }
        updateTotalItems();
        currentPage.value = 1; // Retour à la première page après une recherche
      }, 300);
    };

    // Méthode de recherche pour les versions
    const handleVersionSearch = () => {
      if (versionSearchTimeout.value) {
        clearTimeout(versionSearchTimeout.value);
      }

      versionSearchTimeout.value = setTimeout(() => {
        if (versionSearchTerm.value.trim() === '') {
          filteredVersions.value = [...infraComponentVersions.value];
        } else {
          const searchTermLower = versionSearchTerm.value.toLowerCase();
          filteredVersions.value = infraComponentVersions.value.filter(
            version =>
              (version.version && version.version.toLowerCase().includes(searchTermLower)) ||
              (version.description && version.description.toLowerCase().includes(searchTermLower)),
          );
        }
        updateVersionTotalItems();
        versionCurrentPage.value = 1; // Retour à la première page après une recherche
      }, 300);
    };

    const retrieveInfraComponents = async () => {
      isFetching.value = true;
      try {
        const res = await infraComponentService().retrieve();
        infraComponents.value = res.data.map(component => ({
          ...component,
          isEditing: false,
          showDropdown: false,
          originalData: { ...component },
        }));
        allInfraComponents.value = [...infraComponents.value]; // Sauvegarde de tous les composants pour la recherche
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const retrieveComponentTypes = async () => {
      try {
        const res = await componentTypeService().retrieve();
        componentTypes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const handleSyncList = () => {
      retrieveInfraComponents();
    };

    const prepareRemove = (instance: IInfraComponent) => {
      // Fermer tous les dropdowns ouverts
      infraComponents.value.forEach(component => {
        if (component.showDropdown) {
          component.showDropdown = false;
        }
      });

      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeInfraComponent = async () => {
      try {
        await infraComponentService().delete(removeId.value);
        const message = t$('sdiFrontendApp.infraComponent.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });

        // Mettre à jour les listes
        infraComponents.value = infraComponents.value.filter(component => component.id !== removeId.value);
        allInfraComponents.value = allInfraComponents.value.filter(component => component.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const editInfraComponent = component => {
      // Fermer tous les dropdowns ouverts
      infraComponents.value.forEach(c => {
        if (c.showDropdown) {
          c.showDropdown = false;
        }
      });

      component.originalData = { ...component };
      component.isEditing = true;
    };

    const saveInfraComponent = async component => {
      try {
        const dataToSend = {
          id: component.id,
          name: component.name,
          vendor: component.vendor,
          notes: component.notes,
          createDate: component.createDate,
          componentType: component.componentType,
        };

        const response = await infraComponentService().update(dataToSend);

        // Mettre à jour l'objet dans les deux listes
        const updatedComponent = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        const index = infraComponents.value.findIndex(c => c.id === component.id);
        if (index !== -1) {
          infraComponents.value[index] = updatedComponent;
        }

        const allIndex = allInfraComponents.value.findIndex(c => c.id === component.id);
        if (allIndex !== -1) {
          allInfraComponents.value[allIndex] = updatedComponent;
        }

        alertService.showInfo('Composant mis à jour avec succès.', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = component => {
      Object.assign(component, component.originalData);
      component.isEditing = false;
    };

    const saveNewInfraComponent = async () => {
      if (!newInfraComponent.value.name) {
        alertService.showInfo('Le champ nom est requis.', { variant: 'danger' });
        return;
      }

      try {
        const response = await infraComponentService().create(newInfraComponent.value);
        const addedComponent = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        infraComponents.value.push(addedComponent);
        allInfraComponents.value.push(addedComponent);
        updateTotalItems();

        showAddRow.value = false;
        newInfraComponent.value = {
          name: '',
          vendor: '',
          notes: '',
          createDate: new Date().toISOString().split('T')[0],
          componentType: null,
        };

        alertService.showInfo('Composant ajouté avec succès.', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewInfraComponent = () => {
      showAddRow.value = false;
      newInfraComponent.value = {
        name: '',
        vendor: '',
        notes: '',
        createDate: new Date().toISOString().split('T')[0],
        componentType: null,
      };
    };

    const toggleDropdown = component => {
      infraComponents.value.forEach(item => {
        if (item.id !== component.id) {
          item.showDropdown = false;
        }
      });
      component.showDropdown = !component.showDropdown;
    };

    // Méthodes pour le modal des versions
    const openVersionsModal = async component => {
      selectedComponent.value = component;

      // Réinitialiser les variables de pagination et de recherche
      versionCurrentPage.value = 1;
      versionSearchTerm.value = '';

      // Récupérer les versions pour ce composant
      await retrieveVersionsForComponent(component.id);

      // Initialiser la nouvelle version avec le composant sélectionné
      newVersion.value = {
        version: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        infraComponent: component,
      };

      // Ouvrir le modal
      versionsModal.value.show();
    };

    const closeVersionsModal = () => {
      versionsModal.value.hide();
      showAddVersionRow.value = false;
    };

    const retrieveVersionsForComponent = async componentId => {
      isVersionFetching.value = true;
      try {
        // Récupérer toutes les versions
        const res = await infraComponentVersionService().retrieve();

        // Filtrer les versions pour ce composant
        const componentVersions = res.data
          .filter(version => version.infraComponent && version.infraComponent.id === componentId)
          .map(version => ({
            ...version,
            isEditing: false,
            showDropdown: false,
            originalData: { ...version },
          }));

        infraComponentVersions.value = componentVersions;
        allInfraComponentVersions.value = [...componentVersions];
        filteredVersions.value = [...componentVersions];
        updateVersionTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isVersionFetching.value = false;
      }
    };

    const toggleVersionDropdown = version => {
      infraComponentVersions.value.forEach(item => {
        if (item.id !== version.id) {
          item.showDropdown = false;
        }
      });
      version.showDropdown = !version.showDropdown;
    };

    const editInfraComponentVersion = version => {
      // Fermer tous les dropdowns ouverts
      infraComponentVersions.value.forEach(v => {
        if (v.showDropdown) {
          v.showDropdown = false;
        }
      });

      version.originalData = { ...version };
      version.isEditing = true;
    };

    const saveInfraComponentVersion = async version => {
      try {
        const dataToSend = {
          id: version.id,
          version: version.version,
          description: version.description,
          createDate: version.createDate,
          updateDate: version.updateDate,
          infraComponent: version.infraComponent,
        };

        const response = await infraComponentVersionService().update(dataToSend);

        // Mettre à jour l'objet dans les listes
        const updatedVersion = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        // Mettre à jour dans les différentes listes
        const updateInList = (list, updatedItem) => {
          const index = list.findIndex(item => item.id === updatedItem.id);
          if (index !== -1) {
            list[index] = updatedItem;
          }
        };

        updateInList(infraComponentVersions.value, updatedVersion);
        updateInList(allInfraComponentVersions.value, updatedVersion);
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
        const response = await infraComponentVersionService().create(newVersion.value);
        const addedVersion = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        // Ajouter aux différentes listes
        infraComponentVersions.value.push(addedVersion);
        allInfraComponentVersions.value.push(addedVersion);
        filteredVersions.value.push(addedVersion);
        updateVersionTotalItems();

        showAddVersionRow.value = false;
        newVersion.value = {
          version: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          infraComponent: selectedComponent.value,
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
        infraComponent: selectedComponent.value,
      };
    };

    const prepareRemoveVersion = version => {
      // Fermer tous les dropdowns ouverts
      infraComponentVersions.value.forEach(v => {
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

    const removeInfraComponentVersion = async () => {
      try {
        await infraComponentVersionService().delete(removeVersionId.value);
        const message = t$('sdiFrontendApp.infraComponentVersion.deleted', { param: removeVersionId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });

        // Mettre à jour les listes
        const removeFromList = (list, id) => {
          return list.filter(item => item.id !== id);
        };

        infraComponentVersions.value = removeFromList(infraComponentVersions.value, removeVersionId.value);
        allInfraComponentVersions.value = removeFromList(allInfraComponentVersions.value, removeVersionId.value);
        filteredVersions.value = removeFromList(filteredVersions.value, removeVersionId.value);
        updateVersionTotalItems();

        removeVersionId.value = null;
        closeVersionDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Surveiller les changements dans infraComponents pour mettre à jour la pagination
    watch(
      infraComponents,
      () => {
        updateTotalItems();
        // Si la page actuelle est supérieure au nombre total de pages, revenir à la dernière page
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    // Surveiller les changements dans filteredVersions pour mettre à jour la pagination
    watch(
      filteredVersions,
      () => {
        updateVersionTotalItems();
        // Si la page actuelle est supérieure au nombre total de pages, revenir à la dernière page
        if (versionCurrentPage.value > versionTotalPages.value && versionTotalPages.value > 0) {
          versionCurrentPage.value = versionTotalPages.value;
        }
      },
      { deep: true },
    );

    onMounted(async () => {
      await retrieveInfraComponents();
      await retrieveComponentTypes();

      // Initialiser les références aux modals
      versionsModal.value = ref('versionsModal');
      removeEntity.value = ref('removeEntity');
      removeVersionEntity.value = ref('removeVersionEntity');

      // Fermer les dropdowns quand on clique ailleurs
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          infraComponents.value.forEach(item => {
            item.showDropdown = false;
          });
          infraComponentVersions.value.forEach(item => {
            item.showDropdown = false;
          });
        }
      });
    });

    return {
      viewMode,
      infraComponents,
      componentTypes,
      handleSyncList,
      isFetching,
      retrieveInfraComponents,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeInfraComponent,
      editInfraComponent,
      saveInfraComponent,
      cancelEdit,
      toggleDropdown,
      t$,
      // Pagination
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedInfraComponents,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      // Recherche
      searchTerm,
      handleSearch,
      // Ajout
      showAddRow,
      newInfraComponent,
      saveNewInfraComponent,
      cancelNewInfraComponent,
      // Modal versions
      versionsModal,
      selectedComponent,
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
      editInfraComponentVersion,
      saveInfraComponentVersion,
      cancelVersionEdit,
      toggleVersionDropdown,
      prepareRemoveVersion,
      removeVersionId,
      removeVersionEntity,
      closeVersionDialog,
      removeInfraComponentVersion,
      ...dataUtils,
    };
  },
});
