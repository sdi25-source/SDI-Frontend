<template>
  <div class="dashboard-content">
    <div class="dashboard-header"></div>

    <!-- Module Overview Section -->
    <div class="dashboard-section shadow">
      <div class="section-header">
        <h2>Clients Overview</h2>
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
          <div class="module-grid-horizontal">
            <div class="module-card" v-for="client in clients" :key="client.id">
              <i class="bi bi-arrow-up-right card-arrow" @click="selectClient(client)"></i>

              <div class="module-header">
                <div class="module-icon">
                  <i :class="client.icon"></i>
                </div>
                <div class="module-title">
                  <h4>{{ client.name }}</h4>
                  <span class="module-badge" :class="client.badgeClass">{{ client.type }}</span>
                </div>
              </div>
              <div class="module-stats">
                <div class="module-stat">
                  <span class="stat-value">{{ client.products }}</span>
                  <span class="stat-label">Products</span>
                </div>
                <div class="module-stat">
                  <span class="stat-value">{{ client.requestsOfChanges }}</span>
                  <span class="stat-label">Requests</span>
                </div>
                <div class="module-stat">
                  <span class="stat-value">{{ client.deployments }}</span>
                  <span class="stat-label">Deployements</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Dashboard Content - Conditional Display -->
    <div class="dashboard-content">
      <div v-if="!selectedClient" class="section d-flex justify-content-center align-items-center" style="height: 60vh">
        <img src="../../../../content/images/Dataanalysis.svg" width="600" height="500" />
      </div>

      <!-- Charts Section -->
      <div v-else class="charts-section">
        <div class="charts-header d-flex justify-content-between align-items-center mb-4">
          <h3>{{ selectedClient.name }} - Analytics Dashboard</h3>
          <button @click="closeCharts" class="btn btn-outline-secondary"><i class="bi bi-x-lg"></i> Close</button>
        </div>

        <div class="row">
          <!-- Left Chart - Product Deployments Distribution -->
          <div class="col-md-6">
            <div class="chart-container">
              <h4 class="chart-title">Product Deployments Distribution</h4>
              <div class="chart-wrapper">
                <canvas ref="productDeploymentsChart" width="400" height="400"></canvas>
              </div>
              <div v-if="productDeploymentsChartData.labels && productDeploymentsChartData.labels.length === 0" class="no-data-message">
                No product deployment data available
              </div>
            </div>
          </div>

          <!-- Right Chart - Request of Changes by Month and Level -->
          <div class="col-md-6">
            <div class="chart-container">
              <h4 class="chart-title">Request of Changes by Customization Level</h4>
              <div class="chart-wrapper">
                <canvas ref="requestChangesChart" width="400" height="400"></canvas>
              </div>
              <div v-if="!requestChangesChartData.datasets || requestChangesChartData.datasets.length === 0" class="no-data-message">
                No request of changes data available
              </div>

              <!-- Summary Stats -->
              <div class="request-stats mt-3">
                <div class="stats-grid">
                  <div class="stat-item">
                    <span class="stat-number">{{ totalRequests.basic }}</span>
                    <span class="stat-label">Basic Changes</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ totalRequests.intermediate }}</span>
                    <span class="stat-label">Intermediate Changes</span>
                  </div>
                  <div class="stat-item">
                    <span class="stat-number">{{ totalRequests.advanced }}</span>
                    <span class="stat-label">Advanced Changes</span>
                  </div>
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
/* Existing styles... */
.module-badge.default {
  background-color: #f0f0f0;
  color: #333;
}
.module-badge.finance {
  background-color: #e6f7ee;
  color: #0ca678;
}
.module-badge.insurance {
  background-color: #e0f7fa;
  color: #0288d1;
}
.module-badge.security {
  background-color: #fff9db;
  color: #f59f00;
}
.module-badge.analytics {
  background-color: #e7f5ff;
  color: #1c7ed6;
}
.module-badge.communication {
  background-color: #f3e5f5;
  color: #9c27b0;
}
.module-badge.health {
  background-color: #fce4ec;
  color: #e91e63;
}
.module-badge.logistics {
  background-color: #e8f5e8;
  color: #4caf50;
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

.dashboard-section {
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

.module-grid-horizontal {
  display: flex;
  gap: 15px;
  padding: 5px 0;
  min-width: fit-content;
}

.module-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  min-width: 280px;
  max-width: 280px;
  flex-shrink: 0;
  transition:
    transform 0.3s ease,
    box-shadow 0.3s ease;
  position: relative;
}

.module-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
}

.module-header {
  display: flex;
  align-items: center;
  margin-bottom: 15px;
}

.module-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  background-color: #0c2d57;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.module-icon i {
  font-size: 20px;
  color: white;
}

.module-title h4 {
  margin: 0 0 5px;
  font-size: 16px;
  font-weight: 600;
  color: #333;
}

.module-badge {
  display: inline-block;
  padding: 3px 8px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.module-stats {
  display: flex;
  justify-content: space-between;
}

.module-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
}

.stat-value {
  font-size: 18px;
  font-weight: 600;
  color: #0c2d57;
}

.stat-label {
  font-size: 12px;
  color: #777;
  margin-top: 2px;
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
}

/* Customization Legend */
.customization-legend {
  display: flex;
  justify-content: center;
  gap: 20px;
  margin-top: 10px;
}

.legend-item {
  display: flex;
  align-items: center;
  gap: 8px;
}

.legend-color {
  width: 16px;
  height: 16px;
  border-radius: 3px;
}

.legend-color.basic {
  background-color: rgba(255, 193, 7, 0.8);
}

.legend-color.intermediate {
  background-color: rgba(40, 167, 69, 0.8);
}

.legend-color.advanced {
  background-color: rgba(220, 53, 69, 0.8);
}

.legend-text {
  font-size: 12px;
  color: #666;
  font-weight: 500;
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
  .module-card {
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

  .customization-legend {
    gap: 10px;
  }

  .stats-grid {
    grid-template-columns: 1fr;
    gap: 10px;
  }
}

@media (max-width: 480px) {
  .module-card {
    min-width: 220px;
    max-width: 220px;
    padding: 12px;
  }

  .module-icon {
    width: 35px;
    height: 35px;
  }

  .module-icon i {
    font-size: 18px;
  }

  .module-title h4 {
    font-size: 14px;
  }

  .stat-value {
    font-size: 16px;
  }

  .chart-container {
    height: 350px;
    padding: 15px;
  }

  .chart-title {
    font-size: 14px;
  }

  .customization-legend {
    flex-direction: column;
    gap: 5px;
  }
}
</style>
