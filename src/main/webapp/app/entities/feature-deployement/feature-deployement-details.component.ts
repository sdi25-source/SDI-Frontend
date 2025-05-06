import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import FeatureDeployementService from './feature-deployement.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IFeatureDeployement } from '@/shared/model/feature-deployement.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'FeatureDeployementDetails',
  setup() {
    const featureDeployementService = inject('featureDeployementService', () => new FeatureDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const featureDeployement: Ref<IFeatureDeployement> = ref({});

    const retrieveFeatureDeployement = async featureDeployementId => {
      try {
        const res = await featureDeployementService().find(featureDeployementId);
        featureDeployement.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.featureDeployementId) {
      retrieveFeatureDeployement(route.params.featureDeployementId);
    }

    return {
      alertService,
      featureDeployement,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
