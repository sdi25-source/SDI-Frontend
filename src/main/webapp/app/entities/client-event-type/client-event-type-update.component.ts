import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ClientEventTypeService from './client-event-type.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { ClientEventType, type IClientEventType } from '@/shared/model/client-event-type.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEventTypeUpdate',
  setup() {
    const clientEventTypeService = inject('clientEventTypeService', () => new ClientEventTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientEventType: Ref<IClientEventType> = ref(new ClientEventType());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

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

    const initRelationships = () => {};

    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      type: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      description: {},
      createDate: {},
      updateDate: {},
      clientEvents: {},
    };
    const v$ = useVuelidate(validationRules, clientEventType as any);
    v$.value.$validate();

    return {
      clientEventTypeService,
      alertService,
      clientEventType,
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
      if (this.clientEventType.id) {
        this.clientEventTypeService()
          .update(this.clientEventType)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.clientEventType.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.clientEventTypeService()
          .create(this.clientEventType)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.clientEventType.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
