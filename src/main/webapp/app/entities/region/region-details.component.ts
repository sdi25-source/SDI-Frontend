import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import RegionService from './region.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IRegion } from '@/shared/model/region.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'RegionDetails',
  setup() {
    const regionService = inject('regionService', () => new RegionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const region: Ref<IRegion> = ref({});

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

    return {
      alertService,
      region,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
