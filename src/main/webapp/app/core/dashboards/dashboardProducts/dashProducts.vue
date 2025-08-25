<template>
  <div class="dashboard-content pt-lg-5">
    <div class="dashboard-header"></div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-message">{{ t('global.menu.entities.productLoading') }}</p>
    </div>
    <!-- Products Overview Section -->
    <div class="dashboard-section shadow">
      <div class="section-header">
        <h2>{{ t('global.menu.entities.productsOverview') }}</h2>
        <div class="scroll-controls">
          <button @click="scrollLeft" class="scroll-button" :disabled="isAtStart">
            <i class="bi bi-chevron-left"></i>
          </button>
          <button @click="scrollRight" class="scroll-button" :disabled="isAtEnd">
            <i class="bi bi-chevron-right"></i>
          </button>
        </div>
      </div>
      <div class="section-content">
        <div class="horizontal-scroll-container" ref="scrollContainer" @scroll="checkScrollPosition">
          <div class="product-cards">
            <div class="product-card" v-for="product in products" :key="product.id">
              <i class="bi bi-arrow-up-right card-arrow" @click="selectProduct(product)"></i>
              <div class="product-icon">
                <i :class="product.icon"></i>
              </div>
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p>{{ t('global.menu.entities.lastVersion') }} {{ latestVersions.get(product.name)?.version || 'N/A' }}</p>
                <p>
                  {{ moduleVersionCounts.get(product.name) || 0 }} {{ t('global.menu.entities.module') }} •
                  {{ totalFeaturesPerProduct.get(product.name) || 0 }} {{ t('global.menu.entities.feature') }}
                </p>
                <div class="product-status" :class="product.badgeClass">
                  {{ t('global.menu.entities.deploy') }} {{ totalDeployementsPerProduct.get(product.name) || 0 }}
                  {{ t('global.menu.entities.times') }}
                </div>
                <div class="product-status customer ml-2">{{ product.clients || 0 }} {{ t('global.menu.entities.customer') }}</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content - Conditional Display -->
    <div class="dashboard-content">
      <div v-if="!selectedProduct" class="section">
        <div class="chart-container">
          <h4 class="chart-title">{{ t('global.menu.entities.productGrowth') }} ({{ currentYear }})</h4>
          <div class="chart-wrapper">
            <canvas ref="productsEvolutionChart" width="800" height="400"></canvas>
          </div>
          <div v-if="productsEvolutionData.labels.length === 0" class="no-data-message">
            No data available for the evolution of products
          </div>
          <div v-if="productsEvolutionData.labels.length === 0" class="no-data-message">{{ t('global.menu.entities.noDataP') }}</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div v-else class="charts-section">
        <!-- Header -->
        <div class="d-flex justify-content-between align-items-center mb-4">
          <h3 class="fw-bold">{{ selectedProduct.name }} - Analytics Dashboard</h3>
          <button @click="closeCharts" class="btn btn-outline-secondary"><i class="bi bi-x-lg"></i> Close</button>
        </div>

        <div class="container-fluid">
          <!-- Row for Table + Details + Chart -->
          <div class="row g-4">
            <!-- Left Table -->
            <div class="col-lg-6">
              <div class="card shadow-sm border-0 h-100">
                <div class="card-body">
                  <h4 class="card-title mb-4 text-primary fw-semibold">Clients Distribution & Module Deployments</h4>
                  <div class="table-responsive">
                    <table class="table table-hover align-middle text-center mb-0">
                      <tbody>
                        <template v-for="(client, idx) in clients" :key="client.id ?? client.name ?? idx">
                          <tr>
                            <!-- Colonne Logo -->
                            <td class="align-middle" style="width: 56px">
                              <img
                                v-if="client.clientLogo"
                                :src="client.clientLogo"
                                :alt="`Logo ${client.name}`"
                                style="height: 32px; width: 32px; object-fit: contain"
                              />
                              <div
                                v-else
                                class="d-inline-flex align-items-center justify-content-center bg-light text-muted border rounded"
                                style="height: 32px; width: 32px; font-size: 10px"
                                title="Pas de logo"
                              >
                                —
                              </div>
                            </td>

                            <!-- Colonne Nom du client -->
                            <td class="align-middle">
                              {{ client.name }}
                            </td>

                            <!-- Colonne Dernier déploiement (toggle up/down) -->
                            <td
                              class="align-middle"
                              style="cursor: pointer"
                              @click="
                                expandedClientId =
                                  expandedClientId === (client.id ?? client.name ?? idx) ? null : (client.id ?? client.name ?? idx)
                              "
                            >
                              <span v-if="client.deployments && client.deployments.length" class="">
                                {{ client.deployments[client.deployments.length - 1].refContract || 'N/A' }}
                                <i
                                  class="bi ms-2"
                                  :class="expandedClientId === (client.id ?? client.name ?? idx) ? 'bi-chevron-up' : 'bi-chevron-down'"
                                ></i>
                              </span>
                              <span v-else class="badge bg-secondary">N/A</span>
                            </td>
                          </tr>

                          <!-- Ligne de détails (modules) -->
                          <tr v-if="expandedClientId === (client.id ?? client.name ?? idx)">
                            <td colspan="4" class="bg-light p-3">
                              <div v-if="selectedDeployments[client.id] && getModules(client.id, selectedDeployments[client.id]).length">
                                <table class="table table-sm table-hover mb-0">
                                  <thead class="table-light">
                                    <tr>
                                      <th>Module</th>
                                      <th>Version</th>
                                      <th>Product Version</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    <tr
                                      v-for="(module, mIdx) in getModules(client.id, selectedDeployments[client.id])"
                                      :key="module.id ?? module.moduleName ?? module.productVersion ?? mIdx"
                                    >
                                      <td>{{ module.moduleName || 'N/A' }}</td>
                                      <td>{{ module.version || 'N/A' }}</td>
                                      <td>{{ module.productVersion || 'N/A' }}</td>
                                    </tr>
                                  </tbody>
                                </table>
                              </div>
                              <div v-else class="py-2 text-muted">Aucun module pour ce déploiement.</div>
                            </td>
                          </tr>
                        </template>
                      </tbody>
                    </table>
                  </div>
                  <div v-if="clients.length === 0" class="text-center text-muted mt-3">
                    {{ t('global.menu.entities.noClientDataForPV') }}
                  </div>
                </div>
              </div>
            </div>

            <!-- Right Chart -->
            <div class="col-lg-6">
              <div class="card shadow-sm border-0 h-100">
                <div class="card-body">
                  <h4 class="card-title mb-4 text-primary fw-semibold">Module Evolution by Product Version</h4>
                  <div class="chart-wrapper" style="position: relative; height: 400px">
                    <canvas ref="versionsChart"></canvas>
                  </div>
                  <div v-if="versionsChartData.labels.length === 0" class="text-center text-muted mt-3">No version data available</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="charts-header d-flex justify-content-between align-items-center mb-4">
          <h3>{{ selectedProduct.name }} - {{ t('global.menu.entities.analyticsDash') }}</h3>
          <button @click="closeCharts" class="btn btn-outline-secondary"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="row">
          <!-- Left Chart - Clients Distribution -->
          <div class="col-md-6">
            <div class="chart-container">
              <h4 class="chart-title">
                {{ t('global.menu.entities.clientDistByMD') }} ({{ t('global.menu.entities.lastVersion') }}:
                {{ selectedProduct.name || 'N/A' }}
                v{{ latestVersions.get(selectedProduct.name)?.version || 'N/A' }})
              </h4>
              <div class="chart-wrapper">
                <canvas ref="clientsChart" width="400" height="400"></canvas>
              </div>
              <div v-if="clientsChartData.labels.length === 0" class="no-data-message">
                {{ t('global.menu.entities.noClientDataForPV') }}
              </div>
            </div>
          </div>

          <!-- Right Chart - Product Versions -->
          <div class="col-md-6">
            <div class="chart-container">
              <h4 class="chart-title">{{ t('global.menu.entities.moduleEvoByPV') }}</h4>
              <div class="chart-wrapper">
                <canvas ref="versionsChart" width="400" height="400"></canvas>
              </div>
              <div v-if="versionsChartData.labels.length === 0" class="no-data-message">{{ t('global.menu.entities.noDataForV') }}</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./dashProducts.component.ts"></script>

