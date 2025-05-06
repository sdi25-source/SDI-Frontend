import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import FeatureService from './feature.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { Feature, type IFeature } from '@/shared/model/feature.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'FeatureUpdate',
  setup() {
    const featureService = inject('featureService', () => new FeatureService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const feature: Ref<IFeature> = ref(new Feature());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveFeature = async featureId => {
      try {
        const res = await featureService().find(featureId);
        feature.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.featureId) {
      retrieveFeature(route.params.featureId);
    }

    const initRelationships = () => {};

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      apiVersion: {},
      description: {},
      createDate: {},
      updateDate: {},
      featureDeployements: {},
      moduleVersions: {},
    };
    const v$ = useVuelidate(validationRules, feature as any);
    v$.value.$validate();

    return {
      featureService,
      alertService,
      feature,
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
      if (this.feature.id) {
        this.featureService()
          .update(this.feature)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.feature.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.featureService()
          .create(this.feature)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.feature.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
