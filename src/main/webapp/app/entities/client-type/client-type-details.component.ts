import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ClientTypeService from './client-type.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IClientType } from '@/shared/model/client-type.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientTypeDetails',
  setup() {
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const clientType: Ref<IClientType> = ref({});

    const retrieveClientType = async clientTypeId => {
      try {
        const res = await clientTypeService().find(clientTypeId);
        clientType.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientTypeId) {
      retrieveClientType(route.params.clientTypeId);
    }

    return {
      alertService,
      clientType,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
