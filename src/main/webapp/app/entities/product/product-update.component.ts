import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ProductService from './product.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductLineService from '@/entities/product-line/product-line.service';
import { type IProductLine } from '@/shared/model/product-line.model';
import ModuleService from '@/entities/module/module.service';
import { type IModule } from '@/shared/model/module.model';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';
import { type IInfraComponentVersion } from '@/shared/model/infra-component-version.model';
import { type IProduct, Product } from '@/shared/model/product.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductUpdate',
  setup() {
    const productService = inject('productService', () => new ProductService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const product: Ref<IProduct> = ref(new Product());

    const productLineService = inject('productLineService', () => new ProductLineService());

    const productLines: Ref<IProductLine[]> = ref([]);

    const moduleService = inject('moduleService', () => new ModuleService());

    const modules: Ref<IModule[]> = ref([]);

    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());

    const infraComponentVersions: Ref<IInfraComponentVersion[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveProduct = async productId => {
      try {
        const res = await productService().find(productId);
        product.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productId) {
      retrieveProduct(route.params.productId);
    }

    const initRelationships = () => {
      productLineService()
        .retrieve()
        .then(res => {
          productLines.value = res.data;
        });
      moduleService()
        .retrieve()
        .then(res => {
          modules.value = res.data;
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
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      logo: {},
      description: {},
      createDate: {},
      updateDate: {},
      productLines: {},
      modules: {},
      infraComponentVersions: {},
    };
    const v$ = useVuelidate(validationRules, product as any);
    v$.value.$validate();

    return {
      productService,
      alertService,
      product,
      previousState,
      isSaving,
      currentLanguage,
      productLines,
      modules,
      infraComponentVersions,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {
    this.product.productLines = [];
    this.product.modules = [];
    this.product.infraComponentVersions = [];
  },
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.product.id) {
        this.productService()
          .update(this.product)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.product.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.productService()
          .create(this.product)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.product.created', { param: param.id }).toString());
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
