import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import CountryService from './country.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type ICountry } from '@/shared/model/country.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'CountryDetails',
  setup() {
    const countryService = inject('countryService', () => new CountryService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const country: Ref<ICountry> = ref({});

    const retrieveCountry = async countryId => {
      try {
        const res = await countryService().find(countryId);
        country.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.countryId) {
      retrieveCountry(route.params.countryId);
    }

    return {
      alertService,
      country,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