<style scoped>
/* Loading Indicator Styles */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0c2d57;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #0c2d57;
}

/* Loading Indicator Styles */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0c2d57;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #0c2d57;
}

@keyframes spin {
  0% {
    transform: rotate(0deg);
  }
  100% {
    transform: rotate(360deg);
  }
}

.dashboard-content {
  flex: 1;
  margin-left: 20px;
  padding: 20px;
}

.dashboard-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 20px;
}

.dashboard-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.section-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.section-header h2 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
}

.scroll-controls {
  display: flex;
  gap: 10px;
}

.scroll-button {
  width: 40px;
  height: 40px;
  border: 1px solid #ddd;
  background-color: #fff;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  transition: all 0.3s ease;
}

.scroll-button:hover:not(:disabled) {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.scroll-button:disabled {
  opacity: 0.4;
  cursor: not-allowed;
}

.scroll-button i {
  font-size: 16px;
}

.horizontal-scroll-container {
  overflow-x: auto;
  overflow-y: hidden;
  padding-bottom: 10px;
  scrollbar-width: thin;
  scrollbar-color: #ccc transparent;
}

.horizontal-scroll-container::-webkit-scrollbar {
  height: 6px;
}

.horizontal-scroll-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 10px;
}

.horizontal-scroll-container::-webkit-scrollbar-thumb {
  background: #ccc;
  border-radius: 10px;
}

