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
      // Close any open popup
      showMonthPopup.value = false;
      selectedMonth.value = '';
      selectedMonthDetails.value = [];
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
    };

    const loadClientChartsData = async (client) => {
      try {
        await loadMonthlyDeploymentsChartData(client.id);
        await loadRequestChangesScatterData(client.id);
      } catch (error) {
        console.error('Error loading client charts data:', error);
        alertService.showHttpError(error.response || error);
      }
    };

    // Monthly deployments (based on ProductDeployementDetail startDeployementDate) for the last 12 months
    const last12MonthsLabels = () => {
      const labels: string[] = [];
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' }));
      }
      return labels;
    };

    const monthKeyFromDate = (dateStr: string) => {
      const d = new Date(dateStr);
      return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
    };

    const monthKeyLabelsMap = () => {
      const map: Record<string, string> = {};
      const now = new Date();
      for (let i = 11; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth()).padStart(2, '0')}`;
        map[key] = d.toLocaleDateString('en-US', { month: 'short', year: '2-digit' });
      }
      return map;
    };

    const monthlyDeploymentsData = ref<{ labels: string[]; datasets: any[] }>({ labels: [], datasets: [] });
    const monthToDetails = ref<Record<string, any[]>>({});
    const selectedMonth = ref('');
    const selectedMonthDetails = ref<any[]>([]);
    const showMonthPopup = ref(false);

    const loadMonthlyDeploymentsChartData = async (clientId) => {
      try {
        const pdRes = await productDeployementService.retrieve();
        const deployments = pdRes.data.filter((pd) => pd.client?.id === clientId);
        if (!deployments.length) {
          monthlyDeploymentsData.value = { labels: [], datasets: [] };
          return;
        }

        const pddRes = await productDeployementDetailService.retrieve();
        const allDetails = pddRes.data.filter((detail) =>
          deployments.some((d) => d.id === detail.productDeployement?.id)
        );

        const keyToCount: Record<string, number> = {};
        const keyToDetails: Record<string, any[]> = {};
        const keyToLabel = monthKeyLabelsMap();

        // initialize last 12 months to zero
        Object.keys(keyToLabel).forEach((k) => {
          keyToCount[k] = 0;
          keyToDetails[k] = [];
        });

        allDetails.forEach((detail) => {
          const dateStr = detail.startDeployementDate || detail.createDate;
          if (!dateStr) return;
          const d = new Date(dateStr);
          const now = new Date();
          const startWindow = new Date(now.getFullYear(), now.getMonth() - 11, 1);
          const endWindow = new Date(now.getFullYear(), now.getMonth() + 1, 0);
          if (d < startWindow || d > endWindow) return;
          const key = monthKeyFromDate(dateStr);
          if (keyToCount[key] !== undefined) {
            keyToCount[key] += 1;
            keyToDetails[key].push({
              product: detail.productDeployement?.product?.name || 'Unknown Product',
              version: detail.productVersion?.version || 'Unknown Version',
              type: detail.deployementType?.type || 'Standard',
              date: detail.startDeployementDate || null,
            });
          }
        });

        const labels = last12MonthsLabels();
        const data = Object.keys(keyToLabel).map((k) => keyToCount[k]);

        monthToDetails.value = keyToDetails;

        monthlyDeploymentsData.value = {
          labels,
          datasets: [
            {
              label: 'Deployments per month',
              data,
              backgroundColor: Array(12).fill('rgba(108, 117, 125, 0.7)'), // grey
              borderColor: Array(12).fill('rgba(108, 117, 125, 1)'),
              borderWidth: 1,
            },
          ],
        };
      } catch (e) {
        console.error('Error loading monthly deployments data:', e);
        monthlyDeploymentsData.value = { labels: [], datasets: [] };
      }
    };

    const createCharts = () => {
      destroyCharts();
      createProductDeploymentsChart();
      createRequestChangesScatterChart();
      createClientsEvolutionChart();
    };

    const createProductDeploymentsChart = () => {
      if (
        productDeploymentsChart.value &&
        monthlyDeploymentsData.value.labels &&
        monthlyDeploymentsData.value.labels.length > 0
      ) {
        productDeploymentsChartInstance.value = new Chart(productDeploymentsChart.value, {
          type: 'bar',
          data: monthlyDeploymentsData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: { display: false },
              tooltip: {
                callbacks: {
                  title: function (context) {
                    return context[0].label;
                  },
                  label: function (context) {
                    const value = context.parsed.y;
                    return `Deployments: ${value}`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  precision: 0,
                },
              },
            },
            onClick: (_, elements) => {
              if (!elements || elements.length === 0) return;
              const index = elements[0].index;
              const label = monthlyDeploymentsData.value.labels[index];
              // derive key from label by reverse lookup
              const keyLabelMap = monthKeyLabelsMap();
              const key = Object.keys(keyLabelMap).find(k => keyLabelMap[k] === label) || '';
              selectedMonth.value = label;
              selectedMonthDetails.value = key ? (monthToDetails.value[key] || []) : [];
              showMonthPopup.value = true;
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
      // monthly deployments popup bindings
      showMonthPopup,
      selectedMonth,
      selectedMonthDetails,
    };
  },
});
