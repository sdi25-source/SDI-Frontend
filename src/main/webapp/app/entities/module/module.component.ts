import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ModuleService from './module.service';
import { type IModule } from '@/shared/model/module.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Module',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const moduleService = inject('moduleService', () => new ModuleService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const modules: Ref<IModule[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveModules = async () => {
      isFetching.value = true;
      try {
        const res = await moduleService().retrieve();
        modules.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveModules();
    };

    onMounted(async () => {
      await retrieveModules();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IModule) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeModule = async () => {
      try {
        await moduleService().delete(removeId.value);
        const message = t$('sdiFrontendApp.module.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveModules();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      modules,
      handleSyncList,
      isFetching,
      retrieveModules,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeModule,
      t$,
      ...dataUtils,
    };
  },
});
