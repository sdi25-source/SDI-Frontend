import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ModuleVersionService from './module-version.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ModuleVersionDetails',
  setup() {
    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const moduleVersion: Ref<IModuleVersion> = ref({});

    const retrieveModuleVersion = async moduleVersionId => {
      try {
        const res = await moduleVersionService().find(moduleVersionId);
        moduleVersion.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.moduleVersionId) {
      retrieveModuleVersion(route.params.moduleVersionId);
    }

    return {
      alertService,
      moduleVersion,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
