import { defineComponent, inject, onMounted, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useAlertService } from '@/shared/alert/alert.service';
import Chart from 'chart.js/auto';

// Import services and models
import ClientService from '@/entities/client/client.service';
import ProductDeployementService from '@/entities/product-deployement/product-deployement.service';
import ProductDeployementDetailService from '@/entities/product-deployement-detail/product-deployement-detail.service';
import RequestOfChangeService from '@/entities/request-of-change/request-of-change.service';
import ClientSizeService from '@/entities/client-size/client-size.service.ts';
import ClientTypeService from '@/entities/client-type/client-type.service.ts';
import CustomisationLevelService from '@/entities/customisation-level/customisation-level.service.ts';
import ProductVersionService from '@/entities/product-version/product-version.service.ts';
import ModuleVersionService from '@/entities/module-version/module-version.service.ts';
import ModuleService from '@/entities/module/module.service.ts';
import ModuleDeployementService from '@/entities/module-deployement/module-deployement.service.ts';

export default defineComponent({
  name: 'DashClientsComponent',
  setup() {
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);
    const { t } = useI18n();

    // Scroll refs
    const scrollContainer = ref(null);
    const isAtStart = ref(true);
    const isAtEnd = ref(false);

    // Data refs
    const clients = ref([]);
    const loading = ref(true);

    // Charts related refs
    const selectedClient = ref(null);
    const clientProductDeployments = ref([]);
    const productDeploymentsChart = ref(null);
    const requestChangesChart = ref(null);
    const clientsEvolutionChart = ref(null);

    const productDeploymentsChartInstance = ref(null);
    const requestChangesChartInstance = ref(null);
    const clientsEvolutionChartInstance = ref(null);

    // Initialiser correctement les données
    const productDeploymentsChartData = ref({ labels: [], datasets: [] });
    const requestChangesChartData = ref({ datasets: [] }); // Pas de labels pour scatter plot
    const clientsEvolutionData = ref({ labels: [], datasets: [] });
    const totalRequests = ref({ basic: 0, intermediate: 0, advanced: 0 });
    const currentYear = ref(new Date().getFullYear());

    // Module deployments evolution chart refs
    const moduleDeploymentsEvolutionChart = ref(null);
    const moduleDeploymentsEvolutionChartInstance = ref(null);
    const moduleDeploymentsEvolutionData = ref({ labels: [], datasets: [] });
    
    // Module popup functionality refs
    const showModulePopup = ref(false);
    const selectedModuleData = ref(null);

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
    const moduleDeployementService = new ModuleDeployementService();

    const fetchClients = async () => {
      try {
        loading.value = true;
        const res = await clientService.retrieve();
        const clientsData = res.data;

        clients.value = await Promise.all(
          clientsData.map(async (client, index) => {
            const deployments = await countClientDeployments(client.id);
            const products = await countClientProducts(client.id);
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
              id: client.id,
              name: client.name || 'Unknown Client',
              type: client.clientType?.type,
              badgeClass: getClientBadgeClass(index),
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

    const loadClientsEvolutionData = async () => {
      try {
        // Récupérer tous les clients avec leurs dates de création
        const allClients = await clientService.retrieve();
        const clientsData = allClients.data || allClients;

        // Filtrer les clients de l'année courante
        const currentYearClients = clientsData.filter(client => {
          if (!client.createDate) return false;
          const clientYear = new Date(client.createDate).getFullYear();
          return clientYear === currentYear.value;
        });

        // Trier les clients par date de création
        currentYearClients.sort((a, b) => {
          return new Date(a.createDate).getTime() - new Date(b.createDate).getTime();
        });

        // Grouper par mois et calculer le cumul
        const monthlyCount = Array(12).fill(0);
        const cumulativeCount = Array(12).fill(0);
        const clientsByMonth = Array(12).fill(null).map(() => []); // Stocker les noms des clients
        const monthNames = [
          'Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun',
          'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'
        ];

        // Compter les clients par mois et stocker leurs noms
        currentYearClients.forEach(client => {
          const month = new Date(client.createDate).getMonth();
          monthlyCount[month]++;
          clientsByMonth[month].push(client.name); // Stocker le nom du client
        });

        // Calculer le cumul
        let cumul = 0;
        for (let i = 0; i < 12; i++) {
          cumul += monthlyCount[i];
          cumulativeCount[i] = cumul;
        }

        // Créer les données du graphique
        clientsEvolutionData.value = {
          labels: monthNames,
          datasets: [
            {
              label: 'Clients created per month',
              data: monthlyCount,
              backgroundColor: 'rgba(12, 166, 120, 0.8)',
              borderColor: 'rgba(12, 166, 120, 1)',
              borderWidth: 2,
              type: 'bar',
              order: 2,
              clientNames: clientsByMonth // Ajouter les noms des clients
            },
            {
              label: 'Cumulative growth',
              data: cumulativeCount,
              backgroundColor: 'rgba(12, 45, 87, 0.2)',
              borderColor: 'rgba(12, 45, 87, 1)',
              borderWidth: 3,
              type: 'line',
              fill: true,
              tension: 0.4,
              pointBackgroundColor: 'rgba(12, 45, 87, 1)',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 8,
              order: 1
            }
          ]
        };
      } catch (error) {
        console.error('Error loading clients evolution data:', error);
        clientsEvolutionData.value = { labels: [], datasets: [] };
      }
    };

    const countClientDeployments = async (clientId) => {
      try {
        // Fetch all product deployments
        const res = await productDeployementService.retrieve();
        const deployments = res.data.filter((pd) => pd.client?.id === clientId);

        // If no deployments found, return 0
        if (!deployments.length) {
          return 0;
        }

        // Fetch all product deployment details
        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve();
        const allDetails = productDeploymentDetailsRes.data;

        // Count details for all deployments
        const detailsCount = deployments.reduce((count, deployment) => {
          const deploymentDetails = allDetails.filter(detail => detail.productDeployement?.id === deployment.id);
          return count + deploymentDetails.length;
        }, 0);

        return detailsCount;
      } catch (error) {
        console.error('Error counting client deployments:', error);
        throw error; // Rethrow the error for upstream handling
      }
    };

    const countClientProducts = async (clientId) => {
      try {
        const res = await productDeployementService.retrieve();
        const deployments = res.data.filter((pd) => pd.client?.id === clientId);
        const uniqueProducts = new Set(deployments.map((pd) => pd.id));
        return uniqueProducts.size;
      } catch (error) {
        console.error('Error counting client products:', error);
        return 0;
      }
    };

    const countClientRequestOfChanges = async (clientId) => {
      try {
        const res = await requestOfChangeService.retrieve();
        const requestsOfChanges = res.data.filter((req) => req.client?.id === clientId);
        return requestsOfChanges.length;
      } catch (error) {
        console.error('Error counting client RequestsOfChanges:', error);
        return 0;
      }
    };

    const getClientBadgeClass = (index) => {
      const classes = ['finance', 'insurance', 'security', 'analytics', 'communication', 'health', 'logistics'];
      return classes[index % classes.length];
    };

    const selectClient = async (client) => {
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

    const closeCharts = async () => {
      selectedClient.value = null;
      destroyCharts();
      await fetchClients();
      await loadClientsEvolutionData();
      createCharts();
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
      if (clientsEvolutionChartInstance.value) {
        clientsEvolutionChartInstance.value.destroy();
        clientsEvolutionChartInstance.value = null;
      }
      if (moduleDeploymentsEvolutionChartInstance.value) {
        moduleDeploymentsEvolutionChartInstance.value.destroy();
        moduleDeploymentsEvolutionChartInstance.value = null;
      }
    };

    const loadClientChartsData = async (client) => {
      try {
        await loadProductDeploymentsChartData(client.id);
        await loadRequestChangesScatterData(client.id);
        await loadModuleDeploymentsEvolutionData(client.id);
      } catch (error) {
        console.error('Error loading client charts data:', error);
        alertService.showHttpError(error.response || error);
      }
    };

    const loadProductDeploymentsChartData = async (clientId) => {
      try {
        const productDeploymentsRes = await productDeployementService.retrieve();
        const productDeployments = productDeploymentsRes.data.filter((pd) => pd.client?.id === clientId);
        clientProductDeployments.value = productDeployments;

        if (productDeployments.length === 0) {
          productDeploymentsChartData.value = { labels: [], datasets: [] };
          return;
        }

        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve();
        const allDetails = productDeploymentDetailsRes.data;

        const deploymentDetailCounts = new Map();
        const deploymentDetailsMap = new Map();

        productDeployments.forEach((deployment) => {
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

    const loadRequestChangesScatterData = async (clientId) => {
      try {
        // Get all request of changes for this client
        const requestChangesRes = await requestOfChangeService.retrieve();
        const clientRequests = requestChangesRes.data.filter((req) => req.client?.id === clientId);

        if (clientRequests.length === 0) {
          requestChangesChartData.value = { datasets: [] };
          totalRequests.value = { basic: 0, intermediate: 0, advanced: 0 };
          return;
        }

        // Préparer les points pour le scatter plot
        const basicPoints = [];
        const intermediatePoints = [];
        const advancedPoints = [];

        // Initialize totals
        let totalBasic = 0;
        let totalIntermediate = 0;
        let totalAdvanced = 0;

        for (const request of clientRequests) {
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
              } catch (error) {
                console.error('Error fetching customization level:', error);
              }
            } else if (typeof request.customisationLevel === 'string') {
              customizationLevel = request.customisationLevel.toLowerCase();
            }

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
            const point = {
              x: timestamp,
              y: 1, // Toujours 1 pour un point
              r: 10, // Rayon du cercle
              date: formattedDate,
              requestId: request.id,
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
              } else if (requestIndex % 3 === 1) {
                intermediatePoints.push(point);
                totalIntermediate++;
              } else {
                advancedPoints.push(point);
                totalAdvanced++;
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

    const generateColors = (count) => {
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

      const result = [];
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

    const loadModuleDeploymentsEvolutionData = async (clientId) => {
      try {
        // Get all product deployments for this client
        const productDeploymentsRes = await productDeployementService.retrieve();
        const clientDeployments = productDeploymentsRes.data.filter((pd) => pd.client?.id === clientId);

        if (clientDeployments.length === 0) {
          moduleDeploymentsEvolutionData.value = { labels: [], datasets: [] };
          return;
        }

        // Get all deployment details for client's deployments
        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve();
        const clientDeploymentDetails = productDeploymentDetailsRes.data.filter((detail) =>
          clientDeployments.some((deployment) => deployment.id === detail.productDeployement?.id),
        );

        // Get all module deployments for client's deployment details
        const moduleDeploymentsRes = await moduleDeployementService.retrieve();
        const clientModuleDeployments = moduleDeploymentsRes.data.filter((moduleDeployment) =>
          clientDeploymentDetails.some((detail) => detail.id === moduleDeployment.productDeployementDetail?.id),
        );

        // Group module deployments by month
        const monthlyModuleDeployments = Array(12).fill(0);
        const modulesByMonth = Array(12).fill(null).map(() => new Map()); // Map to store unique modules per month
        const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

        // Process each module deployment
        for (const moduleDeployment of clientModuleDeployments) {
          // Find the related deployment detail to get the date
          const relatedDetail = clientDeploymentDetails.find(
            (detail) => detail.id === moduleDeployment.productDeployementDetail?.id,
          );

          if (relatedDetail?.startDeployementDate && moduleDeployment.moduleVersion?.id) {
            const deploymentDate = new Date(relatedDetail.startDeployementDate);
            const month = deploymentDate.getMonth();
            const year = deploymentDate.getFullYear();

            // Only count deployments from current year
            if (year === currentYear.value) {
              try {
                const moduleVersionRes = await moduleVersionService.find(moduleDeployment.moduleVersion.id);
                const moduleVersion = moduleVersionRes.data || moduleVersionRes;

                if (moduleVersion.module?.id) {
                  const moduleRes = await moduleService.find(moduleVersion.module.id);
                  const module = moduleRes.data || moduleRes;
                  const moduleName = module.name || 'Unknown Module';

                  // Add to monthly count if not already counted this month
                  if (!modulesByMonth[month].has(moduleName)) {
                    modulesByMonth[month].set(moduleName, {
                      name: moduleName,
                      version: moduleVersion.version || 'Unknown',
                      date: deploymentDate.toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric',
                      }),
                      description: module.description || 'No description available',
                    });
                    monthlyModuleDeployments[month]++;
                  }
                }
              } catch (error) {
                console.error('Error fetching module details:', error);
              }
            }
          }
        }

        // Prepare chart data
        moduleDeploymentsEvolutionData.value = {
          labels: monthNames,
          datasets: [
            {
              label: 'Modules déployés par mois',
              data: monthlyModuleDeployments,
              backgroundColor: 'rgba(128, 128, 128, 0.6)',
              borderColor: 'rgba(64, 64, 64, 1)',
              borderWidth: 2,
              fill: true,
              tension: 0.4,
              pointBackgroundColor: 'rgba(64, 64, 64, 1)',
              pointBorderColor: '#ffffff',
              pointBorderWidth: 2,
              pointRadius: 6,
              pointHoverRadius: 10,
              modulesByMonth, // Store modules for click handling
            },
          ],
        };
      } catch (error) {
        console.error('Error loading module deployments evolution data:', error);
        moduleDeploymentsEvolutionData.value = { labels: [], datasets: [] };
      }
    };

    const createCharts = () => {
      destroyCharts();
      createProductDeploymentsChart();
      createRequestChangesScatterChart();
      createClientsEvolutionChart();
      createModuleDeploymentsEvolutionChart();
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
                    const total = context.dataset.data.reduce((a, b) => a + b, 0);
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
                    const point = context.raw;
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
                    const date = new Date(value);
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

    const createClientsEvolutionChart = () => {
      // Clients Evolution Chart - Combinaison de barres et ligne cumulative
      if (clientsEvolutionChart.value && clientsEvolutionData.value.labels.length > 0) {
        clientsEvolutionChartInstance.value = new Chart(clientsEvolutionChart.value, {
          type: 'bar',
          data: clientsEvolutionData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: true,
                position: 'top',
                labels: {
                  usePointStyle: true,
                  padding: 20
                }
              },
              tooltip: {
                callbacks: {
                  label: function(context) {
                    const datasetLabel = context.dataset.label || '';
                    const value = context.parsed.y;

                    if (datasetLabel.includes('Cumulative')) {
                      return `${datasetLabel}: ${value} client${value > 1 ? 's' : ''}`;
                    } else {
                      const monthIndex = context.dataIndex;
                      const clientNames = context.dataset.clientNames?.[monthIndex] || [];

                      let tooltip = `${datasetLabel}: ${value} client${value > 1 ? 's' : ''}`;

                      if (clientNames.length > 0) {
                        tooltip += '\nAdded clients:';
                        clientNames.forEach(name => {
                          tooltip += `\n• ${name}`;
                        });
                      }

                      return tooltip.split('\n');
                    }
                  },
                  title: function(context) {
                    return `${context[0].label} ${currentYear.value}`;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  callback: function(value) {
                    return Number.isInteger(value) ? value : '';
                  }
                },
                title: {
                  display: true,
                  text: 'Number of clients',
                  font: {
                    size: 14,
                    weight: 'bold'
                  }
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)'
                }
              },
              x: {
                title: {
                  display: true,
                  text: `month - ${currentYear.value}`,
                  font: {
                    size: 14,
                    weight: 'bold'
                  }
                },
                grid: {
                  display: false
                }
              }
            },
            animation: {
              duration: 1000,
              easing: 'easeInOutQuart'
            }
          }
        });
      }
    };

    const createModuleDeploymentsEvolutionChart = () => {
      if (moduleDeploymentsEvolutionChart.value && moduleDeploymentsEvolutionData.value.labels.length > 0) {
        moduleDeploymentsEvolutionChartInstance.value = new Chart(moduleDeploymentsEvolutionChart.value, {
          type: 'line',
          data: moduleDeploymentsEvolutionData.value,
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
                  color: '#666',
                },
              },
              tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#333',
                bodyColor: '#666',
                borderColor: '#ddd',
                borderWidth: 1,
                callbacks: {
                  label: function (context) {
                    const value = context.parsed.y;
                    const monthIndex = context.dataIndex;
                    const modules = context.dataset.modulesByMonth?.[monthIndex] || new Map();
                    
                    const tooltipLines = [`${value} module${value > 1 ? 's' : ''} déployé${value > 1 ? 's' : ''}`];
                    
                    if (modules.size > 0) {
                      tooltipLines.push('Modules:');
                      Array.from(modules.values()).forEach(module => {
                        tooltipLines.push(`• ${module.name} v${module.version}`);
                      });
                    }
                    
                    return tooltipLines;
                  },
                  title: function (context) {
                    return `${context[0].label} ${currentYear.value}`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                  callback: function (value) {
                    return Number.isInteger(value) ? value : '';
                  },
                  color: '#666',
                },
                title: {
                  display: true,
                  text: 'Nombre de modules',
                  font: {
                    size: 12,
                    weight: 'bold',
                  },
                  color: '#666',
                },
                grid: {
                  color: 'rgba(0, 0, 0, 0.1)',
                },
              },
              x: {
                title: {
                  display: true,
                  text: `Mois - ${currentYear.value}`,
                  font: {
                    size: 12,
                    weight: 'bold',
                  },
                  color: '#666',
                },
                grid: {
                  display: false,
                },
                ticks: {
                  color: '#666',
                },
              },
            },
            onClick: (event, elements) => {
              if (elements.length > 0) {
                const element = elements[0];
                const monthIndex = element.index;
                const modules = moduleDeploymentsEvolutionData.value.datasets[0].modulesByMonth?.[monthIndex] || new Map();
                
                if (modules.size > 0) {
                  const monthName = moduleDeploymentsEvolutionData.value.labels[monthIndex];
                  showModuleMonthDetails(monthName, Array.from(modules.values()));
                }
              }
            },
            animation: {
              duration: 1000,
              easing: 'easeInOutQuart',
            },
          },
        });
      }
    };

    const showModuleMonthDetails = (monthName, modules) => {
      selectedModuleData.value = {
        monthName,
        modules,
        totalModules: modules.length,
      };
      showModulePopup.value = true;
    };

    const closeModulePopup = () => {
      showModulePopup.value = false;
      selectedModuleData.value = null;
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
      await fetchClients();
      await loadClientsEvolutionData();
      createCharts();
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
      clientsEvolutionChart,
      productDeploymentsChartData,
      requestChangesChartData,
      clientsEvolutionData,
      totalRequests,
      currentYear,
      t$: t,
      moduleDeploymentsEvolutionChart,
      moduleDeploymentsEvolutionData,
      showModulePopup,
      selectedModuleData,
      closeModulePopup,
    };
  },
});
