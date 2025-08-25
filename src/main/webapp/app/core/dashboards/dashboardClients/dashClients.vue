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
      <div v-if="!selectedClient">
        <div class="chart-container">
          <h4 class="chart-title-left">{{ t$('global.menu.entities.clientGrowth') }} ({{ currentYear }})</h4>
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
          <!-- Left  -->
          <div class="col-md-6">
            <div class="chart-container shadow-md">
              <h4 class="chart-title-center">{{ t$('global.menu.entities.distribution') }}</h4>
              <div v-if="productDeploymentsChartData.labels.length === 0" class="no-data-message">
                {{ t$('global.menu.entities.noDataProductAv') }}
              </div>
              <!-- Module details flex layout -->
              <div v-if="productDeploymentsChartData.labels.length > 0" class="modules-legend">
                <div class="modules-flex-container">
                  <div
                    v-for="(moduleName, index) in productDeploymentsChartData.labels"
                    :key="moduleName"
                    class="module-flex-item"
                    @click="showModuleDetails(moduleName)"
                  >
                    <div
                      class="legend-color"
                      :style="{ backgroundColor: productDeploymentsChartData.datasets[0].backgroundColor[index] }"
                    ></div>
                    <div class="legend-info">
                      <span class="legend-name">{{ moduleName }}</span>
                      <span class="legend-count">
                        {{ productDeploymentsChartData.datasets[0].data[index] }} déploiement(s)
                      </span>
                      <span class="legend-versions">
                        {{ productDeploymentsChartData.datasets[0].moduleDetails[moduleName]?.versions.length || 0 }} version(s)
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Right Chart - Request of Changes by Customization Level -->
          <div class="col-md-6">
            <div class="chart-container shadow-md">
              <h4 class="chart-title-center">{{ t$('global.menu.entities.RequestCustomisation') }}</h4>
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

        <!-- Contracts Table Section -->
        <div class="contracts-section pt-4">
          <h4 class="chart-title-left">Deployments par products</h4>
          <div class="contracts-table">
            <div v-if="contracts.length === 0" class="no-data-message text-center py-4">
              No contracts available for this client
            </div>

            <div v-else class="contracts-list">
              <div
                v-for="contract in contracts"
                :key="contract.id"
                class="contract-item"
              >
                <!-- Contract Row -->
                <div class="contract-row" @click="toggleContractExpansion(contract.id)">
                  <div class="expand-icon">
                    <i :class="expandedContracts.has(contract.id) ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
                  </div>
                  <div class="contract-info">
                    <div class="contract-main">
                      <span class="contract-ref">{{ contract.refContract }}</span>
                      <span class="contract-client">{{ contract.clientName }}</span>
                      <span class="contract-product">{{ contract.productName }}</span>
                    </div>
                    <div class="contract-meta">
                      <span class="contract-date">{{ formatDate(contract.createDate) }}</span>
                      <span class="deployment-count">{{ contract.deploymentDetails.length }} deployment details</span>
                    </div>
                  </div>
                </div>

                <!-- Deployment Details (Expanded) -->
                <div v-if="expandedContracts.has(contract.id)" class="deployment-details">
                  <div
                    v-for="detail in contract.deploymentDetails"
                    :key="detail.id"
                    class="deployment-detail-item"
                  >
                    <!-- Deployment Detail Row -->
                    <div class="deployment-detail-row" @click="toggleDeploymentDetailExpansion(detail.id)">
                      <div class="expand-icon">
                        <i :class="expandedDeploymentDetails.has(detail.id) ? 'bi bi-chevron-down' : 'bi bi-chevron-right'"></i>
                      </div>
                      <div class="deployment-detail-info">
                        <div class="deployment-detail-main">
                          <span class="deployment-version">{{ detail.productVersion?.version || 'Unknown Version' }}</span>
                          <span class="deployment-type">{{ detail.deployementType?.type || 'Standard' }}</span>
                        </div>
                        <div class="deployment-detail-meta">
                          <span class="deployment-dates">
                            {{ formatDate(detail.startDeployementDate) }} - {{ formatDate(detail.endDeployementDate) }}
                          </span>
                          <span class="module-count">{{ detail.moduleDeployments.length }} modules</span>
                        </div>
                      </div>
                    </div>

                    <!-- Module Deployments (Expanded) -->
                    <div v-if="expandedDeploymentDetails.has(detail.id)" class="module-deployments">
                      <div v-if="detail.moduleDeployments.length === 0" class="no-modules-message">
                        No module deployments
                      </div>
                      <div
                        v-else
                        v-for="moduleDeployment in detail.moduleDeployments"
                        :key="moduleDeployment.id"
                        class="module-deployment-item"
                      >
                        <div class="module-deployment-info">
                          <div class="module-deployment-main">
                            <span class="module-code">{{ moduleDeployment.code }}</span>
                            <span class="module-name">{{ moduleDeployment.module?.name || 'Unknown Module' }}</span>
                            <span class="module-version">v{{ moduleDeployment.moduleVersion?.version || 'Unknown' }}</span>
                          </div>
                          <div class="module-deployment-meta">
                            <span class="module-date">{{ formatDate(moduleDeployment.createDate) }}</span>
                            <span v-if="moduleDeployment.notes" class="module-notes">{{ moduleDeployment.notes }}</span>
                          </div>
                        </div>
                      </div>
                    </div>
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
          <h3>{{ selectedModuleData?.name }}</h3>
          <button @click="closeModulePopup" class="close-btn">
            <i class="bi bi-x-lg"></i>
          </button>
        </div>

        <div class="popup-content">
          <div class="description-deployment-container">
            <div class="module-description">
              <h4>Description</h4>
              <p>{{ selectedModuleData?.description || 'No description available' }}</p>
            </div>
            <div class="stat-card last-deployment-card">
              <span class="stat-value">{{ selectedModuleData?.lastDeployment || 'N/A' }}</span>
              <span class="stat-label">Last Deployment</span>
            </div>
          </div>

          <div class="deployments-history">
            <h4>Deployment History</h4>
            <div class="deployments-list">
              <div v-if="!selectedModuleData?.deployments || selectedModuleData.deployments.length === 0"
                   class="no-deployments">
                No deployment history available
              </div>
              <div v-else
                   v-for="(deployment, index) in selectedModuleData.deployments"
                   :key="index"
                   class="deployment-history-item">
                <div class="deployment-version">
                  <span class="version-badge">v{{ deployment.version }}</span>
                </div>
                <div class="deployment-details">
                  <span class="deployment-date">{{ formatDate(deployment.date) }}</span>
                </div>
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
  background-color: #ffffff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  height: 500px;
  display: flex;
  flex-direction: column;
}

