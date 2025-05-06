import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import DeployementTypeService from './deployement-type.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IDeployementType } from '@/shared/model/deployement-type.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'DeployementTypeDetails',
  setup() {
    const deployementTypeService = inject('deployementTypeService', () => new DeployementTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const deployementType: Ref<IDeployementType> = ref({});

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

    return {
      alertService,
      deployementType,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
