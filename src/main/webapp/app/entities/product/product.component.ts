import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProductService from './product.service';
import { type IProduct } from '@/shared/model/product.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Product',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const productService = inject('productService', () => new ProductService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const products: Ref<IProduct[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveProducts = async () => {
      isFetching.value = true;
      try {
        const res = await productService().retrieve();
        products.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveProducts();
    };

    onMounted(async () => {
      await retrieveProducts();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IProduct) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeProduct = async () => {
      try {
        await productService().delete(removeId.value);
        const message = t$('sdiFrontendApp.product.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveProducts();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      products,
      handleSyncList,
      isFetching,
      retrieveProducts,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProduct,
      t$,
      ...dataUtils,
    };
  },
});
