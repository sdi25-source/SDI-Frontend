import { defineComponent, inject, onMounted, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlertService } from '@/shared/alert/alert.service';
import Chart from 'chart.js/auto';

// Import services and models
import ClientService from '@/entities/client/client.service';
import ProductDeployementService from '@/entities/product-deployement/product-deployement.service';
import ProductDeployementDetailService from '@/entities/product-deployement-detail/product-deployement-detail.service';
import RequestOfChangeService from '@/entities/request-of-change/request-of-change.service';

import type { IClient } from '@/shared/model/client.model';
import type { IProductDeployement } from '@/shared/model/product-deployement.model';
import type { IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';
import type { IRequestOfChange } from '@/shared/model/request-of-change.model';
import ClientSizeService from '@/entities/client-size/client-size.service.ts';
import ClientTypeService from '@/entities/client-type/client-type.service.ts';
import CustomisationLevelService from '@/entities/customisation-level/customisation-level.service.ts';
import ProductVersionService from '@/entities/product-version/product-version.service.ts';
import ModuleVersionService from '@/entities/module-version/module-version.service.ts';
import ModuleService from '@/entities/module/module.service.ts';

// Client overview interface
interface ClientOverview {
  id: number;
  name: string;
  type: string;
  badgeClass: string;
  icon: string;
  products: number;
  requestsOfChanges: number;
  deployments: number;
}

// Interface pour les points du scatter plot
interface ScatterPoint {
  x: number; // timestamp
  y: number; // valeur (toujours 1 pour un point)
  r: number; // rayon du cercle
  date: string; // date formatée pour l'affichage
  requestId: number; // ID de la demande
  description?: string; // description optionnelle
}

export default defineComponent({
  name: 'DashClientsComponent',
  setup() {
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);
    const { t } = useI18n();

    // Scroll refs
    const scrollContainer = ref<HTMLElement | null>(null);
    const isAtStart = ref(true);
    const isAtEnd = ref(false);

    // Data refs
    const clients = ref<ClientOverview[]>([]);
    const loading = ref(true);

    // Charts related refs
    const selectedClient = ref<ClientOverview | null>(null);
    const clientProductDeployments = ref<IProductDeployement[]>([]);

    const productDeploymentsChart = ref<HTMLCanvasElement | null>(null);
    const requestChangesChart = ref<HTMLCanvasElement | null>(null);
    const productDeploymentsChartInstance = ref<Chart | null>(null);
    const requestChangesChartInstance = ref<Chart | null>(null);

    // Initialiser correctement les données
    const productDeploymentsChartData = ref({ labels: [], datasets: [] });
    const requestChangesChartData = ref({ datasets: [] }); // Pas de labels pour scatter plot
    const totalRequests = ref({ basic: 0, intermediate: 0, advanced: 0 });

    // Services
    const clientService = new ClientService();
    const moduleVersionService = new ModuleVersionService();
    const moduleService = new ModuleService();
    const productDeployementService = new ProductDeployementService();
    const productDeployementDetailService = new ProductDeployementDetailService();
    const requestOfChangeService = new RequestOfChangeService();
    const customisationLevelService = new CustomisationLevelService();
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());

    const fetchClients = async () => {
      try {
        loading.value = true;
        const res = await clientService.retrieve();
        const clientsData: IClient[] = res.data;

        clients.value = await Promise.all(
          clientsData.map(async (client, index) => {
            const deployments = await countClientDeployments(client.id!);
            const products = await countClientProducts(client.id!);
            const requestOfChanges = await countClientRequestOfChanges(client.id);

            if (client.size?.id) {
              try {
                client.size = await clientSizeService().find(client.size.id);
              } catch (sizeError) {
                console.error('Erreur de chargement du client size:', sizeError);
              }
            }
            if (client.clientType?.id) {
              try {
                client.clientType = await clientTypeService().find(client.clientType.id);
              } catch (typeError) {
                console.error('Erreur de chargement du client type:', typeError);
              }
            }

            return {
              id: client.id!,
              name: client.name || 'Unknown Client',
              type: client.clientType?.type,
              badgeClass: getClientBadgeClass(1),
              icon: 'bi-building',
              products: products,
              requestsOfChanges: requestOfChanges,
              deployments: deployments,
            };
          }),
        );
      } catch (error) {
        console.error('Error fetching clients:', error);
        alertService.showHttpError(error.response || error);
      } finally {
        loading.value = false;
      }
    };

    const countClientDeployments = async (clientId: number): Promise<number> => {
      try {
        // Fetch all product deployments
        const res = await productDeployementService.retrieve();
        const deployments = res.data.filter((pd: IProductDeployement) => pd.client?.id === clientId);

        // If no deployments found, return 0
        if (!deployments.length) {
          return 0;
        }

        // Fetch all product deployment details
        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve();
        const allDetails: IProductDeployementDetail[] = productDeploymentDetailsRes.data;

        // Count details for all deployments
        const detailsCount = deployments.reduce((count, deployment: IProductDeployement) => {
          const deploymentDetails = allDetails.filter(detail => detail.productDeployement?.id === deployment.id);
          return count + deploymentDetails.length;
        }, 0);

        return detailsCount;
      } catch (error) {
        console.error('Error counting client deployments:', error);
        throw error; // Rethrow the error for upstream handling
      }
    };

    const countClientProducts = async (clientId: number): Promise<number> => {
      try {
        const res = await productDeployementService.retrieve();
        const deployments = res.data.filter((pd: IProductDeployement) => pd.client?.id === clientId);
        const uniqueProducts = new Set(deployments.map((pd: IProductDeployement) => pd.id));
        return uniqueProducts.size;
      } catch (error) {
        console.error('Error counting client products:', error);
        return 0;
      }
    };

    const countClientRequestOfChanges = async (clientId: number): Promise<number> => {
      try {
        const res = await requestOfChangeService.retrieve();
        const requestsOfChanges = res.data.filter((req: IRequestOfChange) => req.client?.id === clientId);
        return requestsOfChanges.length;
      } catch (error) {
        console.error('Error counting client RequestsOfChanges:', error);
        return 0;
      }
    };

    const getClientBadgeClass = (index: number): string => {
      const classes = ['finance', 'insurance', 'security', 'analytics', 'communication', 'health', 'logistics'];
      return classes[index % classes.length];
    };

    const getClientIcon = (index: number): string => {
      const icons = ['bi-building', 'bi-shield-check', 'bi-graph-up', 'bi-chat-dots', 'bi-heart-pulse', 'bi-truck'];
      return icons[index % icons.length];
    };

    const selectClient = async (client: ClientOverview) => {
      // D'abord détruire les graphiques existants
      destroyCharts();

      selectedClient.value = client;
      await nextTick();

      // Charger les données
      await loadClientChartsData(client);

      // Attendre un peu puis créer les nouveaux graphiques
      setTimeout(() => {
        createCharts();
      }, 150);
    };

    const closeCharts = () => {
      selectedClient.value = null;
      destroyCharts();
    };

    const destroyCharts = () => {
      if (productDeploymentsChartInstance.value) {
        productDeploymentsChartInstance.value.destroy();
        productDeploymentsChartInstance.value = null;
      }
      if (requestChangesChartInstance.value) {
        requestChangesChartInstance.value.destroy();
        requestChangesChartInstance.value = null;
      }
      // Attendre un peu avant de recréer
      setTimeout(() => {
        // Les graphiques sont maintenant prêts à être recréés
      }, 100);
    };

    const loadClientChartsData = async (client: ClientOverview) => {
      try {
        await loadProductDeploymentsChartData(client.id);
        await loadRequestChangesScatterData(client.id);
      } catch (error) {
        console.error('Error loading client charts data:', error);
        alertService.showHttpError(error.response || error);
      }
    };

    const loadProductDeploymentsChartData = async (clientId: number) => {
      try {
        const productDeploymentsRes = await productDeployementService.retrieve();
        const productDeployments = productDeploymentsRes.data.filter((pd: IProductDeployement) => pd.client?.id === clientId);

        clientProductDeployments.value = productDeployments;

        if (productDeployments.length === 0) {
          productDeploymentsChartData.value = { labels: [], datasets: [] };
          return;
        }

        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve();
        const allDetails: IProductDeployementDetail[] = productDeploymentDetailsRes.data;
        const deploymentDetailCounts = new Map<string, number>();
        const deploymentDetailsMap = new Map<string, { name: string; version: string; date: string }[]>();

        productDeployments.forEach((deployment: IProductDeployement) => {
          const deploymentName = `${deployment.product?.name || 'Unknown Product'} - ${deployment.refContract || 'No Contract'}`;
          const details = allDetails.filter(detail => detail.productDeployement?.id === deployment.id);
          const detailsCount = details.length;

          // Collecter les détails pour chaque déploiement
          const deploymentInfo = details.map(detail => ({
            name: deploymentName,
            version: 'v ' + detail.productVersion?.version || 'Unknown Version',
            date: detail.startDeployementDate
              ? new Date(detail.startDeployementDate).toLocaleDateString('en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric',
                })
              : 'No Date',
          }));

          deploymentDetailCounts.set(deploymentName, detailsCount);
          deploymentDetailsMap.set(deploymentName, deploymentInfo);
        });

        const filteredEntries = Array.from(deploymentDetailCounts.entries()).filter(([_, count]) => count > 0);

        if (filteredEntries.length === 0) {
          productDeploymentsChartData.value = { labels: [], datasets: [] };
          return;
        }

        const labels = filteredEntries.map(entry => entry[0]);
        const data = filteredEntries.map(entry => entry[1]);
        const backgroundColors = generateColors(labels.length);

        productDeploymentsChartData.value = {
          labels,
          datasets: [
            {
              data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
              borderWidth: 2,
              deploymentDetails: Object.fromEntries(deploymentDetailsMap), // Stocker les détails pour les tooltips
            },
          ],
        };
      } catch (error) {
        console.error('Error loading product deployments chart data:', error);
        productDeploymentsChartData.value = { labels: [], datasets: [] };
      }
    };

    const loadRequestChangesScatterData = async (clientId: number) => {
      try {
        // Get all request of changes for this client
        const requestChangesRes = await requestOfChangeService.retrieve();
        const clientRequests = requestChangesRes.data.filter((req: IRequestOfChange) => req.client?.id === clientId);

        console.log('Client requests found:', clientRequests);

        if (clientRequests.length === 0) {
          requestChangesChartData.value = { datasets: [] };
          totalRequests.value = { basic: 0, intermediate: 0, advanced: 0 };
          return;
        }

        // Préparer les points pour le scatter plot
        const basicPoints: ScatterPoint[] = [];
        const intermediatePoints: ScatterPoint[] = [];
        const advancedPoints: ScatterPoint[] = [];

        // Initialize totals
        let totalBasic = 0;
        let totalIntermediate = 0;
        let totalAdvanced = 0;

        for (const request of clientRequests) {
          console.log('Processing request:', {
            id: request.id,
            createDate: request.createDate,
            customisationLevel: request.customisationLevel,
          });

          if (request.createDate) {
            const date = new Date(request.createDate);
            const timestamp = date.getTime();
            const formattedDate = date.toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'short',
              day: 'numeric',
            });

            // Get the customization level from the request
            let customizationLevel = '';
            if (request.customisationLevel?.id) {
              try {
                const customisationLevelData = await customisationLevelService.find(request.customisationLevel.id);
                customizationLevel =
                  customisationLevelData.level?.toLowerCase() ||
                  customisationLevelData.name?.toLowerCase() ||
                  customisationLevelData.type?.toLowerCase() ||
                  '';
                console.log('Customization level fetched:', customizationLevel);
              } catch (error) {
                console.error('Error fetching customization level:', error);
              }
            } else if (typeof request.customisationLevel === 'string') {
              customizationLevel = request.customisationLevel.toLowerCase();
            }

            console.log('Customization level extracted:', customizationLevel);

            // Récupérer le produit et la version associés
            let productName = 'Unknown Product';
            let productVersion = 'Unknown Version';
            if (request.productVersion?.id) {
              try {
                const productVersionData = await productVersionService().find(request.productVersion.id);
                productName = productVersionData.product?.name || 'Unknown Product';
                productVersion = productVersionData.version || 'Unknown Version';
              } catch (error) {
                console.error(`Error fetching product version for request ${request.id}:`, error);
              }
            }

            // Récupérer les noms des modules affectés
            const moduleNames =
              request.moduleVersions?.map(
                mv =>
                  getModuleVersionWithModuleCached(mv.id).module?.name + ' v' + getModuleVersionWithModuleCached(mv.id).version + '\n' ||
                  'Unknown Module',
              ) || [];

            // Créer un point pour le scatter plot
            const point: ScatterPoint = {
              x: timestamp,
              y: 1, // Toujours 1 pour un point
              r: 10, // Rayon du cercle
              date: formattedDate,
              productName,
              productVersion,
              moduleNames,
            };

            // Catégoriser en fonction du niveau
            if (customizationLevel.includes('basic')) {
              basicPoints.push(point);
              totalBasic++;
            } else if (customizationLevel === 'intermediate') {
              intermediatePoints.push(point);
              totalIntermediate++;
            } else if (customizationLevel === 'advanced') {
              advancedPoints.push(point);
              totalAdvanced++;
            } else {
              // Si aucun niveau n'est reconnu, distribuer de manière équitable
              const requestIndex = clientRequests.indexOf(request);
              if (requestIndex % 3 === 0) {
                basicPoints.push(point);
                totalBasic++;
                console.log('No level found, assigned to basic:', customizationLevel);
              } else if (requestIndex % 3 === 1) {
                intermediatePoints.push(point);
                totalIntermediate++;
                console.log('No level found, assigned to intermediate:', customizationLevel);
              } else {
                advancedPoints.push(point);
                totalAdvanced++;
                console.log('No level found, assigned to advanced:', customizationLevel);
              }
            }
          }
        }

        // Update totals
        totalRequests.value = {
          basic: totalBasic,
          intermediate: totalIntermediate,
          advanced: totalAdvanced,
        };

        console.log('Scatter points prepared:', {
          basic: basicPoints.length,
          intermediate: intermediatePoints.length,
          advanced: advancedPoints.length,
        });

        // Préparer les données pour le graphique
        requestChangesChartData.value = {
          datasets: [
            {
              label: 'Basic',
              data: basicPoints,
              backgroundColor: 'rgba(255, 193, 7, 0.7)',
              borderColor: 'rgba(255, 193, 7, 1)',
              borderWidth: 2,
              pointRadius: 8,
              pointHoverRadius: 12,
            },
            {
              label: 'Intermediate',
              data: intermediatePoints,
              backgroundColor: 'rgba(40, 167, 69, 0.7)',
              borderColor: 'rgba(40, 167, 69, 1)',
              borderWidth: 2,
              pointRadius: 8,
              pointHoverRadius: 12,
            },
            {
              label: 'Advanced',
              data: advancedPoints,
              backgroundColor: 'rgba(220, 53, 69, 0.7)',
              borderColor: 'rgba(220, 53, 69, 1)',
              borderWidth: 2,
              pointRadius: 8,
              pointHoverRadius: 12,
            },
          ],
        };
      } catch (error) {
        console.error('Error loading request changes scatter data:', error);
        requestChangesChartData.value = { datasets: [] };
        totalRequests.value = { basic: 0, intermediate: 0, advanced: 0 };
      }
    };

    const generateColors = (count: number): string[] => {
      const baseColors = [
        'rgba(12, 45, 87, 0.8)',
        'rgba(149, 160, 244, 0.8)',
        'rgba(12, 166, 120, 0.8)',
        'rgba(245, 159, 0, 0.8)',
        'rgba(2, 136, 209, 0.8)',
        'rgba(28, 126, 214, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(255, 87, 34, 0.8)',
      ];

      const result: string[] = [];

      for (let i = 0; i < count; i++) {
        if (i < baseColors.length) {
          result.push(baseColors[i]);
        } else {
          const hue = ((i - baseColors.length) * 360) / (count - baseColors.length);
          result.push(`hsla(${hue}, 70%, 60%, 0.8)`);
        }
      }

      return result;
    };

    const createCharts = () => {
      destroyCharts();
      createProductDeploymentsChart();
      createRequestChangesScatterChart();
    };

    const createProductDeploymentsChart = () => {
      if (
        productDeploymentsChart.value &&
        productDeploymentsChartData.value.labels &&
        productDeploymentsChartData.value.labels.length > 0
      ) {
        productDeploymentsChartInstance.value = new Chart(productDeploymentsChart.value, {
          type: 'doughnut',
          data: productDeploymentsChartData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true,
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    const deploymentDetails = context.dataset.deploymentDetails?.[label] || [];

                    // Créer le tooltip avec les déploiements en format de liste
                    const tooltipLines = [`${label}: ${value} deployment details (${percentage}%)`];

                    if (deploymentDetails.length > 0) {
                      tooltipLines.push('Deployments:');
                      deploymentDetails.forEach((detail, index) => {
                        tooltipLines.push(`- Deployment ${index + 1} - ${detail.version} - ${detail.date}`);
                      });
                    } else {
                      tooltipLines.push('No Deployments');
                    }

                    return tooltipLines;
                  },
                },
              },
            },
          },
        });
      }
    };

    const createRequestChangesScatterChart = () => {
      if (requestChangesChart.value && requestChangesChartData.value.datasets && requestChangesChartData.value.datasets.length > 0) {
        requestChangesChartInstance.value = new Chart(requestChangesChart.value, {
          type: 'scatter',
          data: requestChangesChartData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20,
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const point = context.raw as ScatterPoint;
                    const tooltipLines = [
                      `Date: ${point.date}`,
                      `Product: ${point.productName || 'Unknown'} - ${point.productVersion || 'Unknown'}`,
                    ];

                    // Ajouter la liste des modules affectés
                    if (point.moduleNames && point.moduleNames.length > 0) {
                      tooltipLines.push('Modules Affected:');
                      point.moduleNames.forEach(module => {
                        tooltipLines.push(`- ${module}`);
                      });
                    } else {
                      tooltipLines.push('No Modules Affected');
                    }

                    return tooltipLines.filter(Boolean);
                  },
                },
              },
            },
            scales: {
              x: {
                type: 'linear',
                position: 'bottom',
                title: {
                  display: true,
                  text: 'Timeline',
                  font: {
                    size: 12,
                    weight: 'bold',
                  },
                },
                ticks: {
                  callback: function (value) {
                    // Convert timestamp back to readable date
                    const date = new Date(value as number);
                    return date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
                  },
                },
              },
              y: {
                display: false, // Cacher l'axe Y car tous les points ont y=1
                min: 0,
                max: 2,
              },
            },
            elements: {
              point: {
                radius: 10,
                hoverRadius: 15,
                borderWidth: 2,
              },
            },
            interaction: {
              mode: 'nearest',
              intersect: true,
            },
          },
        });
      }
    };

    const scrollLeft = () => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: -320, behavior: 'smooth' });
      }
    };

    const scrollRight = () => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollBy({ left: 320, behavior: 'smooth' });
      }
    };

    const checkScrollPosition = () => {
      if (scrollContainer.value) {
        const scrollLeft = scrollContainer.value.scrollLeft;
        const scrollWidth = scrollContainer.value.scrollWidth;
        const clientWidth = scrollContainer.value.clientWidth;
        isAtStart.value = scrollLeft === 0;
        isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 1;
      }
    };

    onMounted(async () => {
      fetchClients();
      checkScrollPosition();
      await fetchModuleOptions();
      await fetchModuleVersionOptions();
    });

    const moduleOptions = ref([]);
    const fetchModuleOptions = async () => {
      try {
        const res = await moduleService.retrieve();
        moduleOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const moduleVersionOptions = ref([]);
    const fetchModuleVersionOptions = async () => {
      try {
        const res = await moduleVersionService.retrieve();
        moduleVersionOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const getModuleVersionWithModuleCached = moduleVersionId => {
      // 1. Trouver la version de module dans le cache
      const moduleVersion = moduleVersionOptions.value.find(mv => mv.id === moduleVersionId);

      if (!moduleVersion) return null;

      // 2. Trouver le module associé dans le cache
      const module = moduleOptions.value.find(m => m.id === moduleVersion.module?.id);

      // 3. Fusionner les données
      return {
        ...moduleVersion,
        module: module ? { ...module } : null,
      };
    };

    return {
      scrollContainer,
      clients,
      isAtStart,
      isAtEnd,
      scrollLeft,
      scrollRight,
      checkScrollPosition,
      loading,
      selectedClient,
      clientProductDeployments,
      selectClient,
      closeCharts,
      productDeploymentsChart,
      requestChangesChart,
      productDeploymentsChartData,
      requestChangesChartData,
      totalRequests,
      t$: t,
    };
  },
});