.chart-title-left {
  margin: 0 0 15px;
  font-size: 18px;
  font-weight: 600;
  color: #0c2d57;
  text-align: left;
}

.chart-title-center {
  margin: 0 0 15px;
  font-size: 18px;
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

/* Equal Height for Left and Right Sections */
.equal-height {
  display: flex;
  flex-direction: row;
  flex-wrap: nowrap;
  gap: 20px;
}

.equal-height .col-md-6 {
  display: flex;
  flex: 1 1 50%;
  min-height: 0;
}

.equal-height .chart-container {
  flex: 1;
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
  font-size: 17px;
  font-weight: 600;
  color: #0c2d57;
  margin-bottom: 4px;
}

.stat-label {
  font-size: 11px;
  color: #666;
  font-weight: 500;
}

/* Contracts Table Styles */
.contracts-section {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  padding: 20px;
  margin-top: 20px;
}

.contracts-table {
  margin-top: 15px;
}

.contracts-list {
  border: 1px solid #e9ecef;
  border-radius: 8px;
  overflow: hidden;
}

.contract-item {
  border-bottom: 1px solid #b3b6b6;
}

.contract-item:last-child {
  border-bottom: none;
}

.contract-row {
  display: flex;
  align-items: center;
  padding: 16px 20px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: #f8f9fa;
  width: 100%;
}

.contract-row:hover {
  background-color: #e9ecef;
}

.contract-info {
  flex: 1;
}

.contract-main {
  display: flex;
  gap: 20px;
  margin-bottom: 4px;
}

.contract-ref {
  font-weight: 600;
  color: #0c2d57;
  min-width: 120px;
}

.contract-client {
  color: #495057;
  font-weight: 500;
  min-width: 150px;
}

.contract-product {
  color: #6c757d;
  min-width: 150px;
}

.contract-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #6c757d;
}

