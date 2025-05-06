import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ClientEventService from './client-event.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IClientEvent } from '@/shared/model/client-event.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEventDetails',
  setup() {
    const clientEventService = inject('clientEventService', () => new ClientEventService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const clientEvent: Ref<IClientEvent> = ref({});

    const retrieveClientEvent = async clientEventId => {
      try {
        const res = await clientEventService().find(clientEventId);
        clientEvent.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientEventId) {
      retrieveClientEvent(route.params.clientEventId);
    }

    return {
      alertService,
      clientEvent,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
