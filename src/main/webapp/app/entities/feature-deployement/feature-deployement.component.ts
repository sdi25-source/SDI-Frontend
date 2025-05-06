import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FeatureDeployementService from './feature-deployement.service';
import { type IFeatureDeployement } from '@/shared/model/feature-deployement.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'FeatureDeployement',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const featureDeployementService = inject('featureDeployementService', () => new FeatureDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const featureDeployements: Ref<IFeatureDeployement[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveFeatureDeployements = async () => {
      isFetching.value = true;
      try {
        const res = await featureDeployementService().retrieve();
        featureDeployements.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveFeatureDeployements();
    };

    onMounted(async () => {
      await retrieveFeatureDeployements();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IFeatureDeployement) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeFeatureDeployement = async () => {
      try {
        await featureDeployementService().delete(removeId.value);
        const message = t$('sdiFrontendApp.featureDeployement.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveFeatureDeployements();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      featureDeployements,
      handleSyncList,
      isFetching,
      retrieveFeatureDeployements,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeFeatureDeployement,
      t$,
      ...dataUtils,
    };
  },
});
