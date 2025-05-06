import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ClientTypeService from './client-type.service';
import { type IClientType } from '@/shared/model/client-type.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientType',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientTypes: Ref<IClientType[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveClientTypes = async () => {
      isFetching.value = true;
      try {
        const res = await clientTypeService().retrieve();
        clientTypes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClientTypes();
    };

    onMounted(async () => {
      await retrieveClientTypes();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IClientType) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeClientType = async () => {
      try {
        await clientTypeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.clientType.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveClientTypes();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      clientTypes,
      handleSyncList,
      isFetching,
      retrieveClientTypes,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientType,
      t$,
      ...dataUtils,
    };
  },
});
