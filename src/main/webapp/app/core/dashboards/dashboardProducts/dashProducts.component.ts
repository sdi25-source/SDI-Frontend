import type { ComputedRef } from 'vue';
import { defineComponent, inject, onMounted, ref, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import type LoginService from '@/account/login.service';
import { type ProductOverview } from '@/shared/model/product-overview.model';
import { type IProductVersion } from '@/shared/model/product-version.model';
import ProductService from '@/entities/product/product.service';
import { useAlertService } from '@/shared/alert/alert.service';
import ProductVersionService from '@/entities/product-version/product-version.service';
import type { IModuleVersion } from '@/shared/model/module-version.model.ts';
import ModuleVersionService from '@/entities/module-version/module-version.service.ts';
import ProductDeployementDetailService from '@/entities/product-deployement-detail/product-deployement-detail.service.ts';
import type { IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model.ts';
import ModuleDeployementService from '@/entities/module-deployement/module-deployement.service.ts';
import type { IModuleDeployement } from '@/shared/model/module-deployement.model.ts';
import Chart from 'chart.js/auto';
import type { IProductDeployement } from '@/shared/model/product-deployement.model.ts';
import ProductDeployementService from '@/entities/product-deployement/product-deployement.service.ts';

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
    const clientsChartInstance = ref<Chart | null>(null);
    const versionsChartInstance = ref<Chart | null>(null);
    const clientsChartData = ref({ labels: [], datasets: [] });
    const versionsChartData = ref({ labels: [], datasets: [] });

    const loading = ref(true);

    const productService = new ProductService();
    const productVersionService = new ProductVersionService();
    const moduleVersionService = new ModuleVersionService();
    const productDeployementDetailService = new ProductDeployementDetailService();
    const moduleDeployementService = new ModuleDeployementService();
    const productDeployementService = new ProductDeployementService();

    const fetchProducts = async () => {
      try {
        loading.value = true;
        products.value = await productService.retrieveProductOverviews();
        // Fetch latest non-client version for each product
        for (const product of products.value) {
          const latest = await fetchLatestNonClientVersion(product.name);
          latestVersions.value.set(product.name, latest);
          const moduleCount = await countModulesVersions(product.name);
          moduleVersionCounts.value.set(product.name, moduleCount);
          const totalFeatures = await countTotalFeatures(product.name);
          totalFeaturesPerProduct.value.set(product.name, totalFeatures);
          const totalDeployements = await countDeployements(product.name);
          totalDeployementsPerProduct.value.set(product.name, totalDeployements);
          console.log(totalDeployementsPerProduct.value);
        }
      } catch (error) {
        console.error('Error fetching product overviews:', error);
        alertService.showHttpError(error.response || error);
      } finally {
        loading.value = false;
      }
    };

    const selectProduct = async (product: ProductOverview) => {
      selectedProduct.value = product;
      await nextTick();
      await loadChartsData(product);
      createCharts();
    };

    const closeCharts = () => {
      selectedProduct.value = null;
      destroyCharts();
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
    };

    const loadChartsData = async (product: ProductOverview) => {
      try {
        // Load clients data
        await loadClientsChartData(product.name);
        // Load versions data
        await loadVersionsChartData(product.name);
      } catch (error) {
        console.error('Error loading charts data:', error);
        alertService.showHttpError(error.response || error);
      }
    };

    const loadClientsChartData = async (productName: string) => {
      try {
        // Get the latest version for the selected product
        const lastVersion = await fetchLatestNonClientVersion(productName);
        if (!lastVersion) {
          clientsChartData.value = { labels: [], datasets: [] };
          return;
        }

        // Get all product deployment details for the selected product and latest version
        const productDeploymentDetailsRes = await productDeployementDetailService.retrieve();
        const productDeploymentDetails: IProductDeployementDetail[] = productDeploymentDetailsRes.data;

        // Filter deployments for the selected product and latest version only
        const productDeployments = productDeploymentDetails.filter(detail => detail.productVersion?.id === lastVersion.id);

        // Get all module deployments
        const moduleDeploymentsRes = await moduleDeployementService.retrieve();
        const moduleDeployments: IModuleDeployement[] = moduleDeploymentsRes.data;

        // Get all product deployments to have access to client information
        const productDeployementRes = await productDeployementService.retrieve();
        const allProductDeployements: IProductDeployement[] = productDeployementRes.data;

        // Group by client and count module deployments for the latest version
        const clientModuleCount = new Map<string, number>();

        for (const detail of productDeployments) {
          let clientName = 'Unknown Client';

          // Find the corresponding ProductDeployement to get client info
          if (detail.productDeployement?.id) {
            const productDeployement = allProductDeployements.find(pd => pd.id === detail.productDeployement?.id);

            if (productDeployement?.client?.name) {
              clientName = productDeployement.client.name;
            }
          }

          console.log('Client found:', clientName);

          const moduleCount = detail.allowedModuleVersions?.length;
          console.log('moduleCount', moduleCount);

          if (clientModuleCount.has(clientName)) {
            clientModuleCount.set(clientName, clientModuleCount.get(clientName)! + moduleCount);
          } else {
            clientModuleCount.set(clientName, moduleCount);
          }
        }

        // Filter out clients with 0 modules
        const filteredEntries = Array.from(clientModuleCount.entries()).filter(([_, count]) => count > 0);

        if (filteredEntries.length === 0) {
          clientsChartData.value = { labels: [], datasets: [] };
          return;
        }

        // Sort by module count (descending) for better visualization
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
            },
          ],
        };
      } catch (error) {
        console.error('Error loading clients chart data:', error);
        clientsChartData.value = { labels: [], datasets: [] };
      }
    };

    const loadVersionsChartData = async (productName: string) => {
      try {
        // Get all product versions for the selected product
        await fetchProductVersions(productName);

        // Filter to get only non-client versions (standard versions)
        const versionRegex = /^\d+\.\d+\.\d+$/;
        const clientVersionRegex = /^[a-zA-Z]+_\d+\.\d+\.\d+$/;

        const nonClientVersions = productVersions.value.filter(
          (pv: IProductVersion) => pv.version && versionRegex.test(pv.version) && !clientVersionRegex.test(pv.version),
        );

        if (nonClientVersions.length === 0) {
          versionsChartData.value = { labels: [], datasets: [] };
          return;
        }

        // Sort versions chronologically
        const sortedVersions = nonClientVersions.sort((a: IProductVersion, b: IProductVersion) => {
          const versionA = a.version!.split('.').map(Number);
          const versionB = b.version!.split('.').map(Number);
          for (let i = 0; i < 3; i++) {
            if (versionA[i] !== versionB[i]) {
              return versionA[i] - versionB[i]; // Ascending order (oldest to newest)
            }
          }
          return new Date(a.createDate || 0).getTime() - new Date(b.createDate || 0).getTime();
        });

        // Extract version labels and module counts
        const labels = sortedVersions.map(version => version.version || 'Unknown');
        const data = sortedVersions.map(version => version.moduleVersions?.length || 0);

        // Generate colors for better visualization
        const backgroundColors = generateGradientColors(labels.length);

        versionsChartData.value = {
          labels,
          datasets: [
            {
              label: 'Number of Module Versions',
              data,
              backgroundColor: backgroundColors,
              borderColor: '#0c2d57',
              borderWidth: 2,
              borderRadius: 8,
              borderSkipped: false,
            },
          ],
        };

        console.log('Versions chart data:', {
          labels,
          data,
          totalVersions: sortedVersions.length,
        });
      } catch (error) {
        console.error('Error loading versions chart data:', error);
        versionsChartData.value = { labels: [], datasets: [] };
      }
    };

    const generateColors = (count: number) => {
      const colors = [
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
        result.push(colors[i % colors.length]);
      }
      return result;
    };

    const generateGradientColors = (count: number) => {
      const baseColor = 'rgba(12, 45, 87, ';
      const result = [];
      for (let i = 0; i < count; i++) {
        const opacity = 0.3 + (0.7 * i) / Math.max(count - 1, 1);
        result.push(baseColor + opacity + ')');
      }
      return result;
    };

    const createCharts = () => {
      // Destroy existing charts
      destroyCharts();

      // Create clients pie chart
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
                },
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    const label = context.label || '';
                    const value = context.parsed;
                    const total = context.dataset.data.reduce((a: number, b: number) => a + b, 0);
                    const percentage = ((value / total) * 100).toFixed(1);
                    const latestVersion = latestVersions.value.get(selectedProduct.value?.name || '')?.version || 'N/A';
                    return `${label}: ${value} module deployments (${percentage}%) - Version ${latestVersion}`;
                  },
                },
              },
            },
          },
        });
      }

      // Create versions line chart
      if (versionsChart.value && versionsChartData.value.labels.length > 0) {
        versionsChartInstance.value = new Chart(versionsChart.value, {
          type: 'line',
          data: {
            labels: versionsChartData.value.labels,
            datasets: [
              {
                label: 'Number of Module Versions',
                data: versionsChartData.value.datasets[0].data,
                backgroundColor: 'rgba(12, 45, 87, 0.1)',
                borderColor: '#0c2d57',
                borderWidth: 3,
                fill: true,
                tension: 0.4,
                pointBackgroundColor: '#0c2d57',
                pointBorderColor: '#ffffff',
                pointBorderWidth: 2,
                pointRadius: 6,
                pointHoverRadius: 8,
              },
            ],
          },
          options: {
            responsive: true,
            maintainAspectRatio: false,
            plugins: {
              legend: {
                display: false,
              },
              tooltip: {
                callbacks: {
                  label: function (context) {
                    return `Module Versions: ${context.parsed.y}`;
                  },
                },
              },
            },
            scales: {
              y: {
                beginAtZero: true,
                ticks: {
                  stepSize: 1,
                },
                title: {
                  display: true,
                  text: 'Number of Module Versions',
                },
              },
              x: {
                title: {
                  display: true,
                  text: 'Product Versions (Chronological Order)',
                },
              },
            },
            elements: {
              line: {
                tension: 0.4,
              },
              point: {
                radius: 6,
                hoverRadius: 8,
              },
            },
          },
        });
      }
    };

    const scrollLeft = () => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollBy({
          left: -320,
          behavior: 'smooth',
        });
      }
    };

    const scrollRight = () => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollBy({
          left: 320,
          behavior: 'smooth',
        });
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

    onMounted(() => {
      fetchProducts();
      checkScrollPosition();
    });

    const openLogin = () => {
      loginService?.openLogin();
    };

    // Fetch product versions for a specific product
    const fetchProductVersions = async (productName: string) => {
      try {
        const res = await productVersionService.retrieve();
        productVersions.value = res.data.filter((pv: IProductVersion) => pv.product?.name === productName);
      } catch (err) {
        alertService.showHttpError(err.response || err);
      }
    };

    // Fetch the latest non-client version of a product
    const fetchLatestNonClientVersion = async (productName: string) => {
      try {
        const versionRegex = /^\d+\.\d+\.\d+$/;
        const clientVersionRegex = /^[a-zA-Z]+_\d+\.\d+\.\d+$/;

        await fetchProductVersions(productName);

        const nonClientVersions = productVersions.value.filter(
          (pv: IProductVersion) => pv.version && versionRegex.test(pv.version) && !clientVersionRegex.test(pv.version),
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
        console.log(filteredDeployements);
        return filteredDeployements.length;
      } catch (error) {
        console.error(`Error counting deployements for ${productName}:`, error);
        return 0;
      }
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
      // Charts related
      selectedProduct,
      selectProduct,
      closeCharts,
      clientsChart,
      versionsChart,
      clientsChartData,
      versionsChartData,
    };
  },
});
