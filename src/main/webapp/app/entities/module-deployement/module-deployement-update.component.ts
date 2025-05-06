import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ModuleDeployementService from './module-deployement.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ModuleVersionService from '@/entities/module-version/module-version.service';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import ProductDeployementDetailService from '@/entities/product-deployement-detail/product-deployement-detail.service';
import { type IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';
import { type IModuleDeployement, ModuleDeployement } from '@/shared/model/module-deployement.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ModuleDeployementUpdate',
  setup() {
    const moduleDeployementService = inject('moduleDeployementService', () => new ModuleDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const moduleDeployement: Ref<IModuleDeployement> = ref(new ModuleDeployement());

    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());

    const moduleVersions: Ref<IModuleVersion[]> = ref([]);

    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());

    const productDeployementDetails: Ref<IProductDeployementDetail[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveModuleDeployement = async moduleDeployementId => {
      try {
        const res = await moduleDeployementService().find(moduleDeployementId);
        moduleDeployement.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.moduleDeployementId) {
      retrieveModuleDeployement(route.params.moduleDeployementId);
    }

    const initRelationships = () => {
      moduleVersionService()
        .retrieve()
        .then(res => {
          moduleVersions.value = res.data;
        });
      productDeployementDetailService()
        .retrieve()
        .then(res => {
          productDeployementDetails.value = res.data;
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
      notes: {},
      createDate: {},
      updateDate: {},
      featureDeployements: {},
      moduleVersion: {},
      productDeployementDetail: {},
    };
    const v$ = useVuelidate(validationRules, moduleDeployement as any);
    v$.value.$validate();

    return {
      moduleDeployementService,
      alertService,
      moduleDeployement,
      previousState,
      isSaving,
      currentLanguage,
      moduleVersions,
      productDeployementDetails,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.moduleDeployement.id) {
        this.moduleDeployementService()
          .update(this.moduleDeployement)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.moduleDeployement.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.moduleDeployementService()
          .create(this.moduleDeployement)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.moduleDeployement.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
