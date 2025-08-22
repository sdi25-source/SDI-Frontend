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
          <!-- Left Chart - Module Deployments Evolution -->
          <div class="col-md-6">
            <div class="chart-container">
              <h4 class="chart-title">Évolution des déploiements de modules</h4>
              <div class="chart-wrapper">
                <canvas ref="moduleDeploymentsEvolutionChart" width="400" height="400"></canvas>
              </div>
              <div v-if="moduleDeploymentsEvolutionData.labels.length === 0" class="no-data-message">
                Aucune donnée de déploiement de modules disponible
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

    <!-- Module Details Popup -->
    <div v-if="showModulePopup" class="module-popup-overlay" @click="closeModulePopup">
      <div class="module-popup" @click.stop>
        <div class="popup-header">
          <h3>Modules déployés - {{ selectedModuleData?.monthName }} {{ currentYear }}</h3>
          <button @click="closeModulePopup" class="close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="popup-content">
          <div class="modules-summary">
            <p>{{ selectedModuleData?.totalModules || 0 }} module(s) déployé(s) ce mois-ci</p>
          </div>

          <div class="modules-list">
            <div v-if="!selectedModuleData?.modules || selectedModuleData.modules.length === 0"
                 class="no-modules">
              Aucun module déployé ce mois-ci
            </div>
            <div v-else
                 v-for="(module, index) in selectedModuleData.modules"
                 :key="index"
                 class="module-item">
              <div class="module-header">
                <h4 class="module-name">{{ module.name }}</h4>
                <span class="module-version">v{{ module.version }}</span>
              </div>
              <div class="module-details">
                <p class="module-date">Déployé le: {{ module.date }}</p>
                <p class="module-description">{{ module.description }}</p>
              </div>
            </div>
          </div>
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

/* Module Popup Styles - Simple Gray and White Theme */
.module-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(128, 128, 128, 0.4);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
}

.module-popup {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 8px;
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow: hidden;
  box-shadow: 0 8px 32px rgba(0, 0, 0, 0.1);
  animation: popupFadeIn 0.3s ease-out;
}

@keyframes popupFadeIn {
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.popup-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid #e0e0e0;
  padding: 16px 20px;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.popup-header h3 {
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #333333;
}

.close-btn {
  background: none;
  border: none;
  color: #666666;
  font-size: 16px;
  cursor: pointer;
  padding: 4px;
  border-radius: 4px;
  transition: all 0.2s ease;
}

.close-btn:hover {
  background-color: #e9ecef;
  color: #333333;
}

.popup-content {
  padding: 20px;
  max-height: calc(80vh - 80px);
  overflow-y: auto;
}

.modules-summary {
  background-color: #f8f9fa;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 12px 16px;
  margin-bottom: 20px;
  text-align: center;
}

.modules-summary p {
  margin: 0;
  font-size: 14px;
  font-weight: 500;
  color: #555555;
}

.modules-list {
  max-height: 400px;
  overflow-y: auto;
}

.no-modules {
  text-align: center;
  color: #888888;
  font-style: italic;
  padding: 40px 20px;
  background-color: #f8f9fa;
  border-radius: 6px;
  border: 1px solid #e0e0e0;
}

.module-item {
  background-color: #ffffff;
  border: 1px solid #e0e0e0;
  border-radius: 6px;
  padding: 16px;
  margin-bottom: 12px;
  transition: all 0.2s ease;
}

.module-item:hover {
  background-color: #f8f9fa;
  border-color: #cccccc;
}

.module-item:last-child {
  margin-bottom: 0;
}

.module-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.module-name {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #333333;
}

.module-version {
  background-color: #e9ecef;
  color: #495057;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
  border: 1px solid #dee2e6;
}

.module-details {
  color: #666666;
}

.module-date {
  margin: 0 0 8px 0;
  font-size: 13px;
  font-weight: 500;
}

.module-description {
  margin: 0;
  font-size: 13px;
  line-height: 1.4;
  color: #777777;
}

/* Responsive Design for Popup */
@media (max-width: 768px) {
  .module-popup {
    width: 95%;
    margin: 20px;
  }

  .popup-header {
    padding: 12px 16px;
  }

  .popup-header h3 {
    font-size: 16px;
  }

  .popup-content {
    padding: 16px;
  }

  .module-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .module-version {
    align-self: flex-end;
  }
}
</style>
