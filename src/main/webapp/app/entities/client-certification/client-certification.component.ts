import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import ClientCertificationService from './client-certification.service';
import { type IClientCertification } from '@/shared/model/client-certification.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientCertification',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const clientCertificationService = inject('clientCertificationService', () => new ClientCertificationService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientCertifications: Ref<IClientCertification[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveClientCertifications = async () => {
      isFetching.value = true;
      try {
        const res = await clientCertificationService().retrieve();
        clientCertifications.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClientCertifications();
    };

    onMounted(async () => {
      await retrieveClientCertifications();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IClientCertification) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeClientCertification = async () => {
      try {
        await clientCertificationService().delete(removeId.value);
        const message = t$('sdiFrontendApp.clientCertification.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveClientCertifications();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      clientCertifications,
      handleSyncList,
      isFetching,
      retrieveClientCertifications,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClientCertification,
      t$,
      ...dataUtils,
    };
  },
});
