import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ProductDeployementDetailService from './product-deployement-detail.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductDeployementService from '@/entities/product-deployement/product-deployement.service';
import { type IProductDeployement } from '@/shared/model/product-deployement.model';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import ProductVersionService from '@/entities/product-version/product-version.service';
import { type IProductVersion } from '@/shared/model/product-version.model';
import DeployementTypeService from '@/entities/deployement-type/deployement-type.service';
import { type IDeployementType } from '@/shared/model/deployement-type.model';
import { type IProductDeployementDetail, ProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployementDetailUpdate',
  setup() {
    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productDeployementDetail: Ref<IProductDeployementDetail> = ref(new ProductDeployementDetail());

    const productDeployementService = inject('productDeployementService', () => new ProductDeployementService());

    const productDeployements: Ref<IProductDeployement[]> = ref([]);

    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());

    const infraComponentVersions: Ref<IInfraComponentVersion[]> = ref([]);

    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());

    const moduleVersions: Ref<IModuleVersion[]> = ref([]);

    const productVersionService = inject('productVersionService', () => new ProductVersionService());

    const productVersions: Ref<IProductVersion[]> = ref([]);

    const deployementTypeService = inject('deployementTypeService', () => new DeployementTypeService());

    const deployementTypes: Ref<IDeployementType[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveProductDeployementDetail = async productDeployementDetailId => {
      try {
        const res = await productDeployementDetailService().find(productDeployementDetailId);
        productDeployementDetail.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productDeployementDetailId) {
      retrieveProductDeployementDetail(route.params.productDeployementDetailId);
    }

    const initRelationships = () => {
      productDeployementService()
        .retrieve()
        .then(res => {
          productDeployements.value = res.data;
        });
      infraComponentVersionService()
        .retrieve()
        .then(res => {
          infraComponentVersions.value = res.data;
        });
      moduleVersionService()
        .retrieve()
        .then(res => {
          moduleVersions.value = res.data;
        });
      productVersionService()
        .retrieve()
        .then(res => {
          productVersions.value = res.data;
        });
      deployementTypeService()
        .retrieve()
        .then(res => {
          deployementTypes.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      startDeployementDate: {},
      endDeployementDate: {},
      notes: {},
      moduleDeployements: {},
      productDeployement: {},
      infraComponentVersions: {},
      allowedModuleVersions: {},
      productVersion: {},
      deployementType: {},
    };
    const v$ = useVuelidate(validationRules, productDeployementDetail as any);
    v$.value.$validate();

    return {
      productDeployementDetailService,
      alertService,
      productDeployementDetail,
      previousState,
      isSaving,
      currentLanguage,
      productDeployements,
      infraComponentVersions,
      moduleVersions,
      productVersions,
      deployementTypes,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {
    this.productDeployementDetail.infraComponentVersions = [];
    this.productDeployementDetail.allowedModuleVersions = [];
  },
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.productDeployementDetail.id) {
        this.productDeployementDetailService()
          .update(this.productDeployementDetail)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.productDeployementDetail.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.productDeployementDetailService()
          .create(this.productDeployementDetail)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.productDeployementDetail.created', { param: param.id }).toString());
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
