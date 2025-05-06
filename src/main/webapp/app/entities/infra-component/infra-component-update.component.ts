import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import InfraComponentService from './infra-component.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ComponentTypeService from '@/entities/component-type/component-type.service';
import { type IComponentType } from '@/shared/model/component-type.model';
import { type IInfraComponent, InfraComponent } from '@/shared/model/infra-component.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InfraComponentUpdate',
  setup() {
    const infraComponentService = inject('infraComponentService', () => new InfraComponentService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const infraComponent: Ref<IInfraComponent> = ref(new InfraComponent());

    const componentTypeService = inject('componentTypeService', () => new ComponentTypeService());

    const componentTypes: Ref<IComponentType[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveInfraComponent = async infraComponentId => {
      try {
        const res = await infraComponentService().find(infraComponentId);
        infraComponent.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.infraComponentId) {
      retrieveInfraComponent(route.params.infraComponentId);
    }

    const initRelationships = () => {
      componentTypeService()
        .retrieve()
        .then(res => {
          componentTypes.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      vendor: {},
      notes: {},
      createDate: {},
      componentType: {},
    };
    const v$ = useVuelidate(validationRules, infraComponent as any);
    v$.value.$validate();

    return {
      infraComponentService,
      alertService,
      infraComponent,
      previousState,
      isSaving,
      currentLanguage,
      componentTypes,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.infraComponent.id) {
        this.infraComponentService()
          .update(this.infraComponent)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.infraComponent.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.infraComponentService()
          .create(this.infraComponent)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.infraComponent.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
