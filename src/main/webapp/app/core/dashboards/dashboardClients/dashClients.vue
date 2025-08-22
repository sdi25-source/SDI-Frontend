<template>
  <div class="dashboard-content pt-lg-5">
    <div class="dashboard-header"></div>
    <div v-if="loading" class="loading-overlay">
      <div class="loading-spinner"></div>
      <p class="loading-message">{{ t$('global.menu.entities.clientLoading') }}</p>
    </div>
    <!-- Clients Overview Section -->
    <div class="dashboard-section shadow">
      <div class="section-header">
        <h2>{{ t$('global.menu.entities.clientsOverview') }}</h2>
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
          <div class="client-cards">
            <div class="client-card" v-for="client in clients" :key="client.id">
              <i class="bi bi-arrow-up-right card-arrow" @click="selectClient(client)"></i>
              <div class="client-icon">
                <i :class="client.icon"></i>
              </div>
              <div class="client-info">
                <h4>{{ client.name }}</h4>
                <p>Type: {{ client.type || 'N/A' }}</p>
                <p>
                  {{ client.products }} {{ t$('global.menu.entities.product') }} • {{ client.deployments }}
                  {{ t$('global.menu.entities.deployements') }}
                </p>
                <div class="client-status" :class="client.badgeClass">
                  {{ client.requestsOfChanges }} {{ t$('global.menu.entities.requests') }}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content - Conditional Display -->
    <div class="dashboard-content">
      <div v-if="!selectedClient" class="section">
        <div class="chart-container">
          <h4 class="chart-title">{{ t$('global.menu.entities.clientGrowth') }} ({{ currentYear }})</h4>
          <div class="chart-wrapper">
            <canvas ref="clientsEvolutionChart" width="800" height="400"></canvas>
          </div>
          <div v-if="clientsEvolutionData.labels.length === 0" class="no-data-message">{{ t$('global.menu.entities.noDataC') }}</div>
        </div>
      </div>

      <!-- Charts Section -->
      <div v-else class="charts-section">
        <div class="charts-header d-flex justify-content-between align-items-center mb-4">
          <h3>{{ selectedClient.name }} - {{ t$('global.menu.entities.analyticsDash') }}</h3>
          <button @click="closeCharts" class="btn btn-outline-secondary"><i class="bi bi-x-lg"></i></button>
        </div>

        <div class="row">
          <!-- Left Chart - Monthly Deployments Evolution -->
          <div class="col-md-6">
            <div class="chart-container">
              <h4 class="chart-title">Monthly Deployments</h4>
              <div class="chart-wrapper">
                <canvas ref="productDeploymentsChart" width="400" height="400"></canvas>
              </div>
              <div v-if="productDeploymentsChartData.labels.length === 0" class="no-data-message">
                {{ t$('global.menu.entities.noDataProductAv') }}
              </div>
            </div>
          </div>

          <!-- Right Chart - Request of Changes by Customization Level -->
          <div class="col-md-6">
            <div class="chart-container">
              <h4 class="chart-title">{{ t$('global.menu.entities.RequestCustomisation') }}</h4>
              <div class="chart-wrapper">
                <canvas ref="requestChangesChart" width="400" height="400"></canvas>
              </div>
              <div v-if="requestChangesChartData.datasets.length === 0" class="no-data-message">
                {{ t$('global.menu.entities.noDataRequestAv') }}
              </div>
              <!-- Summary Stats -->
              <div class="request-stats mt-3">
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-number">{{ totalRequests.basic }}</span>
                    <span class="stat-label">{{ t$('global.menu.entities.basic') }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ totalRequests.intermediate }}</span>
                    <span class="stat-label">{{ t$('global.menu.entities.intermediate') }}</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ totalRequests.advanced }}</span>
                    <span class="stat-label">{{ t$('global.menu.entities.advanced') }}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    <!-- Deployments Details Popup (Gray/White) -->
    <div v-if="showDeploymentsPopup" class="dw-popup-overlay" @click="closeDeploymentsPopup">
      <div class="dw-popup" @click.stop>
        <div class="dw-popup-header">
          <h3>{{ selectedDeploymentsPoint?.month }} {{ selectedDeploymentsPoint?.year }} — Deployments ({{ selectedDeploymentsPoint?.total }})</h3>
          <button class="dw-popup-close" @click="closeDeploymentsPopup">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>
        <div class="dw-popup-body">
          <div v-if="!selectedDeploymentsPoint?.items?.length" class="dw-empty">No details</div>
          <ul v-else class="dw-list">
            <li v-for="(item, idx) in selectedDeploymentsPoint?.items" :key="idx" class="dw-item">
              <div class="dw-line">
                <span class="dw-product">{{ item.product }}</span>
                <span class="dw-version" v-if="item.version">v{{ item.version }}</span>
              </div>
              <div class="dw-meta">
                <span class="dw-date">{{ new Date(item.startDate as any).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' }) }}</span>
                <span class="dw-contract" v-if="item.contractRef">#{{ item.contractRef }}</span>
              </div>
            </li>
          </ul>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./dashClients.component.ts"></script>

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

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
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

.client-cards {
  display: flex;
  gap: 15px;
  padding: 5px 0;
  min-width: fit-content;
}

.client-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
  min-width: 280px;
  max-width: 280px;
  flex-shrink: 0;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  position: relative;
}

.client-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
}

