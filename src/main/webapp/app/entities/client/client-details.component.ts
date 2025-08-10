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
import jsPDF from 'jspdf';
import S2MLogo from '@/../content/images/bgImage.png';

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
        isLoading.value = true;
        const clientData = await clientService().getClientData(Number(client.value.id));
        console.log('Data :', clientData);
        const doc = new jsPDF();
        let yPosition = 20;
        const pageHeight = doc.internal.pageSize.height;
        const margin = 20;
        const tableWidth = 170;
        const colWidths = [80, 40, 50]; // Adjust column widths as needed

        // Function to add a new page if necessary
        const checkPageBreak = (requiredSpace = 20) => {
          if (yPosition + requiredSpace > pageHeight - margin) {
            doc.addPage();
            yPosition = 20;
            return true;
          }
          return false;
        };

        // Function to add wrapped text with automatic line breaks
        const addWrappedText = (text: string, x: number, y: number, maxWidth: number, fontSize = 10) => {
          doc.setFontSize(fontSize);
          doc.setFont('times', 'normal');
          const lines = doc.splitTextToSize(text || 'N/A', maxWidth);
          doc.text(lines, x, y);
          return lines.length * (fontSize * 0.4);
        };

        // Function to draw a table row
        const drawTableRow = (x: number, y: number, data: string[], colWidths: number[], isHeader = false) => {
          let currentX = x;
          doc.setFontSize(10);
          doc.setFont('times', isHeader ? 'bold' : 'normal');
          if (isHeader) {
            doc.setFillColor(12, 45, 87); // #0c2d57
            doc.rect(x, y - 5, tableWidth, 7, 'F');
            doc.setTextColor(255, 255, 255);
          } else {
            doc.setTextColor(0, 0, 0);
            doc.setDrawColor(200, 200, 200);
            data.forEach((_, i) => {
              doc.rect(currentX, y - 5, colWidths[i], 7);
              currentX += colWidths[i];
            });
            currentX = x;
          }
          data.forEach((cell, i) => {
            const cellText = doc.splitTextToSize(cell || 'N/A', colWidths[i] - 2);
            doc.text(cellText[0] || 'N/A', currentX + 1, y);
            currentX += colWidths[i];
          });
        };

        // Header

        doc.setTextColor(12, 45, 87);
        doc.setFontSize(24);
        doc.setFont('times', 'bold');
        doc.text('CLIENT REPORT', margin, 25);

        doc.setFontSize(16);
        doc.setFont('times', 'normal');
        doc.text(clientData.client.name || 'N/A', margin, 35);

        doc.setFontSize(10);
        doc.text(`${new Date().toLocaleDateString()}`, margin+1, 42);

        yPosition = 50;
        doc.setTextColor(0, 0, 0);

        // S2M Logo
        doc.addImage(S2MLogo, 'PNG', doc.internal.pageSize.width - 41, 15, 20, 17);
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        doc.text('+212 (0) 522 87 83 00', 151, 38);
        doc.setFontSize(12);
        doc.setFont('times', 'normal');
        doc.text('S2M - Société Maghrébine de Monétique', 119, 32);
        doc.text('contact@s2m.ma', 160, 43);


        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
        yPosition += 18;

        // Client Information Section
        doc.setFontSize(18);
        doc.setFont('times', 'bold');
        doc.text('CLIENT INFORMATION', margin, yPosition);
        yPosition += 10;

        if (clientData.client.clientLogo) {
          try {
            doc.addImage(clientData.client.clientLogo, 'PNG', doc.internal.pageSize.width - 50, 80, 30, 30);
          } catch (error) {
            console.warn('Could not add client logo:', error);
          }
        }

        doc.setDrawColor(200, 200, 200);
        doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
        yPosition += 10;

        // Client Details
        doc.setFontSize(12);
        doc.setFont('times', 'bold');
        doc.text('Name:', margin, yPosition);
        doc.setFont('times', 'normal');
        doc.text(clientData.client.name || 'N/A', margin + 30, yPosition);
        yPosition += 10;

        doc.setFont('times', 'bold');
        doc.text('Main Contact:', margin, yPosition);
        doc.setFont('times', 'normal');
        doc.text(clientData.client.mainContactName || 'N/A', margin + 30, yPosition);
        yPosition += 10;

        doc.setFont('times', 'bold');
        doc.text('Email:', margin, yPosition);
        doc.setFont('times', 'normal');
        doc.text(clientData.client.mainContactEmail || 'N/A', margin + 30, yPosition);
        yPosition += 10;

        doc.setFont('times', 'bold');
        doc.text('Phone:', margin, yPosition);
        doc.setFont('times', 'normal');
        doc.text(clientData.client.mainContactPhoneNumber || 'N/A', margin + 30, yPosition);
        yPosition += 10;

        doc.setFont('times', 'bold');
        doc.text('Address:', margin, yPosition);
        doc.setFont('times', 'normal');
        doc.text(clientData.client.address || 'N/A', margin + 30, yPosition);
        yPosition += 10;

        doc.setFont('times', 'bold');
        doc.text('Website:', margin, yPosition);
        doc.setFont('times', 'normal');
        doc.text(clientData.client.url || 'N/A', margin + 30, yPosition);
        yPosition += 10;

        doc.setFont('times', 'bold');
        doc.text('Creation Date:', margin, yPosition);
        doc.setFont('times', 'normal');
        doc.text(clientData.client.createDate ? new Date(clientData.client.createDate).toLocaleDateString() : 'N/A', margin + 30, yPosition);
        yPosition += 20;

        // Client Events Section (Table)
        if (clientData.clientEvents && clientData.clientEvents.length > 0) {
          checkPageBreak(30);
          doc.setFontSize(18);
          doc.setFont('times', 'bold');
          doc.text('CLIENT EVENTS', margin, yPosition);
          yPosition += 7;

          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
          yPosition += 10;

          // Table Header
          const eventColWidths = [100, 70]; // Event, Event Date
          drawTableRow(margin, yPosition, ['Event', 'Event Date'], eventColWidths, true);
          yPosition += 7;

          // Table Rows
          clientData.clientEvents.forEach(event => {
            checkPageBreak(10);
            drawTableRow(margin, yPosition, [
              event.event || 'N/A',
              event.eventDate ? new Date(event.eventDate).toLocaleDateString() : 'N/A'
            ], eventColWidths);
            yPosition += 7;
          });
          yPosition += 5;
        }

        yPosition += 13;

        // Product Deployment Summaries Section (Table)
        if (clientData.productDeployementSummaries && clientData.productDeployementSummaries.length > 0) {
          checkPageBreak(30);
          doc.setFontSize(18);
          doc.setFont('times', 'bold');
          doc.text('PRODUCT DEPLOYMENT SUMMARIES', margin, yPosition);
          yPosition += 7;

          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
          yPosition += 10;

          // Table Header
          const deployColWidths = [40, 50, 40, 40]; // Ref Contract, Product, Version, Deployment Type
          drawTableRow(margin, yPosition, ['Ref Contract', 'Product', 'Version', 'Deployment Type'], deployColWidths, true);
          yPosition += 7;

          // Table Rows
          clientData.productDeployementSummaries.forEach(summary => {
            checkPageBreak(10);
            drawTableRow(margin, yPosition, [
              summary.refContract || 'N/A',
              summary.product || 'N/A',
              summary.version || 'N/A',
              summary.deployementType || 'N/A'
            ], deployColWidths);
            yPosition += 7;
          });
          yPosition += 5;
        }

        yPosition += 13;

        // Requests of Changes Section (Listed Directly)
        if (clientData.requestOfChanges && clientData.requestOfChanges.length > 0) {
          checkPageBreak(30);
          doc.setFontSize(18);
          doc.setFont('times', 'bold');
          doc.text('REQUESTS OF CHANGES', margin, yPosition);
          yPosition += 7;

          doc.setDrawColor(200, 200, 200);
          doc.line(margin, yPosition, doc.internal.pageSize.width - margin, yPosition);
          yPosition += 10;

          clientData.requestOfChanges.forEach(request => {
            checkPageBreak(30);
            doc.setFontSize(12);
            doc.setFont('times', 'bold');
            doc.text(`Title: ${request.title || 'N/A'}`, margin + 5, yPosition);
            yPosition += 8;

            doc.setFont('times', 'normal');
            doc.text(`Product: ${request.product || 'N/A'} - v ${request.productVersion || 'N/A'}`, margin + 5, yPosition);
            yPosition += 6;

            doc.text(`Date: ${request.createDate ? new Date(request.createDate).toLocaleDateString() : 'N/A'}`, margin + 5, yPosition);
            yPosition += 6;

            if (request.description) {
              doc.setFont('times', 'bold');
              doc.text('Description:', margin + 5, yPosition);
              yPosition += 5;
              doc.setFont('times', 'normal');
              const descHeight = addWrappedText(request.description, margin + 10, yPosition, 150, 10);
              yPosition += descHeight + 5;
            }
          });
        }

        // Footer on each page
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          doc.setFontSize(8);
          doc.setFont('times', 'normal');
          doc.setTextColor(128, 128, 128);
          doc.text(`Page ${i} of ${totalPages}`, doc.internal.pageSize.width - 40, doc.internal.pageSize.height - 10);
          doc.text(`${clientData.client.name}`, margin, doc.internal.pageSize.height - 10);
        }

        // Generate PDF Blob
        const pdfBlob = doc.output('blob');
        const url = window.URL.createObjectURL(pdfBlob);
        pdfUrl.value = url;
        showPdfModal.value = true;

      } catch (error) {
        console.error('Error generating PDF:', error);
        alertService.showHttpError(error.response || error);
      } finally {
        isLoading.value = false;
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
        link.download = `client_${client.value.name.replace(/[^a-z0-9]/gi, '_')}_report.pdf`;
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
      isLoading,
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
