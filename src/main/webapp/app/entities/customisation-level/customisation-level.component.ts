import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CustomisationLevelService from './customisation-level.service';
import { type ICustomisationLevel } from '@/shared/model/customisation-level.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'CustomisationLevel',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const customisationLevelService = inject('customisationLevelService', () => new CustomisationLevelService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const customisationLevels: Ref<ICustomisationLevel[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveCustomisationLevels = async () => {
      isFetching.value = true;
      try {
        const res = await customisationLevelService().retrieve();
        customisationLevels.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveCustomisationLevels();
    };

    onMounted(async () => {
      await retrieveCustomisationLevels();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: ICustomisationLevel) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeCustomisationLevel = async () => {
      try {
        await customisationLevelService().delete(removeId.value);
        const message = t$('sdiFrontendApp.customisationLevel.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveCustomisationLevels();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      customisationLevels,
      handleSyncList,
      isFetching,
      retrieveCustomisationLevels,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeCustomisationLevel,
      t$,
      ...dataUtils,
    };
  },
});
