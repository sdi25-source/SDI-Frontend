import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import FeatureDeployementService from './feature-deployement.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import FeatureService from '@/entities/feature/feature.service';
import { type IFeature } from '@/shared/model/feature.model';
import ModuleDeployementService from '@/entities/module-deployement/module-deployement.service';
import { type IModuleDeployement } from '@/shared/model/module-deployement.model';
import { FeatureDeployement, type IFeatureDeployement } from '@/shared/model/feature-deployement.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'FeatureDeployementUpdate',
  setup() {
    const featureDeployementService = inject('featureDeployementService', () => new FeatureDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const featureDeployement: Ref<IFeatureDeployement> = ref(new FeatureDeployement());

    const featureService = inject('featureService', () => new FeatureService());

    const features: Ref<IFeature[]> = ref([]);

    const moduleDeployementService = inject('moduleDeployementService', () => new ModuleDeployementService());

    const moduleDeployements: Ref<IModuleDeployement[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveFeatureDeployement = async featureDeployementId => {
      try {
        const res = await featureDeployementService().find(featureDeployementId);
        featureDeployement.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.featureDeployementId) {
      retrieveFeatureDeployement(route.params.featureDeployementId);
    }

    const initRelationships = () => {
      featureService()
        .retrieve()
        .then(res => {
          features.value = res.data;
        });
      moduleDeployementService()
        .retrieve()
        .then(res => {
          moduleDeployements.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      code: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      createDate: {},
      updateDate: {},
      notes: {},
      feature: {},
      moduleDeployement: {},
    };
    const v$ = useVuelidate(validationRules, featureDeployement as any);
    v$.value.$validate();

    return {
      featureDeployementService,
      alertService,
      featureDeployement,
      previousState,
      isSaving,
      currentLanguage,
      features,
      moduleDeployements,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.featureDeployement.id) {
        this.featureDeployementService()
          .update(this.featureDeployement)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.featureDeployement.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.featureDeployementService()
          .create(this.featureDeployement)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.featureDeployement.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
