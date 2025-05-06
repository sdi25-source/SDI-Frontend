import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ModuleVersionService from './module-version.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ModuleService from '@/entities/module/module.service';
import { type IModule } from '@/shared/model/module.model';
import FeatureService from '@/entities/feature/feature.service';
import { type IFeature } from '@/shared/model/feature.model';
import DomaineService from '@/entities/domaine/domaine.service';
import { type IDomaine } from '@/shared/model/domaine.model';
import { type IModuleVersion, ModuleVersion } from '@/shared/model/module-version.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ModuleVersionUpdate',
  setup() {
    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const moduleVersion: Ref<IModuleVersion> = ref(new ModuleVersion());

    const moduleVersions: Ref<IModuleVersion[]> = ref([]);

    const moduleService = inject('moduleService', () => new ModuleService());

    const modules: Ref<IModule[]> = ref([]);

    const featureService = inject('featureService', () => new FeatureService());

    const features: Ref<IFeature[]> = ref([]);

    const domaineService = inject('domaineService', () => new DomaineService());

    const domaines: Ref<IDomaine[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveModuleVersion = async moduleVersionId => {
      try {
        const res = await moduleVersionService().find(moduleVersionId);
        moduleVersion.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.moduleVersionId) {
      retrieveModuleVersion(route.params.moduleVersionId);
    }

    const initRelationships = () => {
      moduleVersionService()
        .retrieve()
        .then(res => {
          moduleVersions.value = res.data;
        });
      moduleService()
        .retrieve()
        .then(res => {
          modules.value = res.data;
        });
      featureService()
        .retrieve()
        .then(res => {
          features.value = res.data;
        });
      domaineService()
        .retrieve()
        .then(res => {
          domaines.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      version: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      createDate: {},
      updateDate: {},
      notes: {},
      moduleDeployements: {},
      moduleVersions: {},
      module: {},
      features: {},
      domaine: {},
      root: {},
      productVersions: {},
      productDeployementDetails: {},
      requestOfChanges: {},
    };
    const v$ = useVuelidate(validationRules, moduleVersion as any);
    v$.value.$validate();

    return {
      moduleVersionService,
      alertService,
      moduleVersion,
      previousState,
      isSaving,
      currentLanguage,
      moduleVersions,
      modules,
      features,
      domaines,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {
    this.moduleVersion.features = [];
  },
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.moduleVersion.id) {
        this.moduleVersionService()
          .update(this.moduleVersion)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.moduleVersion.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.moduleVersionService()
          .create(this.moduleVersion)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.moduleVersion.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },

    getSelected(selectedVals, option, pkField = 'id'): any {
      if (selectedVals) {
        return selectedVals.find(value => option[pkField] === value[pkField]) ?? option;
      }
      return option;
    },
  },
});
