import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import DomaineService from './domaine.service';
import { type IDomaine } from '@/shared/model/domaine.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Domaine',
  setup() {
    const { t: t$ } = useI18n();
    const domaineService = inject('domaineService', () => new DomaineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const domaines: Ref<IDomaine[]> = ref([]);
    const allDomaines: Ref<IDomaine[]> = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const newDomaine = ref({
      name: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);

    // Computed properties
    const paginatedDomaines = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return domaines.value.slice(start, end);
    });

    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

    const isPrevDisabled = computed(() => currentPage.value <= 1);
    const isNextDisabled = computed(() => currentPage.value >= totalPages.value);

    const paginationInfo = computed(() => {
      if (totalItems.value === 0) return '0-0 / 0';
      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(start + itemsPerPage.value - 1, totalItems.value);
      return `${start}-${end} / ${totalItems.value}`;
    });

    // Methods
    const goToNextPage = () => {
      if (!isNextDisabled.value) currentPage.value++;
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) currentPage.value--;
    };

    const updateTotalItems = () => {
      totalItems.value = domaines.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          domaines.value = [...allDomaines.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          domaines.value = allDomaines.value.filter(pl =>
            Object.values(pl).some(val => typeof val === 'string' && val.toLowerCase().includes(searchLower)),
          );
        }
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    const clear = () => {
      searchTerm.value = '';
      domaines.value = [...allDomaines.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveDomaines = async () => {
      isFetching.value = true;
      try {
        const res = await domaineService().retrieve();
        domaines.value = res.data.map(d => ({
          ...d,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(d)), // Deep clone
        }));
        allDomaines.value = [...domaines.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => retrieveDomaines();

    const prepareRemove = (instance: IDomaine) => {
      domaines.value.forEach(d => (d.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => removeEntity.value.hide();

    const removeDomaine = async () => {
      try {
        await domaineService().delete(removeId.value);
        alertService.showInfo(t$('sdiFrontendApp.domaine.deleted', { param: removeId.value }).toString(), { variant: 'danger' });

        domaines.value = domaines.value.filter(d => d.id !== removeId.value);
        allDomaines.value = allDomaines.value.filter(d => d.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewDomaine = async () => {
      const domainName = newDomaine.value.name?.trim();

      if (!domainName) {
        alertService.showError('Le champ nom est requis.', 'danger');
        return;
      }

      // 🔍 Vérification de la duplication
      const existing = allDomaines.value.find(d => d.name.trim().toLowerCase() === domainName.toLowerCase());

      if (existing) {
        alertService.showError('Ce domaine existe déjà.', 'danger');
        return;
      }

      try {
        const response = await domaineService().create(newDomaine.value);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        domaines.value.push(added);
        allDomaines.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newDomaine.value = {
          name: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
        };

        alertService.showSuccess('Domaine ajouté avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewDomaine = () => {
      showAddRow.value = false;
      newDomaine.value = {
        name: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
      };
    };

    const editDomaine = domaine => {
      domaines.value.forEach(d => (d.showDropdown = false));
      domaine.originalData = JSON.parse(
        JSON.stringify({
          name: domaine.name,
          createDate: domaine.createDate,
          updateDate: domaine.updateDate,
          notes: domaine.notes,
        }),
      );
      domaine.isEditing = true;
    };

    const saveDomaine = async domaine => {
      try {
        const toSend = {
          id: domaine.id,
          name: domaine.name,
          createDate: domaine.createDate,
          updateDate: new Date().toISOString().split('T')[0],
          notes: domaine.notes,
        };

        const response = await domaineService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = domaines.value.findIndex(d => d.id === domaine.id);
        if (index !== -1) domaines.value.splice(index, 1, updated);

        const allIndex = allDomaines.value.findIndex(d => d.id === domaine.id);
        if (allIndex !== -1) allDomaines.value.splice(allIndex, 1, updated);

        alertService.showSuccess('Domaine mis à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = domaine => {
      domaine.name = domaine.originalData.name;
      domaine.createDate = domaine.originalData.createDate;
      domaine.updateDate = domaine.originalData.updateDate;
      domaine.notes = domaine.originalData.notes;
      domaine.isEditing = false;
    };

    const toggleDropdown = domaine => {
      domaines.value.forEach(d => {
        if (d.id !== domaine.id) d.showDropdown = false;
      });
      domaine.showDropdown = !domaine.showDropdown;
    };

    // Watchers
    watch(
      domaines,
      () => {
        updateTotalItems();
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    // Lifecycle hooks
    onMounted(async () => {
      await retrieveDomaines();
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          domaines.value.forEach(d => (d.showDropdown = false));
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newDomaine,
      cancelNewDomaine,
      saveNewDomaine,
      domaines,
      handleSyncList,
      isFetching,
      retrieveDomaines,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeDomaine,
      editDomaine,
      saveDomaine,
      cancelEdit,
      toggleDropdown,
      clear,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedDomaines,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      searchTerm,
      handleSearch,
    };
  },
});
