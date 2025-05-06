import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ClientEventTypeService from './client-event-type.service';
import { type IClientEventType } from '@/shared/model/client-event-type.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEventTypeDetails',
  setup() {
    const clientEventTypeService = inject('clientEventTypeService', () => new ClientEventTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const clientEventType: Ref<IClientEventType> = ref({});

    const retrieveClientEventType = async clientEventTypeId => {
      try {
        const res = await clientEventTypeService().find(clientEventTypeId);
        clientEventType.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientEventTypeId) {
      retrieveClientEventType(route.params.clientEventTypeId);
    }

    return {
      alertService,
      clientEventType,

      previousState,
      t$: useI18n().t,
    };
  },
});
