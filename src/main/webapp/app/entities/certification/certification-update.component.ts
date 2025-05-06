import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import CertificationService from './certification.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { Certification, type ICertification } from '@/shared/model/certification.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'CertificationUpdate',
  setup() {
    const certificationService = inject('certificationService', () => new CertificationService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const certification: Ref<ICertification> = ref(new Certification());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

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

    const initRelationships = () => {};

    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      description: {},
      createDate: {},
      updateDate: {},
      expireDate: {},
      clientCertifications: {},
    };
    const v$ = useVuelidate(validationRules, certification as any);
    v$.value.$validate();

    return {
      certificationService,
      alertService,
      certification,
      previousState,
      isSaving,
      currentLanguage,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.certification.id) {
        this.certificationService()
          .update(this.certification)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.certification.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.certificationService()
          .create(this.certification)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.certification.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
