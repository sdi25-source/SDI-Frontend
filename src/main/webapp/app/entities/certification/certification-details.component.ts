import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import CertificationService from './certification.service';
import { type ICertification } from '@/shared/model/certification.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'CertificationDetails',
  setup() {
    const certificationService = inject('certificationService', () => new CertificationService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const certification: Ref<ICertification> = ref({});

    const retrieveCertification = async certificationId => {
      try {
        const res = await certificationService().find(certificationId);
        certification.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.certificationId) {
      retrieveCertification(route.params.certificationId);
    }

    return {
      alertService,
      certification,

      previousState,
      t$: useI18n().t,
    };
  },
});
