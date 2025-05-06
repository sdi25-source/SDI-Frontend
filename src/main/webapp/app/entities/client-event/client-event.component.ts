import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ClientEventService from './client-event.service';
import { type IClientEvent } from '@/shared/model/client-event.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEvent',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const clientEventService = inject('clientEventService', () => new ClientEventService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientEvents: Ref<IClientEvent[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveClientEvents = async () => {
      isFetching.value = true;
      try {
        const res = await clientEventService().retrieve();
        clientEvents.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClientEvents();
    };

    onMounted(async () => {
      await retrieveClientEvents();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IClientEvent) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeClientEvent = async () => {
      try {
        await clientEventService().delete(removeId.value);
        const message = t$('sdiFrontendApp.clientEvent.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveClientEvents();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      clientEvents,
      handleSyncList,
      isFetching,
      retrieveClientEvents,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientEvent,
      t$,
      ...dataUtils,
    };
  },
});
