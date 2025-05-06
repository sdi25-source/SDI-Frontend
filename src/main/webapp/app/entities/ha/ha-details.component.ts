import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import HAService from './ha.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IHA } from '@/shared/model/ha.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'HADetails',
  setup() {
    const hAService = inject('hAService', () => new HAService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const hA: Ref<IHA> = ref({});

    const retrieveHA = async hAId => {
      try {
        const res = await hAService().find(hAId);
        hA.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.hAId) {
      retrieveHA(route.params.hAId);
    }

    return {
      alertService,
      hA,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
