import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import InfraComponentVersionService from './infra-component-version.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import InfraComponentService from '@/entities/infra-component/infra-component.service';
import { type IInfraComponent } from '@/shared/model/infra-component.model';
import { type IInfraComponentVersion, InfraComponentVersion } from '@/shared/model/infra-component-version.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'InfraComponentVersionUpdate',
  setup() {
    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const infraComponentVersion: Ref<IInfraComponentVersion> = ref(new InfraComponentVersion());

    const infraComponentService = inject('infraComponentService', () => new InfraComponentService());

    const infraComponents: Ref<IInfraComponent[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveInfraComponentVersion = async infraComponentVersionId => {
      try {
        const res = await infraComponentVersionService().find(infraComponentVersionId);
        infraComponentVersion.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.infraComponentVersionId) {
      retrieveInfraComponentVersion(route.params.infraComponentVersionId);
    }

    const initRelationships = () => {
      infraComponentService()
        .retrieve()
        .then(res => {
          infraComponents.value = res.data;
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
      description: {},
      createDate: {},
      updateDate: {},
      infraComponent: {},
      productVersions: {},
      productDeployementDetails: {},
    };
    const v$ = useVuelidate(validationRules, infraComponentVersion as any);
    v$.value.$validate();

    return {
      infraComponentVersionService,
      alertService,
      infraComponentVersion,
      previousState,
      isSaving,
      currentLanguage,
      infraComponents,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.infraComponentVersion.id) {
        this.infraComponentVersionService()
          .update(this.infraComponentVersion)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.infraComponentVersion.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.infraComponentVersionService()
          .create(this.infraComponentVersion)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.infraComponentVersion.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
