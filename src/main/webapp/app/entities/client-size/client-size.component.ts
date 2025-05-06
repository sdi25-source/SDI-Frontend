import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ClientSizeService from './client-size.service';
import { type IClientSize } from '@/shared/model/client-size.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientSize',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientSizes: Ref<IClientSize[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveClientSizes = async () => {
      isFetching.value = true;
      try {
        const res = await clientSizeService().retrieve();
        clientSizes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClientSizes();
    };

    onMounted(async () => {
      await retrieveClientSizes();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IClientSize) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeClientSize = async () => {
      try {
        await clientSizeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.clientSize.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveClientSizes();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      clientSizes,
      handleSyncList,
      isFetching,
      retrieveClientSizes,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientSize,
      t$,
      ...dataUtils,
    };
  },
});
