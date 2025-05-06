import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductDeployementDetailService from './product-deployement-detail.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployementDetailDetails',
  setup() {
    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const productDeployementDetail: Ref<IProductDeployementDetail> = ref({});

    const retrieveProductDeployementDetail = async productDeployementDetailId => {
      try {
        const res = await productDeployementDetailService().find(productDeployementDetailId);
        productDeployementDetail.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productDeployementDetailId) {
      retrieveProductDeployementDetail(route.params.productDeployementDetailId);
    }

    return {
      alertService,
      productDeployementDetail,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
