import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProductDeployementService from './product-deployement.service';
import { type IProductDeployement } from '@/shared/model/product-deployement.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployement',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const productDeployementService = inject('productDeployementService', () => new ProductDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productDeployements: Ref<IProductDeployement[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveProductDeployements = async () => {
      isFetching.value = true;
      try {
        const res = await productDeployementService().retrieve();
        productDeployements.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveProductDeployements();
    };

    onMounted(async () => {
      await retrieveProductDeployements();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IProductDeployement) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeProductDeployement = async () => {
      try {
        await productDeployementService().delete(removeId.value);
        const message = t$('sdiFrontendApp.productDeployement.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveProductDeployements();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      productDeployements,
      handleSyncList,
      isFetching,
      retrieveProductDeployements,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductDeployement,
      t$,
      ...dataUtils,
    };
  },
});
