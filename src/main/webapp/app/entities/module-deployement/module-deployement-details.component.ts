import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ModuleDeployementService from './module-deployement.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IModuleDeployement } from '@/shared/model/module-deployement.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ModuleDeployementDetails',
  setup() {
    const moduleDeployementService = inject('moduleDeployementService', () => new ModuleDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const moduleDeployement: Ref<IModuleDeployement> = ref({});

    const retrieveModuleDeployement = async moduleDeployementId => {
      try {
        const res = await moduleDeployementService().find(moduleDeployementId);
        moduleDeployement.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.moduleDeployementId) {
      retrieveModuleDeployement(route.params.moduleDeployementId);
    }

    return {
      alertService,
      moduleDeployement,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
