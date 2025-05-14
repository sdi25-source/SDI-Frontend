import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import RequestOfChangeService from './request-of-change.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ProductVersionService from '@/entities/product-version/product-version.service';
import { type IProductVersion } from '@/shared/model/product-version.model';
import ClientService from '@/entities/client/client.service';
import { type IClient } from '@/shared/model/client.model';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import { type IModuleVersion } from '@/shared/model/module-version.model';
import CustomisationLevelService from '@/entities/customisation-level/customisation-level.service';
import { type ICustomisationLevel } from '@/shared/model/customisation-level.model';
import { type IRequestOfChange, RequestOfChange } from '@/shared/model/request-of-change.model';
import { RequestStatus } from '@/shared/model/enumerations/request-status.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'RequestOfChangeUpdate',
  setup() {
    const requestOfChangeService = inject('requestOfChangeService', () => new RequestOfChangeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const requestOfChange: Ref<IRequestOfChange> = ref(new RequestOfChange());

    const productVersionService = inject('productVersionService', () => new ProductVersionService());

    const productVersions: Ref<IProductVersion[]> = ref([]);

    const clientService = inject('clientService', () => new ClientService());

    const clients: Ref<IClient[]> = ref([]);

    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());

    const moduleVersions: Ref<IModuleVersion[]> = ref([]);

    const customisationLevelService = inject('customisationLevelService', () => new CustomisationLevelService());

    const customisationLevels: Ref<ICustomisationLevel[]> = ref([]);
    const requestStatusValues: Ref<string[]> = ref(Object.keys(RequestStatus));
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveRequestOfChange = async requestOfChangeId => {
      try {
        const res = await requestOfChangeService().find(requestOfChangeId);
        requestOfChange.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.requestOfChangeId) {
      retrieveRequestOfChange(route.params.requestOfChangeId);
    }

    const initRelationships = () => {
      productVersionService()
        .retrieve()
        .then(res => {
          productVersions.value = res.data;
        });
      clientService()
        .retrieve()
        .then(res => {
          clients.value = res.data;
        });
      moduleVersionService()
        .retrieve()
        .then(res => {
          moduleVersions.value = res.data;
        });
      customisationLevelService()
        .retrieve()
        .then(res => {
          customisationLevels.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      title: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      keywords: {},
      status: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      description: {},
      createDate: {},
      updateDate: {},
      productVersion: {},
      client: {},
      moduleVersions: {},
      customisationLevel: {},
    };
    const v$ = useVuelidate(validationRules, requestOfChange as any);
    v$.value.$validate();

    return {
      requestOfChangeService,
      alertService,
      requestOfChange,
      previousState,
      requestStatusValues,
      isSaving,
      currentLanguage,
      productVersions,
      clients,
      moduleVersions,
      customisationLevels,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {
    this.requestOfChange.moduleVersions = [];
  },
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.requestOfChange.id) {
        this.requestOfChangeService()
          .update(this.requestOfChange)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.requestOfChange.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.requestOfChangeService()
          .create(this.requestOfChange)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.requestOfChange.created', { param: param.id }).toString());
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
