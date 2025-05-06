import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ProductDeployementService from './product-deployement.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ClientService from '@/entities/client/client.service';
import { type IClient } from '@/shared/model/client.model';
import { type IProductDeployement, ProductDeployement } from '@/shared/model/product-deployement.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployementUpdate',
  setup() {
    const productDeployementService = inject('productDeployementService', () => new ProductDeployementService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productDeployement: Ref<IProductDeployement> = ref(new ProductDeployement());

    const clientService = inject('clientService', () => new ClientService());

    const clients: Ref<IClient[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveProductDeployement = async productDeployementId => {
      try {
        const res = await productDeployementService().find(productDeployementId);
        productDeployement.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.productDeployementId) {
      retrieveProductDeployement(route.params.productDeployementId);
    }

    const initRelationships = () => {
      clientService()
        .retrieve()
        .then(res => {
          clients.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      refContract: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      createDate: {},
      updateDate: {},
      notes: {},
      client: {},
    };
    const v$ = useVuelidate(validationRules, productDeployement as any);
    v$.value.$validate();

    return {
      productDeployementService,
      alertService,
      productDeployement,
      previousState,
      isSaving,
      currentLanguage,
      clients,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.productDeployement.id) {
        this.productDeployementService()
          .update(this.productDeployement)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.productDeployement.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.productDeployementService()
          .create(this.productDeployement)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.productDeployement.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
