import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import InfraComponentVersionService from './infra-component-version.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InfraComponentVersionDetails',
  setup() {
    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const infraComponentVersion: Ref<IInfraComponentVersion> = ref({});

    const retrieveInfraComponentVersion = async infraComponentVersionId => {
      try {
        const res = await infraComponentVersionService().find(infraComponentVersionId);
        infraComponentVersion.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.infraComponentVersionId) {
      retrieveInfraComponentVersion(route.params.infraComponentVersionId);
    }

    return {
      alertService,
      infraComponentVersion,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
