import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ComponentTypeService from './component-type.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { ComponentType, type IComponentType } from '@/shared/model/component-type.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ComponentTypeUpdate',
  setup() {
    const componentTypeService = inject('componentTypeService', () => new ComponentTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const componentType: Ref<IComponentType> = ref(new ComponentType());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveComponentType = async componentTypeId => {
      try {
        const res = await componentTypeService().find(componentTypeId);
        componentType.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.componentTypeId) {
      retrieveComponentType(route.params.componentTypeId);
    }

    const initRelationships = () => {};

    initRelationships();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      type: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      infraComponents: {},
    };
    const v$ = useVuelidate(validationRules, componentType as any);
    v$.value.$validate();

    return {
      componentTypeService,
      alertService,
      componentType,
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
      if (this.componentType.id) {
        this.componentTypeService()
          .update(this.componentType)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.componentType.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.componentTypeService()
          .create(this.componentType)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.componentType.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
