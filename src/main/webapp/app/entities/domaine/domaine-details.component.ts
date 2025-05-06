import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import DomaineService from './domaine.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IDomaine } from '@/shared/model/domaine.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'DomaineDetails',
  setup() {
    const domaineService = inject('domaineService', () => new DomaineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const domaine: Ref<IDomaine> = ref({});

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

    return {
      alertService,
      domaine,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
