import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import CustomisationLevelService from './customisation-level.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type ICustomisationLevel } from '@/shared/model/customisation-level.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'CustomisationLevelDetails',
  setup() {
    const customisationLevelService = inject('customisationLevelService', () => new CustomisationLevelService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const customisationLevel: Ref<ICustomisationLevel> = ref({});

    const retrieveCustomisationLevel = async customisationLevelId => {
      try {
        const res = await customisationLevelService().find(customisationLevelId);
        customisationLevel.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.customisationLevelId) {
      retrieveCustomisationLevel(route.params.customisationLevelId);
    }

    return {
      alertService,
      customisationLevel,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
