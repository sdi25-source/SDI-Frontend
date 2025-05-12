import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import ModuleDeployementService from './module-deployement.service';
import ModuleVersionService from '../module-version/module-version.service';
import ProductDeployementDetailService from '../product-deployement-detail/product-deployement-detail.service';
import { type IModuleDeployement } from '@/shared/model/module-deployement.model';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import { type IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ModuleDeployement',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const dataUtils = useDataUtils();
    const moduleDeployementService = inject('moduleDeployementService', () => new ModuleDeployementService());
    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());
    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const moduleDeployements: Ref<IModuleDeployement[]> = ref([]);
    const allModuleDeployements: Ref<IModuleDeployement[]> = ref([]);
    const moduleVersions: Ref<IModuleVersion[]> = ref([]);
    const productDeployementDetails: Ref<IProductDeployementDetail[]> = ref([]);
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

    const newModuleDeployement = ref({
      code: '',
      notes: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      moduleVersion: null,
      productDeployementDetail: null
    });

    const paginatedModuleDeployements = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return moduleDeployements.value.slice(start, end);
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
      totalItems.value = moduleDeployements.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          moduleDeployements.value = [...allModuleDeployements.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          moduleDeployements.value = allModuleDeployements.value.filter(md =>
            Object.values(md).some(
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
      moduleDeployements.value = [...allModuleDeployements.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveModuleDeployements = async () => {
      isFetching.value = true;
      try {
        const res = await moduleDeployementService().retrieve();
        moduleDeployements.value = res.data.map(md => ({
          ...md,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(md)),
        }));
        allModuleDeployements.value = [...moduleDeployements.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const retrieveModuleVersions = async () => {
      try {
        const res = await moduleVersionService().retrieve();
        moduleVersions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveProductDeployementDetails = async () => {
      try {
        const res = await productDeployementDetailService().retrieve();
        productDeployementDetails.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const handleSyncList = () => {
      retrieveModuleDeployements();
    };

    const prepareRemove = (instance: IModuleDeployement) => {
      moduleDeployements.value.forEach(md => (md.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeModuleDeployement = async () => {
      try {
        await moduleDeployementService().delete(removeId.value);
        alertService.showInfo(
          t$('sdiFrontendApp.moduleDeployement.deleted', { param: removeId.value }).toString(),
          { variant: 'danger' }
        );

        moduleDeployements.value = moduleDeployements.value.filter(md => md.id !== removeId.value);
        allModuleDeployements.value = allModuleDeployements.value.filter(md => md.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewModuleDeployement = async () => {
      if (!newModuleDeployement.value.code) {
        alertService.showAlert('Le champ code est requis.', 'danger');
        return;
      }

      if (!newModuleDeployement.value.moduleVersion) {
        alertService.showAlert('La version du module est requise.', 'danger');
        return;
      }

      try {
        const response = await moduleDeployementService().create(newModuleDeployement.value);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        moduleDeployements.value.push(added);
        allModuleDeployements.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newModuleDeployement.value = {
          code: '',
          notes: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          moduleVersion: null,
          productDeployementDetail: null
        };

        alertService.showAlert('Déploiement de module ajouté avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewModuleDeployement = () => {
      showAddRow.value = false;
      newModuleDeployement.value = {
        code: '',
        notes: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        moduleVersion: null,
        productDeployementDetail: null
      };
    };

    const editModuleDeployement = moduleDeployement => {
      moduleDeployements.value.forEach(md => (md.showDropdown = false));
      moduleDeployement.originalData = JSON.parse(JSON.stringify({
        code: moduleDeployement.code,
        notes: moduleDeployement.notes,
        createDate: moduleDeployement.createDate,
        updateDate: moduleDeployement.updateDate,
        moduleVersion: moduleDeployement.moduleVersion,
        productDeployementDetail: moduleDeployement.productDeployementDetail
      }));
      moduleDeployement.isEditing = true;
    };

    const saveModuleDeployement = async moduleDeployement => {
      if (!moduleDeployement.code) {
        alertService.showAlert('Le champ code est requis.', 'danger');
        return;
      }

      if (!moduleDeployement.moduleVersion) {
        alertService.showAlert('La version du module est requise.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: moduleDeployement.id,
          code: moduleDeployement.code,
          notes: moduleDeployement.notes,
          createDate: moduleDeployement.createDate,
          updateDate: new Date().toISOString().split('T')[0],
          moduleVersion: moduleDeployement.moduleVersion,
          productDeployementDetail: moduleDeployement.productDeployementDetail
        };

        const response = await moduleDeployementService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = moduleDeployements.value.findIndex(md => md.id === moduleDeployement.id);
        if (index !== -1) moduleDeployements.value.splice(index, 1, updated);

        const allIndex = allModuleDeployements.value.findIndex(md => md.id === moduleDeployement.id);
        if (allIndex !== -1) allModuleDeployements.value.splice(allIndex, 1, updated);

        alertService.showAlert('Déploiement de module mis à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = moduleDeployement => {
      moduleDeployement.code = moduleDeployement.originalData.code;
      moduleDeployement.notes = moduleDeployement.originalData.notes;
      moduleDeployement.createDate = moduleDeployement.originalData.createDate;
      moduleDeployement.updateDate = moduleDeployement.originalData.updateDate;
      moduleDeployement.moduleVersion = moduleDeployement.originalData.moduleVersion;
      moduleDeployement.productDeployementDetail = moduleDeployement.originalData.productDeployementDetail;
      moduleDeployement.isEditing = false;
    };

    const toggleDropdown = moduleDeployement => {
      moduleDeployements.value.forEach(md => {
        if (md.id !== moduleDeployement.id) md.showDropdown = false;
      });
      moduleDeployement.showDropdown = !moduleDeployement.showDropdown;
    };

    const viewModuleDeployement = moduleDeployement => {
      router.push({ name: 'ModuleDeployementView', params: { moduleDeployementId: moduleDeployement.id } });
    };

    watch(moduleDeployements, () => {
      updateTotalItems();
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
      }
    }, { deep: true });

    onMounted(async () => {
      await retrieveModuleVersions();
      await retrieveProductDeployementDetails();
      await retrieveModuleDeployements();
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          moduleDeployements.value.forEach(md => (md.showDropdown = false));
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newModuleDeployement,
      cancelNewModuleDeployement,
      saveNewModuleDeployement,
      moduleDeployements,
      moduleVersions,
      productDeployementDetails,
      handleSyncList,
      isFetching,
      retrieveModuleDeployements,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeModuleDeployement,
      editModuleDeployement,
      saveModuleDeployement,
      cancelEdit,
      toggleDropdown,
      viewModuleDeployement,
      clear,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedModuleDeployements,
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
