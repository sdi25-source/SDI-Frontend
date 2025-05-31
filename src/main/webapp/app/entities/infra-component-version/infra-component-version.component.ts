import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import InfraComponentVersionService from './infra-component-version.service';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InfraComponentVersion',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const infraComponentVersions: Ref<IInfraComponentVersion[]> = ref([]);
    const allInfraComponentVersions = ref([]); // Pour stocker toutes les versions non filtrées
    const viewMode = ref('list'); // 'list' ou 'card'
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId = ref(null);
    const removeEntity = ref(null);

    const newInfraComponentVersion = ref({
      version: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      infraComponent: null,
    });

    // Computed properties pour la pagination
    const paginatedInfraComponentVersions = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return infraComponentVersions.value.slice(start, end);
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
      if (infraComponentVersions.value) {
        totalItems.value = infraComponentVersions.value.length;
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
          infraComponentVersions.value = [...allInfraComponentVersions.value];
        } else {
          const searchTermLower = searchTerm.value.toLowerCase();
          infraComponentVersions.value = allInfraComponentVersions.value.filter(
            version =>
              (version.version && version.version.toLowerCase().includes(searchTermLower)) ||
              (version.description && version.description.toLowerCase().includes(searchTermLower)) ||
              (version.infraComponent &&
                version.infraComponent.name &&
                version.infraComponent.name.toLowerCase().includes(searchTermLower)),
          );
        }
        updateTotalItems();
        currentPage.value = 1; // Retour à la première page après une recherche
      }, 300);
    };

    const retrieveInfraComponentVersions = async () => {
      isFetching.value = true;
      try {
        const res = await infraComponentVersionService().retrieve();
        infraComponentVersions.value = res.data.map(version => ({
          ...version,
          isEditing: false,
          showDropdown: false,
          originalData: { ...version },
        }));
        allInfraComponentVersions.value = [...infraComponentVersions.value]; // Sauvegarde de toutes les versions pour la recherche
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveInfraComponentVersions();
    };

    const prepareRemove = instance => {
      // Fermer tous les dropdowns ouverts
      infraComponentVersions.value.forEach(version => {
        if (version.showDropdown) {
          version.showDropdown = false;
        }
      });

      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeInfraComponentVersion = async () => {
      try {
        await infraComponentVersionService().delete(removeId.value);
        const message = t$('sdiFrontendApp.infraComponentVersion.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });

        // Mettre à jour les listes
        infraComponentVersions.value = infraComponentVersions.value.filter(version => version.id !== removeId.value);
        allInfraComponentVersions.value = allInfraComponentVersions.value.filter(version => version.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewInfraComponentVersion = async () => {
      if (!newInfraComponentVersion.value.version) {
        alertService().showAlert('Le champ version est requis.', 'danger');
        return;
      }

      try {
        const response = await infraComponentVersionService().create(newInfraComponentVersion.value);
        const addedVersion = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        infraComponentVersions.value.push(addedVersion);
        allInfraComponentVersions.value.push(addedVersion);
        updateTotalItems();

        showAddRow.value = false;
        newInfraComponentVersion.value = {
          version: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          infraComponent: null,
        };

        alertService().showAlert('Version de composant ajoutée avec succès.', 'success');
      } catch (error) {
        alertService().showHttpError(error.response);
      }
    };

    const cancelNewInfraComponentVersion = () => {
      showAddRow.value = false;
      newInfraComponentVersion.value = {
        version: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        infraComponent: null,
      };
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

        // Mettre à jour l'objet dans les deux listes
        const updatedVersion = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: { ...response },
        };

        const index = infraComponentVersions.value.findIndex(v => v.id === version.id);
        if (index !== -1) {
          infraComponentVersions.value[index] = updatedVersion;
        }

        const allIndex = allInfraComponentVersions.value.findIndex(v => v.id === version.id);
        if (allIndex !== -1) {
          allInfraComponentVersions.value[allIndex] = updatedVersion;
        }

        alertService().showAlert('Version de composant mise à jour avec succès.', 'success');
      } catch (error) {
        alertService().showHttpError(error.response);
      }
    };

    const cancelEdit = version => {
      Object.assign(version, version.originalData);
      version.isEditing = false;
    };

    const toggleDropdown = version => {
      infraComponentVersions.value.forEach(item => {
        if (item.id !== version.id) {
          item.showDropdown = false;
        }
      });
      version.showDropdown = !version.showDropdown;
    };

    // Surveiller les changements dans infraComponentVersions pour mettre à jour la pagination
    watch(
      infraComponentVersions,
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
      await retrieveInfraComponentVersions();

      // Fermer les dropdowns quand on clique ailleurs
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          infraComponentVersions.value.forEach(item => {
            item.showDropdown = false;
          });
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newInfraComponentVersion,
      cancelNewInfraComponentVersion,
      saveNewInfraComponentVersion,
      infraComponentVersions,
      handleSyncList,
      isFetching,
      retrieveInfraComponentVersions,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeInfraComponentVersion,
      editInfraComponentVersion,
      saveInfraComponentVersion,
      cancelEdit,
      toggleDropdown,
      t$,
      // Pagination
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedInfraComponentVersions,
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
