import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import HAService from './ha.service';
import { type IHA } from '@/shared/model/ha.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'HA',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const hAService = inject('hAService', () => new HAService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const hAS: Ref<IHA[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveHAs = async () => {
      isFetching.value = true;
      try {
        const res = await hAService().retrieve();
        hAS.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveHAs();
    };

    onMounted(async () => {
      await retrieveHAs();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IHA) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeHA = async () => {
      try {
        await hAService().delete(removeId.value);
        const message = t$('sdiFrontendApp.hA.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveHAs();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      hAS,
      handleSyncList,
      isFetching,
      retrieveHAs,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeHA,
      t$,
      ...dataUtils,
    };
  },
});
