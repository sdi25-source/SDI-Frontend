import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import CustomisationLevelService from './customisation-level.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { CustomisationLevel, type ICustomisationLevel } from '@/shared/model/customisation-level.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'CustomisationLevelUpdate',
  setup() {
    const customisationLevelService = inject('customisationLevelService', () => new CustomisationLevelService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const customisationLevel: Ref<ICustomisationLevel> = ref(new CustomisationLevel());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveCustomisationLevel = async customisationLevelId => {
      try {
        const res = await customisationLevelService().find(customisationLevelId);
        customisationLevel.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.customisationLevelId) {
      retrieveCustomisationLevel(route.params.customisationLevelId);
    }

    const initRelationships = () => {};

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      level: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      createDate: {},
      updateDate: {},
      notes: {},
      requestOfChanges: {},
    };
    const v$ = useVuelidate(validationRules, customisationLevel as any);
    v$.value.$validate();

    return {
      customisationLevelService,
      alertService,
      customisationLevel,
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
      if (this.customisationLevel.id) {
        this.customisationLevelService()
          .update(this.customisationLevel)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.customisationLevel.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.customisationLevelService()
          .create(this.customisationLevel)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.customisationLevel.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
