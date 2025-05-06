import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ComponentTypeService from './component-type.service';
import { type IComponentType } from '@/shared/model/component-type.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ComponentTypeDetails',
  setup() {
    const componentTypeService = inject('componentTypeService', () => new ComponentTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const componentType: Ref<IComponentType> = ref({});

    const retrieveComponentType = async componentTypeId => {
      try {
        const res = await componentTypeService().find(componentTypeId);
        componentType.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.componentTypeId) {
      retrieveComponentType(route.params.componentTypeId);
    }

    return {
      alertService,
      componentType,

      previousState,
      t$: useI18n().t,
    };
  },
});
