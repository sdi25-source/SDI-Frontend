import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ClientTypeService from './client-type.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { ClientType, type IClientType } from '@/shared/model/client-type.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientTypeUpdate',
  setup() {
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientType: Ref<IClientType> = ref(new ClientType());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

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

    const initRelationships = () => {};

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      type: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      createDate: {},
      updateDate: {},
      notes: {},
      clients: {},
    };
    const v$ = useVuelidate(validationRules, clientType as any);
    v$.value.$validate();

    return {
      clientTypeService,
      alertService,
      clientType,
      previousState,
      isSaving,
      currentLanguage,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.clientType.id) {
        this.clientTypeService()
          .update(this.clientType)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.clientType.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.clientTypeService()
          .create(this.clientType)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.clientType.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
