import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ModuleDeployementService from './module-deployement.service';
import { type IModuleDeployement } from '@/shared/model/module-deployement.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ModuleDeployement',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const moduleDeployementService = inject('moduleDeployementService', () => new ModuleDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const moduleDeployements: Ref<IModuleDeployement[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveModuleDeployements = async () => {
      isFetching.value = true;
      try {
        const res = await moduleDeployementService().retrieve();
        moduleDeployements.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveModuleDeployements();
    };

    onMounted(async () => {
      await retrieveModuleDeployements();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IModuleDeployement) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeModuleDeployement = async () => {
      try {
        await moduleDeployementService().delete(removeId.value);
        const message = t$('sdiFrontendApp.moduleDeployement.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveModuleDeployements();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      moduleDeployements,
      handleSyncList,
      isFetching,
      retrieveModuleDeployements,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeModuleDeployement,
      t$,
      ...dataUtils,
    };
  },
});
