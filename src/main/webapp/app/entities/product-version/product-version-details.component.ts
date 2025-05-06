import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductVersionService from './product-version.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IProductVersion } from '@/shared/model/product-version.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductVersionDetails',
  setup() {
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const productVersion: Ref<IProductVersion> = ref({});

    const retrieveProductVersion = async productVersionId => {
      try {
        const res = await productVersionService().find(productVersionId);
        productVersion.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productVersionId) {
      retrieveProductVersion(route.params.productVersionId);
    }

    return {
      alertService,
      productVersion,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
