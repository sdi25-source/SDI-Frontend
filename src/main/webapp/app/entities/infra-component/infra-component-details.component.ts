import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import InfraComponentService from './infra-component.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IInfraComponent } from '@/shared/model/infra-component.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InfraComponentDetails',
  setup() {
    const infraComponentService = inject('infraComponentService', () => new InfraComponentService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const infraComponent: Ref<IInfraComponent> = ref({});

    const retrieveInfraComponent = async infraComponentId => {
      try {
        const res = await infraComponentService().find(infraComponentId);
        infraComponent.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.infraComponentId) {
      retrieveInfraComponent(route.params.infraComponentId);
    }

    return {
      alertService,
      infraComponent,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
