import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import DeployementTypeService from './deployement-type.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { DeployementType, type IDeployementType } from '@/shared/model/deployement-type.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'DeployementTypeUpdate',
  setup() {
    const deployementTypeService = inject('deployementTypeService', () => new DeployementTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const deployementType: Ref<IDeployementType> = ref(new DeployementType());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveDeployementType = async deployementTypeId => {
      try {
        const res = await deployementTypeService().find(deployementTypeId);
        deployementType.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.deployementTypeId) {
      retrieveDeployementType(route.params.deployementTypeId);
    }

    const initRelationships = () => {};

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      type: {},
      createDate: {},
      updateDate: {},
      notes: {},
      productDeployementDetails: {},
    };
    const v$ = useVuelidate(validationRules, deployementType as any);
    v$.value.$validate();

    return {
      deployementTypeService,
      alertService,
      deployementType,
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
      if (this.deployementType.id) {
        this.deployementTypeService()
          .update(this.deployementType)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.deployementType.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.deployementTypeService()
          .create(this.deployementType)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.deployementType.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
