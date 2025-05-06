import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CertificationService from './certification.service';
import { type ICertification } from '@/shared/model/certification.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Certification',
  setup() {
    const { t: t$ } = useI18n();
    const certificationService = inject('certificationService', () => new CertificationService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const certifications: Ref<ICertification[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveCertifications = async () => {
      isFetching.value = true;
      try {
        const res = await certificationService().retrieve();
        certifications.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveCertifications();
    };

    onMounted(async () => {
      await retrieveCertifications();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: ICertification) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeCertification = async () => {
      try {
        await certificationService().delete(removeId.value);
        const message = t$('sdiFrontendApp.certification.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveCertifications();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      certifications,
      handleSyncList,
      isFetching,
      retrieveCertifications,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeCertification,
      t$,
    };
  },
});
