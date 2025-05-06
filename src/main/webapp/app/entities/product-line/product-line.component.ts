import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProductLineService from './product-line.service';
import { type IProductLine } from '@/shared/model/product-line.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductLine',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const productLineService = inject('productLineService', () => new ProductLineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productLines: Ref<IProductLine[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveProductLines = async () => {
      isFetching.value = true;
      try {
        const res = await productLineService().retrieve();
        productLines.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveProductLines();
    };

    onMounted(async () => {
      await retrieveProductLines();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IProductLine) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeProductLine = async () => {
      try {
        await productLineService().delete(removeId.value);
        const message = t$('sdiFrontendApp.productLine.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveProductLines();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      productLines,
      handleSyncList,
      isFetching,
      retrieveProductLines,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductLine,
      t$,
      ...dataUtils,
    };
  },
});