.horizontal-scroll-container::-webkit-scrollbar-thumb:hover {
  background: #999;
}

.product-cards {
  display: flex;
  gap: 15px;
  padding: 5px 0;
  min-width: fit-content;
}

.product-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  min-width: 280px;
  max-width: 280px;
  flex-shrink: 0;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  position: relative;
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.product-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #0c2d57;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.product-icon i {
  font-size: 20px;
  color: white;
}

.product-info h4 {
  margin: 0 0 5px;
  font-size: 16px;
}

.product-info p {
  margin: 0 0 5px;
  font-size: 12px;
  color: #777;
}

.product-status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.product-status.customer {
  background-color: #e9ebf6;
  color: #95a0f4;
}

.product-status.low-deployments {
  background-color: #e6f7ee;
  color: #0ca678;
}

.product-status.medium-deployments {
  background-color: #fff9db;
  color: #f59f00;
}

.product-status.high-deployments {
  background-color: #e0f7fa;
  color: #0288d1;
}

.product-status.very-high-deployments {
  background-color: #e7f5ff;
  color: #1c7ed6;
}

.card-arrow {
  position: absolute;
  top: 10px;
  right: 10px;
  font-size: 0.8rem;
  color: #0c2d57;
  cursor: pointer;
  transition: color 0.3s ease;
}

.card-arrow:hover {
  color: #1c7ed6;
}

/* Charts Styles */
.charts-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-bottom: 20px;
}

.charts-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #0c2d57;
}

.chart-container {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chart-title {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 600;
  color: #0c2d57;
  text-align: center;
}

.chart-wrapper {
  flex: 1;
  position: relative;
  min-height: 0;
}

.no-data-message {
  display: flex;
  align-items: center;
  justify-content: center;
  height: 100%;
  color: #777;
  font-style: italic;
  text-align: center;
  font-size: 14px;
}

@media (max-width: 768px) {
  .product-card {
    min-width: 250px;
    max-width: 250px;
  }

  .scroll-controls {
    display: none;
  }

  .section-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .charts-header {
    flex-direction: column;
    align-items: flex-start !important;
    gap: 10px;
  }

  .chart-container {
    height: 400px;
    margin-bottom: 20px;
    padding: 15px;
  }

  .chart-title {
    font-size: 14px;
    margin-bottom: 10px;
  }
}

@media (max-width: 480px) {
  .product-card {
    min-width: 220px;
    max-width: 220px;
    padding: 12px;
  }

  .product-icon {
    width: 35px;
    height: 35px;
  }

  .product-icon i {
    font-size: 18px;
  }

  .product-info h4 {
    font-size: 14px;
  }

  .product-info p {
    font-size: 11px;
  }

  .product-status {
    font-size: 11px;
  }

  .chart-container {
    height: 350px;
    padding: 15px;
  }

  .chart-title {
    font-size: 13px;
    margin-bottom: 8px;
  }

  .no-data-message {
    font-size: 12px;
  }
}
</style>
