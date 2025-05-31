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
  </div>
  <div class="section"></div>
  <div class="section"></div>
  <div class="section"></div>
  <div class="section"></div>
</template>

<script lang="ts" src="./dashClients.component.ts"></script>

<style scoped>
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
/* Dashboard Styles */
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

/* Dashboard Section Styles */
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

/* Scroll Controls */
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

/* Horizontal Scroll Container */
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

/* Module Grid Horizontal */
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

.module-badge.finance {
  background-color: #e6f7ee;
  color: #0ca678;
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

.module-badge.storage {
  background-color: #fce4ec;
  color: #e91e63;
}

.module-badge.integration {
  background-color: #e8f5e8;
  color: #4caf50;
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
}
</style>
