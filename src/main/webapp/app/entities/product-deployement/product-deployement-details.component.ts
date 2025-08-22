'use client';

import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import ProductDeployementDetailService from '../product-deployement-detail/product-deployement-detail.service';
import ProductDeploymentService from './product-deployement.service';
import ProductVersionService from '../product-version/product-version.service';
import ModuleVersionService from '../module-version/module-version.service';
import ModuleService from '../module/module.service';
import InfraComponentVersionService from '../infra-component-version/infra-component-version.service';
import { useAlertService } from '@/shared/alert/alert.service';
import type AccountService from '@/account/account.service.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployementDetailView',
  setup() {
    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());
    const productDeploymentService = inject('productDeploymentService', () => new ProductDeploymentService());
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());
    const moduleService = inject('moduleService', () => new ModuleService());
    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);
    const accountService = inject<AccountService>('accountService');

    const route = useRoute();
    const router = useRouter();
    const hasAnyAuthorityValues: Ref<any> = ref({});
    const deploymentDetail: Ref<any> = ref({});
    const clientName = ref('');
    const productName = ref('');
    const infraComponents = ref([]);
    const showPdfModal = ref(false);
    const pdfUrl = ref<string | null>(null);
    const isLoading = ref(false);

    // Caches pour les modules
    const moduleOptions = ref([]);
    const moduleVersionOptions = ref([]);

    const previousState = () => router.go(-1);

    // Fonction pour récupérer le nom du module (similaire au composant principal)
    const getModuleName = moduleVersion => {
      if (typeof moduleVersion === 'number' || typeof moduleVersion === 'string') {
        const fullModuleVersion = getModuleVersionWithModuleCached(Number(moduleVersion));
        return fullModuleVersion?.module?.name || 'Module inconnu';
      }

      if (moduleVersion && moduleVersion.id) {
        const fullModuleVersion = getModuleVersionWithModuleCached(moduleVersion.id);
        return fullModuleVersion?.module?.name || 'Module inconnu';
      }

      if (moduleVersion && moduleVersion.module && moduleVersion.module.name) {
        return moduleVersion.module.name;
      }

      return 'Module inconnu';
    };

    // Fonction pour récupérer moduleVersion avec module complet
    const getModuleVersionWithModuleCached = moduleVersionId => {
      const moduleVersion = moduleVersionOptions.value.find(mv => mv.id === moduleVersionId);
      if (!moduleVersion) return null;

      const module = moduleOptions.value.find(m => m.id === moduleVersion.module?.id);
      return {
        ...moduleVersion,
        module: module ? { ...module } : null,
      };
    };

    // Fonction pour formater les dates
    const formatDate = dateString => {
      if (!dateString) return 'Non définie';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      });
    };

    // Fonction pour déterminer le statut du déploiement
    const getDeploymentStatus = () => {
      if (!deploymentDetail.value.startDeployementDate) return 'Not Started';

      const now = new Date();
      const startDate = new Date(deploymentDetail.value.startDeployementDate);
      const endDate = deploymentDetail.value.endDeployementDate ? new Date(deploymentDetail.value.endDeployementDate) : null;

      if (now < startDate) return 'Scheduled';
      if (endDate && now > endDate) return 'Completed';
      if (!endDate || now <= endDate) return 'In Progress';

      return 'Unknown';
    };

    // Fonction pour la classe CSS du badge de statut
    const getStatusBadgeClass = () => {
      const status = getDeploymentStatus();
      switch (status) {
        case 'Completed':
          return 'badge badge-success';
        case 'In Progress':
          return 'badge badge-warning';
        case 'Scheduled':
          return 'badge badge-primary';
        case 'Not Started':
          return 'badge badge-secondary';
        default:
          return 'badge badge-secondary';
      }
    };

    // Récupérer les options de modules
    const fetchModuleOptions = async () => {
      try {
        const res = await moduleService().retrieve();
        moduleOptions.value = res.data;
      } catch (err) {
        console.error('Error fetching modules:', err);
      }
    };

    // Récupérer les options de moduleVersions
    const fetchModuleVersionOptions = async () => {
      try {
        const res = await moduleVersionService().retrieve();
        moduleVersionOptions.value = res.data;
      } catch (err) {
        console.error('Error fetching module versions:', err);
      }
    };

    // Récupérer les composants d'infrastructure pour ce détail
    const retrieveInfraComponents = async () => {
      if (!deploymentDetail.value.productVersion?.id) return;

      try {
        const productVersionResponse = await productVersionService().find(deploymentDetail.value.productVersion.id);
        if (productVersionResponse.infraComponentVersions) {
          // Enrichir avec les détails complets des composants
          const enrichedComponents = [];
          for (const icv of productVersionResponse.infraComponentVersions) {
            try {
              const fullComponent = await infraComponentVersionService().find(icv.id);
              enrichedComponents.push(fullComponent);
            } catch (error) {
              console.warn(`Could not fetch full infra component ${icv.id}:`, error);
              enrichedComponents.push(icv);
            }
          }
          infraComponents.value = enrichedComponents;
        }
      } catch (error) {
        console.error('Error retrieving infrastructure components:', error);
      }
    };

    // Récupérer le détail de déploiement
    const retrieveDeploymentDetail = async (detailId: string | string[]) => {
      isLoading.value = true;
      try {
        const res = await productDeployementDetailService().find(Number(detailId));
        deploymentDetail.value = res;

        // Enrichir les modules autorisés
        if (res.allowedModuleVersions && res.allowedModuleVersions.length > 0) {
          await fetchModuleOptions();
          await fetchModuleVersionOptions();

          const enrichedModules = res.allowedModuleVersions.map(mv => {
            const fullModuleVersion = getModuleVersionWithModuleCached(mv.id);
            return fullModuleVersion || mv;
          });
          deploymentDetail.value.allowedModuleVersions = enrichedModules;
        }

        // Récupérer les informations du déploiement parent
        if (res.productDeployement?.id) {
          try {
            const deploymentRes = await productDeploymentService().find(res.productDeployement.id);
            clientName.value = deploymentRes.client?.name || 'N/A';
            productName.value = deploymentRes.product?.name || 'N/A';
          } catch (error) {
            console.error('Error fetching parent deployment:', error);
          }
        }

        // Récupérer les composants d'infrastructure
        await retrieveInfraComponents();
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isLoading.value = false;
      }
    };

    // Générer un rapport (placeholder)
    const generateReport = async () => {
      try {
        isLoading.value = true;
        // Placeholder pour la génération de rapport
        // const pdfBlob = await productDeployementDetailService().generateDetailReport(Number(deploymentDetail.value.id));
        // const url = window.URL.createObjectURL(pdfBlob);
        // pdfUrl.value = url;
        // showPdfModal.value = true;

        alertService.showInfo('Report generation feature coming soon!', { variant: 'info' });
      } catch (error) {
        alertService.showHttpError(error.response);
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
        link.download = 'deployment_detail_report.pdf';
        link.click();
      }
    };

    if (route.params?.productDeployementDetailId) {
      retrieveDeploymentDetail(route.params.productDeployementDetailId);
    }

    return {
      alertService,
      deploymentDetail,
      clientName,
      productName,
      infraComponents,
      retrieveDeploymentDetail,
      previousState,
      generateReport,
      showPdfModal,
      pdfUrl,
      closePdfModal,
      downloadPdf,
      accountService,
      hasAnyAuthorityValues,
      isLoading,
      formatDate,
      getDeploymentStatus,
      getStatusBadgeClass,
      getModuleName,
      t$: useI18n().t,
    };
  },
  methods: {
    hasAnyAuthority(authorities: any): boolean {
      return true; // Suppression des restrictions d'autorité comme demandé
    },
  },
});
