import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import RequestOfChangeService from './request-of-change.service';
import { type IRequestOfChange } from '@/shared/model/request-of-change.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'RequestOfChange',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const requestOfChangeService = inject('requestOfChangeService', () => new RequestOfChangeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const requestOfChanges: Ref<IRequestOfChange[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveRequestOfChanges = async () => {
      isFetching.value = true;
      try {
        const res = await requestOfChangeService().retrieve();
        requestOfChanges.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveRequestOfChanges();
    };

    onMounted(async () => {
      await retrieveRequestOfChanges();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IRequestOfChange) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeRequestOfChange = async () => {
      try {
        await requestOfChangeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.requestOfChange.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveRequestOfChanges();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      requestOfChanges,
      handleSyncList,
      isFetching,
      retrieveRequestOfChanges,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeRequestOfChange,
      t$,
      ...dataUtils,
    };
  },
});
