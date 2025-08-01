import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ClientService from './client.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { type IClient } from '@/shared/model/client.model';
import { useAlertService } from '@/shared/alert/alert.service';
import type AccountService from '@/account/account.service.ts';
import ClientSizeService from '@/entities/client-size/client-size.service.ts';
import ClientTypeService from '@/entities/client-type/client-type.service.ts';
import CountryService from '@/entities/country/country.service.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientDetails',
  setup() {
    const clientService = inject('clientService', () => new ClientService());
    const alertService = inject('alertService', () => useAlertService(), true);
    const accountService = inject<AccountService>('accountService');
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const countryService = inject('countryService', () => new CountryService());

    const dataUtils = useDataUtils();

    const route = useRoute();
    const router = useRouter();
    const hasAnyAuthorityValues: Ref<any> = ref({});
    const client: Ref<IClient> = ref({});
    const showPdfModal = ref(false);
    const pdfUrl = ref<string | null>(null);
    const isLoading = ref(false); // New reactive state for loading

    const previousState = () => router.go(-1);

    const retrieveClient = async (clientId: string | string[]) => {
      try {
        const res = await clientService().find(Number(clientId));
        client.value = res;
        client.value.size = await clientSizeService().find(client.value.size.id);
        client.value.clientType = await clientTypeService().find(client.value.clientType.id);
        client.value.country = await countryService().find(client.value.country.id);
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientId) {
      retrieveClient(route.params.clientId);
    }

    const generateReport = async () => {
      try {
        isLoading.value = true; // Set loading to true before the request
        const pdfBlob = await clientService().generateClientReport(Number(client.value.id));
        const url = window.URL.createObjectURL(pdfBlob);
        pdfUrl.value = url;
        showPdfModal.value = true;
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isLoading.value = false; // Reset loading state after request completes
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
      accountService,
      hasAnyAuthorityValues,
      isLoading, // Expose isLoading to the template
      ...dataUtils,
      t$: useI18n().t,
    };
  },
  methods: {
    hasAnyAuthority(authorities: any): boolean {
      this.accountService.hasAnyAuthorityAndCheckAuth(authorities).then(value => {
        if (this.hasAnyAuthorityValues[authorities] !== value) {
          this.hasAnyAuthorityValues = { ...this.hasAnyAuthorityValues, [authorities]: value };
        }
      });
      return this.hasAnyAuthorityValues[authorities] ?? false;
    },
  },
});
