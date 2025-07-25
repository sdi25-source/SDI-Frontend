import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import RegionService from './region.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import { type IRegion, Region } from '@/shared/model/region.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'RegionUpdate',
  setup() {
    const regionService = inject('regionService', () => new RegionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const region: Ref<IRegion> = ref(new Region());
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveRegion = async regionId => {
      try {
        const res = await regionService().find(regionId);
        region.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.regionId) {
      retrieveRegion(route.params.regionId);
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
      countries: {},
    };
    const v$ = useVuelidate(validationRules, region as any);
    v$.value.$validate();

    return {
      regionService,
      alertService,
      region,
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
      if (this.region.id) {
        this.regionService()
          .update(this.region)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.region.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.regionService()
          .create(this.region)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.region.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
