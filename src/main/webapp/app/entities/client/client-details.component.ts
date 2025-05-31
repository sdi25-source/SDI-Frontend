import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ClientService from './client.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IClient } from '@/shared/model/client.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientDetails',
  setup() {
    const clientService = inject('clientService', () => new ClientService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);
    const client: Ref<IClient> = ref({});
    const showPdfModal = ref(false);
    const pdfUrl = ref<string | null>(null);

    const retrieveClient = async (clientId: string | string[]) => {
      try {
        const res = await clientService().find(Number(clientId));
        client.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientId) {
      retrieveClient(route.params.clientId);
    }

    const generateReport = async () => {
      try {
        const pdfBlob = await clientService().generateClientReport(Number(client.value.id));
        const url = window.URL.createObjectURL(pdfBlob);
        pdfUrl.value = url;
        showPdfModal.value = true;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const closePdfModal = () => {
      if (pdfUrl.value) {
        window.URL.revokeObjectURL(pdfUrl.value);
      }
      pdfUrl.value = null;
      showPdfModal.value = false;
    };

    const downloadPdf = () => {
      if (pdfUrl.value) {
        const link = document.createElement('a');
        link.href = pdfUrl.value;
        link.download = 'client_report.pdf';
        link.click();
      }
    };

    return {
      alertService,
      client,
      retrieveClient,
      previousState,
      generateReport,
      showPdfModal,
      pdfUrl,
      closePdfModal,
      downloadPdf,
      ...dataUtils,
      t$: useI18n().t,
    };
  },
});
