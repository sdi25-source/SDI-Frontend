import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ClientSizeService from './client-size.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IClientSize } from '@/shared/model/client-size.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientSizeDetails',
  setup() {
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const clientSize: Ref<IClientSize> = ref({});

    const retrieveClientSize = async clientSizeId => {
      try {
        const res = await clientSizeService().find(clientSizeId);
        clientSize.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientSizeId) {
      retrieveClientSize(route.params.clientSizeId);
    }

    return {
      alertService,
      clientSize,

      ...dataUtils,

      previousState,
      t$: useI18n().t,
    };
  },
});