.client-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #0c2d57;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.client-icon i {
  font-size: 20px;
  color: white;
}

.client-info h4 {
  margin: 0 0 5px;
  font-size: 16px;
}

.client-info p {
  margin: 0 0 5px;
  font-size: 12px;
  color: #777;
}

.client-status {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.client-status.finance {
  background-color: #e6f7ee;
  color: #0ca678;
}

.client-status.insurance {
  background-color: #e0f7fa;
  color: #0288d1;
}

.client-status.security {
  background-color: #fff9db;
  color: #f59f00;
}

.client-status.analytics {
  background-color: #e7f5ff;
  color: #1c7ed6;
}

.client-status.communication {
  background-color: #f3e5f5;
  color: #9c27b0;
}

.client-status.health {
  background-color: #fce4ec;
  color: #e91e63;
}

.client-status.logistics {
  background-color: #e8f5e8;
  color: #4caf50;
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

/* Request Stats */
.request-stats {
  border-top: 1px solid #eee;
  padding-top: 15px;
}

.stats-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 15px;
}

.stat-item {
  text-align: center;
  padding: 10px;
  background-color: white;
  border-radius: 6px;
  border: 1px solid #eee;
}

.stat-number {
  display: block;
  font-size: 20px;
  font-weight: 700;
  color: #0c2d57;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

/* Responsive Design */
@media (max-width: 768px) {
  .client-card {
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
  }

  .chart-title {
    font-size: 14px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .client-card {
    min-width: 220px;
    max-width: 220px;
    padding: 12px;
  }

  .client-icon {
    width: 35px;
    height: 35px;
  }

  .client-icon i {
    font-size: 18px;
  }

  .client-info h4 {
    font-size: 14px;
  }

  .client-info p {
    font-size: 11px;
  }

  .client-status {
    font-size: 11px;
  }

  .chart-container {
    height: 350px;
    padding: 15px;
  }

  .chart-title {
    font-size: 13px;
  }

  .no-data-message {
    font-size: 12px;
  }
}
/* Deployments Popup (Gray/White minimal) */
.dw-popup-overlay {
  position: fixed;
  inset: 0;
  background: rgba(0,0,0,0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.dw-popup {
  background: #fff;
  border: 1px solid #dee2e6;
  border-radius: 10px;
  width: 92%;
  max-width: 560px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 10px 30px rgba(0,0,0,0.15);
}

.dw-popup-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background: #f8f9fa;
  border-bottom: 1px solid #e9ecef;
}

.dw-popup-header h3 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #495057;
}

.dw-popup-close {
  border: none;
  background: transparent;
  color: #6c757d;
  font-size: 18px;
  cursor: pointer;
}

.dw-popup-body {
  padding: 12px 16px;
  max-height: calc(80vh - 56px);
  overflow: auto;
  background: #fff;
}

.dw-empty {
  text-align: center;
  color: #868e96;
  font-style: italic;
  padding: 16px;
}

.dw-list {
  list-style: none;
  margin: 0;
  padding: 0;
}

.dw-item {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 8px;
  background: #fafafa;
}

.dw-line {
  display: flex;
  gap: 8px;
  align-items: baseline;
}

.dw-product {
  font-weight: 600;
  color: #343a40;
}

.dw-version {
  color: #6c757d;
}

.dw-meta {
  display: flex;
  gap: 12px;
  font-size: 12px;
  color: #6c757d;
  margin-top: 4px;
}

/* keep existing responsive rules */
</style>
