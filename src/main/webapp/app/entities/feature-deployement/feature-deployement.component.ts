import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import FeatureDeployementService from './feature-deployement.service';
import FeatureService from '../feature/feature.service';
import ModuleDeployementService from '../module-deployement/module-deployement.service';
import { type IFeatureDeployement } from '@/shared/model/feature-deployement.model';
import { type IFeature } from '@/shared/model/feature.model';
import { type IModuleDeployement } from '@/shared/model/module-deployement.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'FeatureDeployement',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const dataUtils = useDataUtils();
    const featureDeployementService = inject('featureDeployementService', () => new FeatureDeployementService());
    const featureService = inject('featureService', () => new FeatureService());
    const moduleDeployementService = inject('moduleDeployementService', () => new ModuleDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const featureDeployements: Ref<IFeatureDeployement[]> = ref([]);
    const allFeatureDeployements: Ref<IFeatureDeployement[]> = ref([]);
    const features: Ref<IFeature[]> = ref([]);
    const moduleDeployements: Ref<IModuleDeployement[]> = ref([]);
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

    const newFeatureDeployement = ref({
      code: '',
      notes: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      feature: null,
      moduleDeployement: null
    });

    const paginatedFeatureDeployements = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return featureDeployements.value.slice(start, end);
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
      totalItems.value = featureDeployements.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          featureDeployements.value = [...allFeatureDeployements.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          featureDeployements.value = allFeatureDeployements.value.filter(fd =>
            Object.values(fd).some(
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
      featureDeployements.value = [...allFeatureDeployements.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveFeatureDeployements = async () => {
      isFetching.value = true;
      try {
        const res = await featureDeployementService().retrieve();
        featureDeployements.value = res.data.map(fd => ({
          ...fd,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(fd)),
        }));
        allFeatureDeployements.value = [...featureDeployements.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const retrieveFeatures = async () => {
      try {
        const res = await featureService().retrieve();
        features.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveModuleDeployements = async () => {
      try {
        const res = await moduleDeployementService().retrieve();
        moduleDeployements.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const handleSyncList = () => {
      retrieveFeatureDeployements();
    };

    const prepareRemove = (instance: IFeatureDeployement) => {
      featureDeployements.value.forEach(fd => (fd.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeFeatureDeployement = async () => {
      try {
        await featureDeployementService().delete(removeId.value);
        alertService.showInfo(
          t$('sdiFrontendApp.featureDeployement.deleted', { param: removeId.value }).toString(),
          { variant: 'danger' }
        );

        featureDeployements.value = featureDeployements.value.filter(fd => fd.id !== removeId.value);
        allFeatureDeployements.value = allFeatureDeployements.value.filter(fd => fd.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewFeatureDeployement = async () => {
      if (!newFeatureDeployement.value.code) {
        alertService.showAlert('Le champ code est requis.', 'danger');
        return;
      }

      if (!newFeatureDeployement.value.feature) {
        alertService.showAlert('La fonctionnalité est requise.', 'danger');
        return;
      }

      if (!newFeatureDeployement.value.moduleDeployement) {
        alertService.showAlert('Le déploiement de module est requis.', 'danger');
        return;
      }

      try {
        const response = await featureDeployementService().create(newFeatureDeployement.value);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        featureDeployements.value.push(added);
        allFeatureDeployements.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newFeatureDeployement.value = {
          code: '',
          notes: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          feature: null,
          moduleDeployement: null
        };

        alertService.showAlert('Déploiement de fonctionnalité ajouté avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewFeatureDeployement = () => {
      showAddRow.value = false;
      newFeatureDeployement.value = {
        code: '',
        notes: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        feature: null,
        moduleDeployement: null
      };
    };

    const editFeatureDeployement = featureDeployement => {
      featureDeployements.value.forEach(fd => (fd.showDropdown = false));
      featureDeployement.originalData = JSON.parse(JSON.stringify({
        code: featureDeployement.code,
        notes: featureDeployement.notes,
        createDate: featureDeployement.createDate,
        updateDate: featureDeployement.updateDate,
        feature: featureDeployement.feature,
        moduleDeployement: featureDeployement.moduleDeployement
      }));
      featureDeployement.isEditing = true;
    };

    const saveFeatureDeployement = async featureDeployement => {
      if (!featureDeployement.code) {
        alertService.showAlert('Le champ code est requis.', 'danger');
        return;
      }

      if (!featureDeployement.feature) {
        alertService.showAlert('La fonctionnalité est requise.', 'danger');
        return;
      }

      if (!featureDeployement.moduleDeployement) {
        alertService.showAlert('Le déploiement de module est requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: featureDeployement.id,
          code: featureDeployement.code,
          notes: featureDeployement.notes,
          createDate: featureDeployement.createDate,
          updateDate: new Date().toISOString().split('T')[0],
          feature: featureDeployement.feature,
          moduleDeployement: featureDeployement.moduleDeployement
        };

        const response = await featureDeployementService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = featureDeployements.value.findIndex(fd => fd.id === featureDeployement.id);
        if (index !== -1) featureDeployements.value.splice(index, 1, updated);

        const allIndex = allFeatureDeployements.value.findIndex(fd => fd.id === featureDeployement.id);
        if (allIndex !== -1) allFeatureDeployements.value.splice(allIndex, 1, updated);

        alertService.showAlert('Déploiement de fonctionnalité mis à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = featureDeployement => {
      featureDeployement.code = featureDeployement.originalData.code;
      featureDeployement.notes = featureDeployement.originalData.notes;
      featureDeployement.createDate = featureDeployement.originalData.createDate;
      featureDeployement.updateDate = featureDeployement.originalData.updateDate;
      featureDeployement.feature = featureDeployement.originalData.feature;
      featureDeployement.moduleDeployement = featureDeployement.originalData.moduleDeployement;
      featureDeployement.isEditing = false;
    };

    const toggleDropdown = featureDeployement => {
      featureDeployements.value.forEach(fd => {
        if (fd.id !== featureDeployement.id) fd.showDropdown = false;
      });
      featureDeployement.showDropdown = !featureDeployement.showDropdown;
    };

    const viewFeatureDeployement = featureDeployement => {
      router.push({ name: 'FeatureDeployementView', params: { featureDeployementId: featureDeployement.id } });
    };

    watch(featureDeployements, () => {
      updateTotalItems();
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
      }
    }, { deep: true });

    onMounted(async () => {
      await retrieveFeatures();
      await retrieveModuleDeployements();
      await retrieveFeatureDeployements();
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          featureDeployements.value.forEach(fd => (fd.showDropdown = false));
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newFeatureDeployement,
      cancelNewFeatureDeployement,
      saveNewFeatureDeployement,
      featureDeployements,
      features,
      moduleDeployements,
      handleSyncList,
      isFetching,
      retrieveFeatureDeployements,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeFeatureDeployement,
      editFeatureDeployement,
      saveFeatureDeployement,
      cancelEdit,
      toggleDropdown,
      viewFeatureDeployement,
      clear,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedFeatureDeployements,
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
