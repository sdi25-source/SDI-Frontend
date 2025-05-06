import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProductDeployementDetailService from './product-deployement-detail.service';
import { type IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployementDetail',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productDeployementDetails: Ref<IProductDeployementDetail[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveProductDeployementDetails = async () => {
      isFetching.value = true;
      try {
        const res = await productDeployementDetailService().retrieve();
        productDeployementDetails.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveProductDeployementDetails();
    };

    onMounted(async () => {
      await retrieveProductDeployementDetails();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IProductDeployementDetail) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeProductDeployementDetail = async () => {
      try {
        await productDeployementDetailService().delete(removeId.value);
        const message = t$('sdiFrontendApp.productDeployementDetail.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveProductDeployementDetails();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      productDeployementDetails,
      handleSyncList,
      isFetching,
      retrieveProductDeployementDetails,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductDeployementDetail,
      t$,
      ...dataUtils,
    };
  },
});
