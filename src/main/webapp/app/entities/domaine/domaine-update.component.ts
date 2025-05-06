import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import DomaineService from './domaine.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { Domaine, type IDomaine } from '@/shared/model/domaine.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'DomaineUpdate',
  setup() {
    const domaineService = inject('domaineService', () => new DomaineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const domaine: Ref<IDomaine> = ref(new Domaine());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveDomaine = async domaineId => {
      try {
        const res = await domaineService().find(domaineId);
        domaine.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.domaineId) {
      retrieveDomaine(route.params.domaineId);
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
      createDate: {},
      updateDate: {},
      notes: {},
      moduleVersions: {},
    };
    const v$ = useVuelidate(validationRules, domaine as any);
    v$.value.$validate();

    return {
      domaineService,
      alertService,
      domaine,
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
      if (this.domaine.id) {
        this.domaineService()
          .update(this.domaine)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.domaine.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.domaineService()
          .create(this.domaine)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.domaine.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
