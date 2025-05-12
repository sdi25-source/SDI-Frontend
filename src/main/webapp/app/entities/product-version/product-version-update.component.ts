import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ProductVersionService from './product-version.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductService from '@/entities/product/product.service';
import { type IProduct } from '@/shared/model/product.model';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';
import { type IProductVersion, ProductVersion } from '@/shared/model/product-version.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductVersionUpdate',
  setup() {
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productVersion: Ref<IProductVersion> = ref(new ProductVersion());

    const productVersions: Ref<IProductVersion[]> = ref([]);

    const productService = inject('productService', () => new ProductService());

    const products: Ref<IProduct[]> = ref([]);

    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());

    const moduleVersions: Ref<IModuleVersion[]> = ref([]);

    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());

    const infraComponentVersions: Ref<IInfraComponentVersion[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveProductVersion = async productVersionId => {
      try {
        const res = await productVersionService().find(productVersionId);
        productVersion.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productVersionId) {
      retrieveProductVersion(route.params.productVersionId);
    }

    const initRelationships = () => {
      productVersionService()
        .retrieve()
        .then(res => {
          productVersions.value = res.data;
        });
      productService()
        .retrieve()
        .then(res => {
          products.value = res.data;
        });
      moduleVersionService()
        .retrieve()
        .then(res => {
          moduleVersions.value = res.data;
        });
      infraComponentVersionService()
        .retrieve()
        .then(res => {
          infraComponentVersions.value = res.data;
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
      productDeployementDetails: {},
      productVersions: {},
      product: {},
      moduleVersions: {},
      infraComponentVersions: {},
      root: {},
    };
    const v$ = useVuelidate(validationRules, productVersion as any);
    v$.value.$validate();

    return {
      productVersionService,
      alertService,
      productVersion,
      previousState,
      isSaving,
      currentLanguage,
      productVersions,
      products,
      moduleVersions,
      infraComponentVersions,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {
    this.productVersion.moduleVersions = [];
    this.productVersion.infraComponentVersions = [];
  },
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.productVersion.id) {
        this.productVersionService()
          .update(this.productVersion)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.productVersion.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.productVersionService()
          .create(this.productVersion)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.productVersion.created', { param: param.id }).toString());
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
