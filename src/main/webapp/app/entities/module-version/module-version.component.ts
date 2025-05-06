import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ModuleVersionService from './module-version.service';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ModuleVersion',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const moduleVersions: Ref<IModuleVersion[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveModuleVersions = async () => {
      isFetching.value = true;
      try {
        const res = await moduleVersionService().retrieve();
        moduleVersions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveModuleVersions();
    };

    onMounted(async () => {
      await retrieveModuleVersions();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IModuleVersion) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeModuleVersion = async () => {
      try {
        await moduleVersionService().delete(removeId.value);
        const message = t$('sdiFrontendApp.moduleVersion.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveModuleVersions();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      moduleVersions,
      handleSyncList,
      isFetching,
      retrieveModuleVersions,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeModuleVersion,
      t$,
      ...dataUtils,
    };
  },
});
