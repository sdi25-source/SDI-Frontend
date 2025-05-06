import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ComponentTypeService from './component-type.service';
import { type IComponentType } from '@/shared/model/component-type.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ComponentType',
  setup() {
    const { t: t$ } = useI18n();
    const componentTypeService = inject('componentTypeService', () => new ComponentTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const componentTypes: Ref<IComponentType[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveComponentTypes = async () => {
      isFetching.value = true;
      try {
        const res = await componentTypeService().retrieve();
        componentTypes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveComponentTypes();
    };

    onMounted(async () => {
      await retrieveComponentTypes();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IComponentType) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeComponentType = async () => {
      try {
        await componentTypeService().delete(removeId.value);
        const message = t$('sdiFrontendApp.componentType.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveComponentTypes();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      componentTypes,
      handleSyncList,
      isFetching,
      retrieveComponentTypes,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeComponentType,
      t$,
    };
  },
});
