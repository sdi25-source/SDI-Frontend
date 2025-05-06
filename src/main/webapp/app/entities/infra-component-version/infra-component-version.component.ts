import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import InfraComponentVersionService from './infra-component-version.service';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InfraComponentVersion',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const infraComponentVersions: Ref<IInfraComponentVersion[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveInfraComponentVersions = async () => {
      isFetching.value = true;
      try {
        const res = await infraComponentVersionService().retrieve();
        infraComponentVersions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveInfraComponentVersions();
    };

    onMounted(async () => {
      await retrieveInfraComponentVersions();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IInfraComponentVersion) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeInfraComponentVersion = async () => {
      try {
        await infraComponentVersionService().delete(removeId.value);
        const message = t$('sdiFrontendApp.infraComponentVersion.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveInfraComponentVersions();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      infraComponentVersions,
      handleSyncList,
      isFetching,
      retrieveInfraComponentVersions,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeInfraComponentVersion,
      t$,
      ...dataUtils,
    };
  },
});
