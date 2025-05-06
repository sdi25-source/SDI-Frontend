import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import InfraComponentService from './infra-component.service';
import { type IInfraComponent } from '@/shared/model/infra-component.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InfraComponent',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const infraComponentService = inject('infraComponentService', () => new InfraComponentService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const infraComponents: Ref<IInfraComponent[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveInfraComponents = async () => {
      isFetching.value = true;
      try {
        const res = await infraComponentService().retrieve();
        infraComponents.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveInfraComponents();
    };

    onMounted(async () => {
      await retrieveInfraComponents();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IInfraComponent) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeInfraComponent = async () => {
      try {
        await infraComponentService().delete(removeId.value);
        const message = t$('sdiFrontendApp.infraComponent.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveInfraComponents();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      infraComponents,
      handleSyncList,
      isFetching,
      retrieveInfraComponents,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeInfraComponent,
      t$,
      ...dataUtils,
    };
  },
});