.contract-date {
  min-width: 100px;
}

.deployment-count {
  font-weight: 500;
  color: #0ca678;
}

.expand-icon {
  color: #6c757d;
  font-size: 14px;
  margin-right: 10px;
  transition: transform 0.2s ease;
}

.expand-icon .bi-chevron-up {
  transform: rotate(0deg);
}

.expand-icon .bi-chevron-down {
  transform: rotate(0deg);
}

.deployment-details {
  width: 100%;
}

.deployment-detail-item {
  border-bottom: 1px solid #e9ecef;
}

.deployment-detail-item:last-child {
  border-bottom: none;
}

.deployment-detail-row {
  display: flex;
  align-items: center;
  padding: 16px 20px 16px 30px;
  cursor: pointer;
  transition: background-color 0.2s ease;
  background-color: #f8f9fa;
  width: 100%;
}

.deployment-detail-row:hover {
  background-color: #e9ecef;
}

.deployment-detail-info {
  flex: 1;
}

.deployment-detail-main {
  display: flex;
  gap: 20px;
  margin-bottom: 4px;
}

.deployment-version {
  font-weight: 600;
  color: #1c7ed6;
  min-width: 120px;
}

.deployment-type {
  color: #495057;
  font-weight: 500;
  min-width: 150px;
}

.deployment-detail-meta {
  display: flex;
  gap: 20px;
  font-size: 12px;
  color: #6c757d;
}

.deployment-dates {
  min-width: 200px;
}

.module-count {
  font-weight: 500;
  color: #f59f00;
}

.module-deployments {
  background-color: #ffffff;
  border-top: 1px solid #e9ecef;
  width: 100%;
}

.no-modules-message {
  padding: 16px 40px;
  color: #6c757d;
  font-style: italic;
  text-align: center;
}

.module-deployment-item {
  padding: 10px 40px;
  border-bottom: 1px solid #e9ecef;
}

.module-deployment-item:last-child {
  border-bottom: none;
}

.module-deployment-info {
  display: block;
}

.module-deployment-main {
  margin-bottom: 4px;
}

.module-code {
  font-weight: 600;
  color: #9c27b0;
  font-family: monospace;
}

.module-name {
  color: #495057;
  font-weight: 500;
}

.module-version {
  color: #28a745;
  font-weight: 500;
}

.module-deployment-meta {
  font-size: 11px;
  color: #6c757d;
}

.module-date {
  display: block;
}

.module-notes {
  display: block;
  font-style: italic;
}

/* Modules Legend Styles */
.modules-legend {
  border-top: 1px solid #eee;
  padding-top: 15px;
  flex: 1;
}

.modules-flex-container {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
  justify-content: flex-start;
}

.module-flex-item {
  flex: 0 0 calc(33.333% - 7px);
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  background-color: #f8f9fa;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.module-flex-item:hover {
  background-color: #e9ecef;
}

.legend-color {
  width: 14px;
  height: 14px;
  border-radius: 3px;
  flex-shrink: 0;
}

.legend-info {
  display: flex;
  flex-direction: column;
  gap: 3px;
}

.legend-name {
  font-weight: 600;
  color: #333;
  font-size: 0.9rem;
}

.legend-count {
  color: #666;
  font-size: 0.8rem;
}

.legend-versions {
  color: #888;
  font-size: 0.75rem;
}

/* Module Popup Styles */
.module-popup-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.6);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 2000;
}

.module-popup {
  background-color: #fff;
  border-radius: 8px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  width: 90%;
  max-width: 600px;
  max-height: 80vh;
  overflow-y: auto;
  animation: fadeIn 0.3s ease-out;
}

@keyframes fadeIn {
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
}

.popup-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 15px 20px;
  border-bottom: 1px solid #eee;
}

.popup-header h3 {
  margin: 0;
  font-size: 1.1rem;
  color: #0c2d57;
}

.close-btn {
  background: none;
  border: none;
  font-size: 1.2rem;
  cursor: pointer;
  color: #666;
}

