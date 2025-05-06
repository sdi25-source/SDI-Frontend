import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ModuleService from './module.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IModule } from '@/shared/model/module.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ModuleDetails',
  setup() {
    const moduleService = inject('moduleService', () => new ModuleService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const module: Ref<IModule> = ref({});

    const retrieveModule = async moduleId => {
      try {
        const res = await moduleService().find(moduleId);
        module.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.moduleId) {
      retrieveModule(route.params.moduleId);
    }

    return {
      alertService,
      module,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
