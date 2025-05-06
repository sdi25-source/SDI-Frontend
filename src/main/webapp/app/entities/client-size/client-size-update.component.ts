import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ClientSizeService from './client-size.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { ClientSize, type IClientSize } from '@/shared/model/client-size.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientSizeUpdate',
  setup() {
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientSize: Ref<IClientSize> = ref(new ClientSize());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveClientSize = async clientSizeId => {
      try {
        const res = await clientSizeService().find(clientSizeId);
        clientSize.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientSizeId) {
      retrieveClientSize(route.params.clientSizeId);
    }

    const initRelationships = () => {};

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      sizeName: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      sizeCode: {},
      sizeDescription: {},
      createDate: {},
      updateDate: {},
      notes: {},
      clients: {},
    };
    const v$ = useVuelidate(validationRules, clientSize as any);
    v$.value.$validate();

    return {
      clientSizeService,
      alertService,
      clientSize,
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
      if (this.clientSize.id) {
        this.clientSizeService()
          .update(this.clientSize)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.clientSize.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.clientSizeService()
          .create(this.clientSize)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.clientSize.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
