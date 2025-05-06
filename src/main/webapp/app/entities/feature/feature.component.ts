import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import FeatureService from './feature.service';
import { type IFeature } from '@/shared/model/feature.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Feature',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const featureService = inject('featureService', () => new FeatureService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const features: Ref<IFeature[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveFeatures = async () => {
      isFetching.value = true;
      try {
        const res = await featureService().retrieve();
        features.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveFeatures();
    };

    onMounted(async () => {
      await retrieveFeatures();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IFeature) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeFeature = async () => {
      try {
        await featureService().delete(removeId.value);
        const message = t$('sdiFrontendApp.feature.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveFeatures();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      features,
      handleSyncList,
      isFetching,
      retrieveFeatures,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeFeature,
      t$,
      ...dataUtils,
    };
  },
});
