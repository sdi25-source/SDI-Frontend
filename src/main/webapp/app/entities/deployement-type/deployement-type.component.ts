import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DeployementTypeService from './deployement-type.service';
import { type IDeployementType } from '@/shared/model/deployement-type.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'DeployementType',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const deployementTypeService = inject('deployementTypeService', () => new DeployementTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const deployementTypes: Ref<IDeployementType[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveDeployementTypes = async () => {
      isFetching.value = true;
      try {
        const res = await deployementTypeService().retrieve();
        deployementTypes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveDeployementTypes();
    };

    onMounted(async () => {
      await retrieveDeployementTypes();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IDeployementType) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeDeployementType = async () => {
      try {
        await deployementTypeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.deployementType.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveDeployementTypes();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      deployementTypes,
      handleSyncList,
      isFetching,
      retrieveDeployementTypes,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeDeployementType,
      t$,
      ...dataUtils,
    };
  },
});
