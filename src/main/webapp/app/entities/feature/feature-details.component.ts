import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import FeatureService from './feature.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IFeature } from '@/shared/model/feature.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'FeatureDetails',
  setup() {
    const featureService = inject('featureService', () => new FeatureService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const feature: Ref<IFeature> = ref({});

    const retrieveFeature = async featureId => {
      try {
        const res = await featureService().find(featureId);
        feature.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.featureId) {
      retrieveFeature(route.params.featureId);
    }

    return {
      alertService,
      feature,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
