import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ProductVersionService from './product-version.service';
import { type IProductVersion } from '@/shared/model/product-version.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductVersion',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productVersions: Ref<IProductVersion[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveProductVersions = async () => {
      isFetching.value = true;
      try {
        const res = await productVersionService().retrieve();
        productVersions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveProductVersions();
    };

    onMounted(async () => {
      await retrieveProductVersions();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IProductVersion) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeProductVersion = async () => {
      try {
        await productVersionService().delete(removeId.value);
        const message = t$('sdiFrontendApp.productVersion.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveProductVersions();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      productVersions,
      handleSyncList,
      isFetching,
      retrieveProductVersions,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductVersion,
      t$,
      ...dataUtils,
    };
  },
});
