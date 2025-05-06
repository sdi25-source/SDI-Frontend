import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import RequestOfChangeService from './request-of-change.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IRequestOfChange } from '@/shared/model/request-of-change.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'RequestOfChangeDetails',
  setup() {
    const requestOfChangeService = inject('requestOfChangeService', () => new RequestOfChangeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const requestOfChange: Ref<IRequestOfChange> = ref({});

    const retrieveRequestOfChange = async requestOfChangeId => {
      try {
        const res = await requestOfChangeService().find(requestOfChangeId);
        requestOfChange.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.requestOfChangeId) {
      retrieveRequestOfChange(route.params.requestOfChangeId);
    }

    return {
      alertService,
      requestOfChange,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
