import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ClientCertificationService from './client-certification.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ClientService from '@/entities/client/client.service';
import { type IClient } from '@/shared/model/client.model';
import CertificationService from '@/entities/certification/certification.service';
import { type ICertification } from '@/shared/model/certification.model';
import { ClientCertification, type IClientCertification } from '@/shared/model/client-certification.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientCertificationUpdate',
  setup() {
    const clientCertificationService = inject('clientCertificationService', () => new ClientCertificationService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientCertification: Ref<IClientCertification> = ref(new ClientCertification());

    const clientService = inject('clientService', () => new ClientService());

    const clients: Ref<IClient[]> = ref([]);

    const certificationService = inject('certificationService', () => new CertificationService());

    const certifications: Ref<ICertification[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

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

    const initRelationships = () => {
      clientService()
        .retrieve()
        .then(res => {
          clients.value = res.data;
        });
      certificationService()
        .retrieve()
        .then(res => {
          certifications.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      certification: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      certificationDate: {},
      createDate: {},
      updateDate: {},
      notes: {},
      client: {},
      certif: {},
    };
    const v$ = useVuelidate(validationRules, clientCertification as any);
    v$.value.$validate();

    return {
      clientCertificationService,
      alertService,
      clientCertification,
      previousState,
      isSaving,
      currentLanguage,
      clients,
      certifications,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.clientCertification.id) {
        this.clientCertificationService()
          .update(this.clientCertification)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.clientCertification.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.clientCertificationService()
          .create(this.clientCertification)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.clientCertification.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
