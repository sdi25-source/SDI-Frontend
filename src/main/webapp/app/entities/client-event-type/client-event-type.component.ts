import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ClientEventTypeService from './client-event-type.service';
import { type IClientEventType } from '@/shared/model/client-event-type.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEventType',
  setup() {
    const { t: t$ } = useI18n();
    const clientEventTypeService = inject('clientEventTypeService', () => new ClientEventTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientEventTypes: Ref<IClientEventType[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveClientEventTypes = async () => {
      isFetching.value = true;
      try {
        const res = await clientEventTypeService().retrieve();
        clientEventTypes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClientEventTypes();
    };

    onMounted(async () => {
      await retrieveClientEventTypes();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IClientEventType) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeClientEventType = async () => {
      try {
        await clientEventTypeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.clientEventType.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveClientEventTypes();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      clientEventTypes,
      handleSyncList,
      isFetching,
      retrieveClientEventTypes,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientEventType,
      t$,
    };
  },
});
