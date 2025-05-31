<template>
  <div class="dashboard-content pt-lg-5">
    <div class="dashboard-header"></div>
    <!-- Products Overview Section -->
    <div class="dashboard-section">
      <div class="section-header">
        <h2>Products Overview</h2>
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
              <div class="product-icon">
                <i :class="product.icon"></i>
              </div>
              <div class="product-info">
                <h4>{{ product.name }}</h4>
                <p>{{ product.versions }} versions • {{ product.modules }} modules</p>
                <div class="product-status" :class="product.badgeClass">Deploy {{ product.deploiements }} times</div>
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
  </div>
</template>

<script lang="ts" src="./dashProducts.component.ts"></script>

<style scoped>
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

/* Product Cards Styles */
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
}

.product-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.1);
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

.product-status.payment {
  background-color: #e6f7ee;
  color: #0ca678;
}

.product-status.portal {
  background-color: #e0f7fa;
  color: #0288d1;
}

.product-status.booking {
  background-color: #fff9db;
  color: #f59f00;
}

.product-status.analytics {
  background-color: #e7f5ff;
  color: #1c7ed6;
}

.product-status.mobile {
  background-color: #f3e5f5;
  color: #9c27b0;
}

.product-status.security {
  background-color: #fce4ec;
  color: #e91e63;
}

.product-status.inventory {
  background-color: #e8f5e8;
  color: #4caf50;
}

/* Responsive Design */
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
}
</style>
