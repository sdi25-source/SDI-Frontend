import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import DeployementTypeService from './deployement-type.service';
import { type IDeployementType } from '@/shared/model/deployement-type.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'DeployementType',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const dataUtils = useDataUtils();
    const deployementTypeService = inject('deployementTypeService', () => new DeployementTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const deployementTypes: Ref<IDeployementType[]> = ref([]);
    const allDeployementTypes: Ref<IDeployementType[]> = ref([]);
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

    const newDeployementType = ref({
      type: '',
      notes: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0]
    });

    const paginatedDeployementTypes = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return deployementTypes.value.slice(start, end);
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

    const goToNextPage = () => {
      if (!isNextDisabled.value) currentPage.value++;
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) currentPage.value--;
    };

    const updateTotalItems = () => {
      totalItems.value = deployementTypes.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          deployementTypes.value = [...allDeployementTypes.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          deployementTypes.value = allDeployementTypes.value.filter(dt =>
            Object.values(dt).some(
              val => typeof val === 'string' && val.toLowerCase().includes(searchLower)
            )
          );
        }
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    const clear = () => {
      searchTerm.value = '';
      deployementTypes.value = [...allDeployementTypes.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveDeployementTypes = async () => {
      isFetching.value = true;
      try {
        const res = await deployementTypeService().retrieve();
        deployementTypes.value = res.data.map(dt => ({
          ...dt,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(dt)),
        }));
        allDeployementTypes.value = [...deployementTypes.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveDeployementTypes();
    };

    const prepareRemove = (instance: IDeployementType) => {
      deployementTypes.value.forEach(dt => (dt.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeDeployementType = async () => {
      try {
        await deployementTypeService().delete(removeId.value);
        alertService.showInfo(
          t$('sdiFrontendApp.deployementType.deleted', { param: removeId.value }).toString(),
          { variant: 'danger' }
        );

        deployementTypes.value = deployementTypes.value.filter(dt => dt.id !== removeId.value);
        allDeployementTypes.value = allDeployementTypes.value.filter(dt => dt.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewDeployementType = async () => {
      if (!newDeployementType.value.type) {
        alertService.showAlert('Le champ type est requis.', 'danger');
        return;
      }

      try {
        const response = await deployementTypeService().create(newDeployementType.value);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        deployementTypes.value.push(added);
        allDeployementTypes.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newDeployementType.value = {
          type: '',
          notes: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0]
        };

        alertService.showAlert('Type de déploiement ajouté avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewDeployementType = () => {
      showAddRow.value = false;
      newDeployementType.value = {
        type: '',
        notes: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0]
      };
    };

    const editDeployementType = deployementType => {
      deployementTypes.value.forEach(dt => (dt.showDropdown = false));
      deployementType.originalData = JSON.parse(JSON.stringify({
        type: deployementType.type,
        notes: deployementType.notes,
        createDate: deployementType.createDate,
        updateDate: deployementType.updateDate
      }));
      deployementType.isEditing = true;
    };

    const saveDeployementType = async deployementType => {
      if (!deployementType.type) {
        alertService.showAlert('Le champ type est requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: deployementType.id,
          type: deployementType.type,
          notes: deployementType.notes,
          createDate: deployementType.createDate,
          updateDate: new Date().toISOString().split('T')[0]
        };

        const response = await deployementTypeService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = deployementTypes.value.findIndex(dt => dt.id === deployementType.id);
        if (index !== -1) deployementTypes.value.splice(index, 1, updated);

        const allIndex = allDeployementTypes.value.findIndex(dt => dt.id === deployementType.id);
        if (allIndex !== -1) allDeployementTypes.value.splice(allIndex, 1, updated);

        alertService.showAlert('Type de déploiement mis à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = deployementType => {
      deployementType.type = deployementType.originalData.type;
      deployementType.notes = deployementType.originalData.notes;
      deployementType.createDate = deployementType.originalData.createDate;
      deployementType.updateDate = deployementType.originalData.updateDate;
      deployementType.isEditing = false;
    };

    const toggleDropdown = deployementType => {
      deployementTypes.value.forEach(dt => {
        if (dt.id !== deployementType.id) dt.showDropdown = false;
      });
      deployementType.showDropdown = !deployementType.showDropdown;
    };

    const viewDeployementType = deployementType => {
      router.push({ name: 'DeployementTypeView', params: { deployementTypeId: deployementType.id } });
    };

    watch(deployementTypes, () => {
      updateTotalItems();
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
      }
    }, { deep: true });

    onMounted(async () => {
      await retrieveDeployementTypes();
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          deployementTypes.value.forEach(dt => (dt.showDropdown = false));
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newDeployementType,
      cancelNewDeployementType,
      saveNewDeployementType,
      deployementTypes,
      handleSyncList,
      isFetching,
      retrieveDeployementTypes,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeDeployementType,
      editDeployementType,
      saveDeployementType,
      cancelEdit,
      toggleDropdown,
      viewDeployementType,
      clear,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedDeployementTypes,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      searchTerm,
      handleSearch,
      ...dataUtils,
    };
  },
});