.close-btn:hover {
  color: #0c2d57;
}

.popup-content {
  padding: 20px;
}
.description-deployment-container {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  gap: 20px;
  margin-bottom: 20px;
}
.module-description {
  flex: 1;
  min-width: 0;
}

.module-description h4 {
  font-size: 1.0rem;
  margin-bottom: 10px;
  color: #333;
}

.module-description p {
  margin: 0;
  font-size: 0.9rem;
}

.last-deployment-card {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
  width: 150px;
  flex-shrink: 0;
}

.stat-card {
  background-color: #f8f9fa;
  border-radius: 6px;
  padding: 10px;
  text-align: center;
}

.stat-value {
  display: block;
  font-size: 0.7rem;
  font-weight: 700;
  color: #0c2d57;
  margin-bottom: 5px;
}

.stat-label {
  font-size: 0.85rem;
  color: #666;
}

@media (max-width: 768px) {
  .description-deployment-container {
    flex-direction: column;
    align-items: stretch;
  }

  .last-deployment-card {
    width: 100%;
    max-width: 150px;
    margin: 0 auto;
  }
}

.deployments-history h4 {
  font-size: 1.0rem;
  margin-bottom: 10px;
  color: #333;
}

.deployments-list {
  max-height: 200px;
  overflow-y: auto;
}

.deployment-history-item {
  display: flex;
  justify-content: space-between;
  padding: 10px;
  border-bottom: 1px solid #eee;
}

.deployment-version {
  display: flex;
  gap: 10px;
  align-items: center;
}

.version-badge {
  background-color: #e7f5ff;
  color: #1c7ed6;
  padding: 3px 8px;
  border-radius: 12px;
  font-size: 0.85rem;
}

.deployment-order {
  color: #666;
  font-size: 0.85rem;
}

.deployment-date {
  color: #666;
  font-size: 0.85rem;
}

.deployment-status {
  font-size: 0.85rem;
  padding: 3px 8px;
  border-radius: 12px;
}

.deployment-status.active {
  background-color: #e6f7ee;
  color: #0ca678;
}

.no-deployments {
  color: #777;
  font-style: italic;
  text-align: center;
  padding: 10px;
}

/* Responsive Design */
@media (max-width: 992px) {
  .equal-height {
    flex-direction: row;
    gap: 15px;
  }

  .equal-height .col-md-6 {
    flex: 1 1 50%;
  }

  .module-flex-item {
    flex: 0 0 calc(50% - 7px);
  }
}

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


  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }

  .contract-main,
  .deployment-detail-main,
  .module-deployment-main {
    flex-direction: column;
    gap: 4px;
  }

  .contract-meta,
  .deployment-detail-meta,
  .module-deployment-meta {
    flex-direction: column;
    gap: 2px;
  }

  .contract-row {
    padding: 12px 15px;
  }

  .deployment-detail-row {
    padding: 12px 15px 12px 25px;
  }

  .module-deployment-item {
    padding: 8px 30px;
  }

  .contract-ref,
  .contract-client,
  .contract-product,
  .deployment-version,
  .deployment-type,
  .module-code,
  .module-name,
  .module-version {
    min-width: auto;
  }

  .module-flex-item {
    flex: 0 0 calc(50% - 7px);
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

  .no-data-message {
    font-size: 12px;
  }

  .contract-row {
    padding: 10px 12px;
  }

  .deployment-detail-row {
    padding: 10px 12px 10px 20px;
  }

  .module-deployment-item {
    padding: 6px 24px;
  }

  .contract-main,
  .deployment-detail-main,
  .module-deployment-main {
    gap: 2px;
  }

  .module-flex-item {
    flex: 0 0 100%;
  }
}

/* Responsive Design for Modules */
@media (max-width: 768px) {
  .module-popup {
    width: 95%;
    margin: 20px;
  }

  .popup-content {
    padding: 16px;
  }

  .module-stats {
    grid-template-columns: 1fr;
    gap: 12px;
  }

  .deployment-history-item {
    flex-direction: column;
    align-items: flex-start;
    gap: 8px;
  }

  .deployment-details {
    width: 100%;
    justify-content: space-between;
  }
}
</style>
