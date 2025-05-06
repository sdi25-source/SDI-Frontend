import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ClientCertificationService from './client-certification.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IClientCertification } from '@/shared/model/client-certification.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientCertificationDetails',
  setup() {
    const clientCertificationService = inject('clientCertificationService', () => new ClientCertificationService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const clientCertification: Ref<IClientCertification> = ref({});

    const retrieveClientCertification = async clientCertificationId => {
      try {
        const res = await clientCertificationService().find(clientCertificationId);
        clientCertification.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientCertificationId) {
      retrieveClientCertification(route.params.clientCertificationId);
    }

    return {
      alertService,
      clientCertification,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
