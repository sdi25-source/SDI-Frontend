import type { ComputedRef } from 'vue';
import { defineComponent, inject, onMounted, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import type LoginService from '@/account/login.service';
import { type ProductOverview } from '@/shared/model/product-overview.model';
import { type IProductVersion } from '@/shared/model/product-version.model';
import ProductService from '@/entities/product/product.service';
import { useAlertService } from '@/shared/alert/alert.service';
import ProductVersionService from '@/entities/product-version/product-version.service';
import ModuleVersionService from '@/entities/module-version/module-version.service.ts';
import ProductDeployementDetailService from '@/entities/product-deployement-detail/product-deployement-detail.service.ts';
import type { IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model.ts';
import Chart from 'chart.js/auto';
import type { IProductDeployement } from '@/shared/model/product-deployement.model.ts';
import ProductDeployementService from '@/entities/product-deployement/product-deployement.service.ts';
import ModuleService from '@/entities/module/module.service.ts';

export default defineComponent({
  name: 'DashProductsComponent',
  setup() {
    const loginService = inject<LoginService>('loginService');
    const authenticated = inject<ComputedRef<boolean>>('authenticated');
    const username = inject<ComputedRef<string>>('currentUsername');
    const alertService = inject('alertService', () => useAlertService(), true);
    const { t } = useI18n();

    const scrollContainer = ref<HTMLElement | null>(null);
    const isAtStart = ref(true);
    const isAtEnd = ref(false);
    const products = ref<ProductOverview[]>([]);
    const productVersions = ref<IProductVersion[]>([]);
    const latestVersions = ref<Map<string, IProductVersion | null>>(new Map());
    const moduleVersionCounts = ref<Map<string, number>>(new Map());
    const totalFeaturesPerProduct = ref<Map<string, number>>(new Map());
    const totalDeployementsPerProduct = ref<Map<string, number>>(new Map());

    // Charts related refs
    const selectedProduct = ref<ProductOverview | null>(null);
    const clientsChart = ref<HTMLCanvasElement | null>(null);
    const versionsChart = ref<HTMLCanvasElement | null>(null);
    const productsEvolutionChart = ref<HTMLCanvasElement | null>(null);
    const clientsChartInstance = ref<Chart | null>(null);
    const versionsChartInstance = ref<Chart | null>(null);
    const productsEvolutionChartInstance = ref<Chart | null>(null);
    const clientsChartData = ref({ labels: [], datasets: [] });
    const versionsChartData = ref({ labels: [], datasets: [] });
    const productsEvolutionData = ref({ labels: [], datasets: [] });
    const currentYear = ref(new Date().getFullYear());
    const loading = ref(true);

    // Clients deployments refs
    const clientsDeployments = ref<any[]>([]);
    const expandedClients = ref(new Set());

    const productService = new ProductService();
    const productVersionService = new ProductVersionService();
    const productDeployementDetailService = new ProductDeployementDetailService();
    const moduleVersionService = new ModuleVersionService();
    const moduleService = new ModuleService();
    const productDeployementService = new ProductDeployementService();

    const fetchProducts = async () => {
      try {
        loading.value = true;
        products.value = await productService.retrieveProductOverviews();
        for (const product of products.value) {
          const latest = await fetchLatestNonClientVersion(product.name);
          latestVersions.value.set(product.name, latest);
          const moduleCount = await countModulesVersions(product.name);
          moduleVersionCounts.value.set(product.name, moduleCount);
          const totalFeatures = await countTotalFeatures(product.name);
          totalFeaturesPerProduct.value.set(product.name, totalFeatures);
          const totalDeployements = await countDeployements(product.name);
          totalDeployementsPerProduct.value.set(product.name, totalDeployements);
        }
      } catch (error) {
        console.error('Error fetching product overviews:', error);
        alertService.showHttpError(error.response || error);
      } finally {
        loading.value = false;
      }
    };

    const loadProductsEvolutionData = async () => {
      try {
        loading.value = true;
        const allProducts = await productService.retrieve();
        const productsData = allProducts.data || allProducts;
        const currentYearProducts = productsData.filter(product => {
          if (!product.createDate) return false;
          const productYear = new Date(product.createDate).getFullYear();
          return productYear === currentYear.value;
        });
        currentYearProducts.sort((a, b) => {
          return new Date(a.createDate).getTime() - new Date(b.createDate).getTime();
        });
        const monthlyCount = Array(12).fill(0);
        const cumulativeCount = Array(12).fill(0);
        const productsByMonth = Array(12).fill(null).map(() => []);
        const monthNames = ['Jan', 'Fev', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        currentYearProducts.forEach(product => {
          const month = new Date(product.createDate).getMonth();
          monthlyCount[month]++;
          productsByMonth[month].push(product.name);
        });
        let cumul = 0;
        for (let i = 0; i < 12; i++) {
          cumul += monthlyCount[i];
          cumulativeCount[i] = cumul;
        }
        productsEvolutionData.value = {
          labels: monthNames,
          datasets: [
            {
              label: 'Products created per month',
              data: monthlyCount,
              backgroundColor: 'rgba(245, 159, 0, 0.8)',
              borderColor: 'rgba(245, 159, 0, 1)',
              borderWidth: 2,
              type: 'bar',
              order: 2,
              productNames: productsByMonth
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
        console.error('Error loading products evolution data:', error);
        productsEvolutionData.value = { labels: [], datasets: [] };
      } finally {
        loading.value = false;
      }
    };

    const selectProduct = async (product: ProductOverview) => {
      selectedProduct.value = product;
      await nextTick();
      await loadChartsData(product);
      await loadClientsDeployments(product.name);
      createCharts();
    };

    const closeCharts = async () => {
      selectedProduct.value = null;
      clientsDeployments.value = [];
      expandedClients.value.clear();
      destroyCharts();
      await fetchProducts();
      await loadProductsEvolutionData();
      createCharts();
    };

    const destroyCharts = () => {
      if (clientsChartInstance.value) {
        clientsChartInstance.value.destroy();
        clientsChartInstance.value = null;
      }
      if (versionsChartInstance.value) {
        versionsChartInstance.value.destroy();
        versionsChartInstance.value = null;
      }
      if (productsEvolutionChartInstance.value) {
        productsEvolutionChartInstance.value.destroy();
        productsEvolutionChartInstance.value = null;
      }
    };

    const loadClientsDeployments = async (productName: string) => {
      try {
        const lastVersion = await fetchLatestNonClientVersion(productName);
        if (!lastVersion) {
          clientsDeployments.value = [];
          return;
        }
        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve();
        const productDeploymentDetails: IProductDeployementDetail[] = productDeploymentDetailsRes.data;
        const productDeployments = productDeploymentDetails.filter(detail => detail.productVersion?.id === lastVersion.id);
        const productDeployementRes = await productDeployementService.retrieve();
        const allProductDeployements: IProductDeployement[] = productDeployementRes.data;
        const clientModules = new Map<string, any[]>();
        for (const detail of productDeployments) {
          let clientName = 'Unknown Client';
          if (detail.productDeployement?.id) {
            const productDeployement = allProductDeployements.find(pd => pd.id === detail.productDeployement?.id);
            if (productDeployement?.client?.name) {
              clientName = productDeployement.client.name;
            }
          }
          const modules = detail.allowedModuleVersions?.map(mv => {
            const moduleVersion = getModuleVersionWithModuleCached(mv.id);
            return {
              id: mv.id,
              name: moduleVersion?.module?.name,
              version: moduleVersion?.version
            };
          }).filter(mod => mod.name && mod.version) || [];
          if (clientModules.has(clientName)) {
            clientModules.set(clientName, [...clientModules.get(clientName)!, ...modules]);
          } else {
            clientModules.set(clientName, modules);
          }
        }
        clientsDeployments.value = Array.from(clientModules.entries())
          .map(([clientName, modules]) => ({
            clientName,
            modules: modules.filter((mod, index, self) =>
              index === self.findIndex(m => m.id === mod.id)
            )
          }))
          .filter(client => client.modules.length > 0)
          .sort((a, b) => a.clientName.localeCompare(b.clientName));
      } catch (error) {
        console.error('Error loading clients deployments:', error);
        clientsDeployments.value = [];
      }
    };

    const loadChartsData = async (product: ProductOverview) => {
      try {
        await loadClientsChartData(product.name);
        await loadVersionsChartData(product.name);
      } catch (error) {
        console.error('Error loading charts data:', error);
        alertService.showHttpError(error.response || error);
      }
    };

    const loadClientsChartData = async (productName: string) => {
      try {
        const lastVersion = await fetchLatestNonClientVersion(productName);
        if (!lastVersion) {
          clientsChartData.value = { labels: [], datasets: [] };
          return;
        }
        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve();
        const productDeploymentDetails: IProductDeployementDetail[] = productDeploymentDetailsRes.data;
        const productDeployments = productDeploymentDetails.filter(detail => detail.productVersion?.id === lastVersion.id);
        const productDeployementRes = await productDeployementService.retrieve();
        const allProductDeployements: IProductDeployement[] = productDeployementRes.data;
        const clientModuleCount = new Map<string, number>();
        const clientModuleNames = new Map<string, Set<string>>();
        for (const detail of productDeployments) {
          let clientName = 'Unknown Client';
          if (detail.productDeployement?.id) {
            const productDeployement = allProductDeployements.find(pd => pd.id === detail.productDeployement?.id);
            if (productDeployement?.client?.name) {
              clientName = productDeployement.client.name;
            }
          }
          const moduleCount = detail.allowedModuleVersions?.length || 0;
          const moduleNames = detail.allowedModuleVersions?.map(mv => getModuleVersionWithModuleCached(mv.id).module?.name + ' v' + getModuleVersionWithModuleCached(mv.id).version || 'Unknown Module') || [];
          const uniqueModuleNames = clientModuleNames.get(clientName) || new Set<string>();
          moduleNames.forEach(name => uniqueModuleNames.add(name));
          clientModuleNames.set(clientName, uniqueModuleNames);
          if (clientModuleCount.has(clientName)) {
            clientModuleCount.set(clientName, clientModuleCount.get(clientName)! + moduleCount);
          } else {
            clientModuleCount.set(clientName, moduleCount);
          }
        }
        const filteredEntries = Array.from(clientModuleCount.entries()).filter(([_, count]) => count > 0);
        if (filteredEntries.length === 0) {
          clientsChartData.value = { labels: [], datasets: [] };
          return;
        }
        const sortedEntries = filteredEntries.sort((a, b) => b[1] - a[1]);
        const labels = sortedEntries.map(entry => entry[0]);
        const data = sortedEntries.map(entry => entry[1]);
        const backgroundColors = generateColors(labels.length);
        clientsChartData.value = {
          labels,
          datasets: [
            {
              data,
              backgroundColor: backgroundColors,
              borderColor: backgroundColors.map(color => color.replace('0.8', '1')),
              borderWidth: 2,
              moduleNames: Array.from(clientModuleNames.entries()).reduce((acc, [client, names]) => {
                acc[client] = Array.from(names);
                return acc;
              }, {} as Record<string, string[]>)
            }
          ]
        };
      } catch (error) {
        console.error('Error loading clients chart data:', error);
        clientsChartData.value = { labels: [], datasets: [] };
      }
    };

    const loadVersionsChartData = async (productName: string) => {
      try {
        await fetchProductVersions(productName);
        const versionRegex = /^\d+\.\d+\.\d+$/;
        const clientVersionRegex = /^[a-zA-Z]+_\d+\.\d+\.\d+$/;
        const nonClientVersions = productVersions.value.filter(
          (pv: IProductVersion) => pv.version && versionRegex.test(pv.version) && !clientVersionRegex.test(pv.version)
        );
        if (nonClientVersions.length === 0) {
          versionsChartData.value = { labels: [], datasets: [] };
          return;
        }
        const sortedVersions = nonClientVersions.sort((a: IProductVersion, b: IProductVersion) => {
          const versionA = a.version!.split('.').map(Number);
          const versionB = b.version!.split('.').map(Number);
          for (let i = 0; i < 3; i++) {
            if (versionA[i] !== versionB[i]) {
              return versionA[i] - versionB[i];
            }
          }
          return new Date(a.createDate || 0).getTime() - new Date(b.createDate || 0).getTime();
        });
        const labels = sortedVersions.map(version => 'v ' + version.version || 'Unknown');

        const moduleSets = sortedVersions.map(version => {
          const names = version.moduleVersions?.map(mv => getModuleVersionWithModuleCached(mv.id)?.module?.name || 'Unknown') || [];
          return new Set(names);
        });

        const totalData = moduleSets.map(set => set.size);

        const addedData = [];
        const addedNames = [];
        for (let i = 0; i < moduleSets.length; i++) {
          if (i === 0) {
            addedData.push(totalData[0]);
            addedNames.push(Array.from(moduleSets[0]));
          } else {
            const previous = moduleSets[i - 1];
            const current = moduleSets[i];
            const added = new Set([...current].filter(x => !previous.has(x)));
            addedData.push(added.size);
            addedNames.push(Array.from(added));
          }
        }

        const allNames = moduleSets.map(set => Array.from(set));

        versionsChartData.value = {
          labels,
          datasets: [
            {
              label: 'Total Modules',
              data: totalData,
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
              order: 1,
              allNames: allNames
            }
          ]
        };
      } catch (error) {
        console.error('Error loading versions chart data:', error);
        versionsChartData.value = { labels: [], datasets: [] };
      }
    };

    const generateColors = (count: number) => {
      const baseColors = [
        'rgba(12, 166, 120, 0.8)',
        'rgba(245, 159, 0, 0.8)',
        'rgba(29, 126, 214, 0.8)',
        'rgba(156, 39, 176, 0.8)',
        'rgba(255, 87, 34, 0.8)'
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

    const generateGradientColors = (count: number) => {
      const result = [];
      for (let i = 0; i < count; i++) {
        const hue = (i * 360) / count;
        result.push(`hsla(${hue}, 70%, 60%, 0.8)`);
      }
      return result;
    };

    const createCharts = () => {
      destroyCharts();
      if (clientsChart.value && clientsChartData.value.labels.length > 0) {
        clientsChartInstance.value = new Chart(clientsChart.value, {
          type: 'doughnut',
          data: clientsChartData.value,
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                position: 'bottom',
                labels: {
                  padding: 20,
                  usePointStyle: true,
                  generateLabels: function (chart) {
                    const data = chart.data;
                    if (data.labels && data.datasets.length) {
                      return data.labels.map((label, i) => {
                        const meta = chart.getDatasetMeta(0);
                        const style = meta.controller.getStyle(i);
                        return {
                          text: `${label}`,
                          fillStyle: style.backgroundColor,
                          strokeStyle: style.borderColor,
                          lineWidth: style.borderWidth,
                          pointStyle: 'circle',
                          hidden: !chart.getDataVisibility(i),
                          index: i
                        };
                      });
                    }
                    return [];
                  }
                }
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    const latestVersion = latestVersions.value.get(selectedProduct.value?.name || '')?.version || 'N/A';
                    const moduleNames = context.dataset.moduleNames?.[label] || [];
                    const tooltipLines = [
                      `${label}: ${value} module(s) (${percentage}%)`,
                      `Product: ${selectedProduct.value?.name} v${latestVersion}`
                    ];
                    if (moduleNames.length > 0) {
                      tooltipLines.push('Modules:');
                      moduleNames.forEach(module => {
                        tooltipLines.push(`- ${module}`);
                      });
                    } else {
                      tooltipLines.push('No Modules');
                    }
                    return tooltipLines;
                  }
                }
              }
            }
          }
        });
      }
      if (versionsChart.value && versionsChartData.value.labels.length > 0) {
        versionsChartInstance.value = new Chart(versionsChart.value, {
          type: 'line',
          data: versionsChartData.value,
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
                  label: function (context) {
                    const datasetLabel = context.dataset.label || '';
                    const value = context.parsed.y;
                    let lines = [`${datasetLabel}: ${value}`];
                    if (datasetLabel === 'Added Modules') {
                      const added = context.dataset.addedNames?.[context.dataIndex] || [];
                      if (added.length > 0) {
                        lines.push('Added Modules:');
                        added.forEach(name => lines.push(`- ${name}`));
                      } else {
                        lines.push('No new modules added');
                      }
                    } else if (datasetLabel === 'Total Modules') {
                      const all = context.dataset.allNames?.[context.dataIndex] || [];
                      if (all.length > 0) {
                        lines.push('All Modules:');
                        all.forEach(name => lines.push(`- ${name}`));
                      } else {
                        lines.push('No modules');
                      }
                    }
                    return lines;
                  }
                }
              }
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1
                },
                title: {
                  display: true,
                  text: 'Number of Modules'
                }
              },
              x: {
                title: {
                  display: true,
                  text: 'Product Versions (Chronological Order)'
                }
              }
            },
            elements: {
              line: {
                tension: 0.4
              },
              point: {
                radius: 6,
                hoverRadius: 8
              }
            }
          }
        });
      }
      if (productsEvolutionChart.value && productsEvolutionData.value.labels.length > 0) {
        productsEvolutionChartInstance.value = new Chart(productsEvolutionChart.value, {
          type: 'bar',
          data: productsEvolutionData.value,
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
                      return `${datasetLabel}: ${value} product${value > 1 ? 's' : ''}`;
                    } else {
                      const monthIndex = context.dataIndex;
                      const productNames = context.dataset.productNames?.[monthIndex] || [];
                      let tooltip = `${datasetLabel}: ${value} product${value > 1 ? 's' : ''}`;
                      if (productNames.length > 0) {
                        tooltip += '\nAdded products:';
                        productNames.forEach(name => {
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
                  text: 'Number of products',
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

    const toggleClientExpansion = (clientName: string) => {
      const expanded = new Set(expandedClients.value);
      if (expanded.has(clientName)) {
        expanded.delete(clientName);
      } else {
        expanded.add(clientName);
      }
      expandedClients.value = expanded;
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

    const fetchProductVersions = async (productName: string) => {
      try {
        const res = await productVersionService.retrieve();
        productVersions.value = res.data.filter((pv: IProductVersion) => pv.product?.name === productName);
      } catch (err) {
        alertService.showHttpError(err.response || err);
      }
    };

    const fetchLatestNonClientVersion = async (productName: string) => {
      try {
        const versionRegex = /^\d+\.\d+\.\d+$/;
        const clientVersionRegex = /^[a-zA-Z]+_\d+\.\d+\.\d+$/;
        await fetchProductVersions(productName);
        const nonClientVersions = productVersions.value.filter(
          (pv: IProductVersion) => pv.version && versionRegex.test(pv.version) && !clientVersionRegex.test(pv.version)
        );
        if (nonClientVersions.length === 0) {
          return null;
        }
        nonClientVersions.sort((a: IProductVersion, b: IProductVersion) => {
          const versionA = a.version!.split('.').map(Number);
          const versionB = b.version!.split('.').map(Number);
          for (let i = 0; i < 3; i++) {
            if (versionA[i] !== versionB[i]) {
              return versionB[i] - versionA[i];
            }
          }
          return new Date(b.createDate || 0).getTime() - new Date(a.createDate || 0).getTime();
        });
        return nonClientVersions[0];
      } catch (error) {
        alertService.showHttpError(error.response || error);
        return null;
      }
    };

    const countModulesVersions = async (productName: string): Promise<number> => {
      try {
        const lastVersion = await fetchLatestNonClientVersion(productName);
        const nbrModulesVersion = lastVersion?.moduleVersions?.length || 0;
        return nbrModulesVersion;
      } catch (error) {
        console.error(`Error counting module versions for ${productName}:`, error);
        return 0;
      }
    };

    const countTotalFeatures = async (productName: string): Promise<number> => {
      try {
        const lastVersion = await fetchLatestNonClientVersion(productName);
        if (!lastVersion?.moduleVersions) {
          return 0;
        }
        let totalFeatures = 0;
        for (const moduleVersion of lastVersion.moduleVersions) {
          if (moduleVersion.id) {
            try {
              const response = await moduleVersionService.find(moduleVersion.id);
              const featureCount = response.features?.length || 0;
              totalFeatures += featureCount;
            } catch (err) {
              console.error(`Error fetching module version ${moduleVersion.id} for product ${productName}:`, err);
            }
          }
        }
        return totalFeatures;
      } catch (error) {
        console.error(`Error counting total features for ${productName}:`, error);
        return 0;
      }
    };

    const countDeployements = async (productName: string): Promise<number> => {
      try {
        const lastVersion = await fetchLatestNonClientVersion(productName);
        if (!lastVersion || !lastVersion.id) {
          return 0;
        }
        const res = await productDeployementDetailService.retrieve();
        const filteredDeployements = res.data.filter(detail => detail.productVersion?.id === lastVersion.id);
        return filteredDeployements.length;
      } catch (error) {
        console.error(`Error counting deployements for ${productName}:`, error);
        return 0;
      }
    };

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
      const moduleVersion = moduleVersionOptions.value.find(mv => mv.id === moduleVersionId);
      if (!moduleVersion) return null;
      const module = moduleOptions.value.find(m => m.id === moduleVersion.module?.id);
      return {
        ...moduleVersion,
        module: module ? { ...module } : null
      };
    };

    onMounted(async () => {
      await fetchProducts();
      await loadProductsEvolutionData();
      createCharts();
      checkScrollPosition();
      await fetchModuleOptions();
      await fetchModuleVersionOptions();
    });

    const openLogin = () => {
      loginService?.openLogin();
    };

    return {
      scrollContainer,
      products,
      fetchLatestNonClientVersion,
      fetchProductVersions,
      countModulesVersions,
      countTotalFeatures,
      countDeployements,
      isAtStart,
      isAtEnd,
      scrollLeft,
      scrollRight,
      checkScrollPosition,
      authenticated,
      username,
      openLogin,
      t$: t,
      latestVersions,
      moduleVersionCounts,
      totalFeaturesPerProduct,
      totalDeployementsPerProduct,
      loading,
      fetchModuleOptions,
      fetchModuleVersionOptions,
      getModuleVersionWithModuleCached,
      selectedProduct,
      selectProduct,
      closeCharts,
      clientsChart,
      versionsChart,
      productsEvolutionChart,
      clientsChartData,
      versionsChartData,
      productsEvolutionData,
      currentYear,
      clientsDeployments,
      expandedClients,
      toggleClientExpansion
    };
  }
});
