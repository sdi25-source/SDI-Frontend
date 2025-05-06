import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductDeployementService from './product-deployement.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IProductDeployement } from '@/shared/model/product-deployement.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployementDetails',
  setup() {
    const productDeployementService = inject('productDeployementService', () => new ProductDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const productDeployement: Ref<IProductDeployement> = ref({});

    const retrieveProductDeployement = async productDeployementId => {
      try {
        const res = await productDeployementService().find(productDeployementId);
        productDeployement.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productDeployementId) {
      retrieveProductDeployement(route.params.productDeployementId);
    }

    return {
      alertService,
      productDeployement,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
