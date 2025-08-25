<template>
  <div class="home row" v-if="!authenticated">
    <section id="hero" class="hero section">
      <div class="container" data-aos="fade-up" data-aos-delay="100">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="hero-content" data-aos="fade-up" data-aos-delay="200">
              <div class="company-badge mb-4">
                <img
                  src="../../../content/images/bgImage.png"
                  alt="Gear Icon"
                  style="width: 80px; height: 40px; margin-right: 8px; margin-top: 8px"
                />
                <span v-text="t$('home.di')"></span>
              </div>
              <h1 class="mb-4">
                <span v-text="t$('home.text1')"></span><br />
                <span v-text="t$('home.sd')"></span> <br />
                <span class="accent-text" v-text="t$('home.sp')"></span>
              </h1>
              <p class="mb-4 mb-md-5" v-text="t$('home.desc')"></p>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image" data-aos="zoom-out" data-aos-delay="300">
              <img src="../../../content/images/hero-img.png" alt="Hero Image" class="img-fluid" />
              <div class="customers-badge">
                <div class="customer-avatars">
                  <img src="../../../content/images/avatar-1.webp" alt="Customer 1" class="avatar" />
                  <img src="../../../content/images/avatar-2.webp" alt="Customer 2" class="avatar" />
                  <img src="../../../content/images/avatar-3.webp" alt="Customer 3" class="avatar" />
                  <img src="../../../content/images/avatar-4.webp" alt="Customer 4" class="avatar" />
                  <img src="../../../content/images/avatar-5.webp" alt="Customer 5" class="avatar" />
                  <span class="avatar more">12+</span>
                </div>
                <p class="mb-0 mt-2" v-text="t$('home.refTitle')"></p>
              </div>
            </div>
          </div>
        </div>
        <div class="row stats-row gy-4 mt-5" data-aos="fade-up" data-aos-delay="500">
          <div class="col-lg-4 col-md-6">
            <div class="stat-item text-center">
              <div class="stat-icon mb-2">
                <i class="bi bi-people-fill"></i>
              </div>
              <div class="stat-content">
                <h4 v-text="t$('home.equipeC')"></h4>
                <p class="mb-0" v-text="t$('home.equipeCdesc')"></p>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="stat-item text-center">
              <div class="stat-icon mb-2">
                <i class="bi bi-people-fill"></i>
              </div>
              <div class="stat-content">
                <h4 v-text="t$('home.equipeD')"></h4>
                <p class="mb-0" v-text="t$('home.equipeDdesc')"></p>
              </div>
            </div>
          </div>
          <div class="col-lg-4 col-md-6">
            <div class="stat-item text-center">
              <div class="stat-icon mb-2">
                <i class="bi bi-shield-lock-fill"></i>
              </div>
              <div class="stat-content">
                <h4 v-text="t$('home.equipeA')"></h4>
                <p class="mb-0" v-text="t$('home.equipeAdesc')"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <div class="section"></div>
  </div>

  <!-- Dashboard Section (Authenticated) -->
  <div class="home row" v-if="authenticated">
    <section id="hero" class="hero section">
      <div class="container" data-aos="fade-up" data-aos-delay="100">
        <div class="row align-items-center">
          <div class="col-lg-6">
            <div class="hero-content" data-aos="fade-up" data-aos-delay="200">
              <div class="company-badge mb-4">
                <img
                  src="../../../content/images/bgImage.png"
                  alt="Gear Icon"
                  style="width: 80px; height: 40px; margin-right: 8px; margin-top: 8px"
                />
                <span v-text="t$('home.di')"></span>
              </div>
              <h1 class="mb-4">
                <span>{{ t$('home.welcome') }}</span> <span class="accent-text">{{ user.firstName }}</span> <br />
                <span> {{ t$('home.toyour') }} </span>
                <span v-if="hasAnyAuthority('ROLE_ADMIN')">{{ t$('home.admin') }}</span>
                <span v-if="hasAnyAuthority('ROLE_ADMIN') && (hasAnyAuthority('ROLE_USER') || hasAnyAuthority('ROLE_COMMERCIAL'))">
                  &
                </span>
                <span v-if="hasAnyAuthority('ROLE_USER')">{{ t$('home.dm') }}</span>
                <span v-if="hasAnyAuthority('ROLE_USER') && hasAnyAuthority('ROLE_COMMERCIAL')"> & </span>
                <span v-if="hasAnyAuthority('ROLE_COMMERCIAL')">{{ t$('home.commercial') }}</span>
                <br />
                {{ t$('home.space') }}
              </h1>
              <span class="mb-4 mb-md-5" v-if="hasAnyAuthority('ROLE_ADMIN')"> {{ t$('home.equipeAdesc') }} </span><br />
              <span class="mb-4 mb-md-5" v-if="hasAnyAuthority('ROLE_USER')"> {{ t$('home.equipeDdesc') }} </span><br />
              <span class="mb-4 mb-md-5" v-if="hasAnyAuthority('ROLE_COMMERCIAL')">
                {{ t$('home.equipeCdesc') }}
              </span>
            </div>
          </div>
          <div class="col-lg-6">
            <div class="hero-image" data-aos="zoom-out" data-aos-delay="300">
              <img src="../../../content/images/hero-img.png" alt="Hero Image" class="img-fluid" />
              <div class="customers-badge">
                <div class="customer-avatars">
                  <img src="../../../content/images/avatar-1.webp" alt="Customer 1" class="avatar" />
                  <img src="../../../content/images/avatar-2.webp" alt="Customer 2" class="avatar" />
                  <img src="../../../content/images/avatar-3.webp" alt="Customer 3" class="avatar" />
                  <img src="../../../content/images/avatar-4.webp" alt="Customer 4" class="avatar" />
                  <img src="../../../content/images/avatar-5.webp" alt="Customer 5" class="avatar" />
                  <span class="avatar more">12+</span>
                </div>
                <p class="mb-0 mt-2" v-text="t$('home.refTitle')"></p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
    <section class="hero section"></section>
    <div class="section"></div>
  </div>
</template>

<script lang="ts" src="./home.component.ts"></script>

<style>
/* Dashboard Styles */
.dashboard-container {
  display: flex;
  min-height: 100vh;
  background-color: #f8f9fa;
}

/* Sidebar Styles */
.dashboard-sidebar {
  width: 250px;
  background-color: #fff;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
  display: flex;
  flex-direction: column;
  position: fixed;
  height: 100vh;
  z-index: 100;
}

.sidebar-header {
  padding: 20px;
  display: flex;
  align-items: center;
  border-bottom: 1px solid #eee;
}

.sidebar-logo {
  width: 30px;
  height: 30px;
  margin-right: 10px;
}

.sidebar-menu {
  flex: 1;
  padding: 20px 0;
}

.menu-item {
  padding: 12px 20px;
  display: flex;
  align-items: center;
  color: #555;
  cursor: pointer;
  transition: all 0.3s;
}

.menu-item:hover {
  background-color: #f5f5f5;
  color: #0c2d57;
}

.menu-item.active {
  background-color: #f0f4ff;
  color: #0c2d57;
  border-left: 3px solid #0c2d57;
}

.menu-item i {
  margin-right: 10px;
  font-size: 18px;
}

.sidebar-footer {
  padding: 15px 20px;
  border-top: 1px solid #eee;
}

.user-info {
  display: flex;
  align-items: center;
}

.user-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  margin-right: 10px;
}

.user-name {
  margin: 0;
  font-weight: 600;
  font-size: 14px;
}

.user-role {
  margin: 0;
  font-size: 12px;
  color: #777;
}

/* Dashboard Content Styles */
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

.header-actions {
  display: flex;
  align-items: center;
}

.search-container {
  position: relative;
  margin-right: 15px;
}

.search-input {
  padding: 8px 15px 8px 35px;
  border: 1px solid #ddd;
  border-radius: 4px;
  width: 250px;
}

.search-container i {
  position: absolute;
  left: 10px;
  top: 50%;
  transform: translateY(-50%);
  color: #777;
}

.notification-icon {
  position: relative;
  cursor: pointer;
}

.notification-badge {
  position: absolute;
  top: -5px;
  right: -5px;
  background-color: #ff4757;
  color: white;
  border-radius: 50%;
  width: 18px;
  height: 18px;
  font-size: 10px;
  display: flex;
  align-items: center;
  justify-content: center;
}

/* Stats Cards Styles */
.stats-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 20px;
  margin-bottom: 20px;
}

.stat-card {
  background-color: #fff;
  border-radius: 8px;
  padding: 20px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.05);
  display: flex;
  align-items: center;
}

.stat-icon {
  width: 50px;
  height: 50px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 15px;
}

.stat-icon i {
  font-size: 24px;
  color: white;
}

.product-icon {
  background-color: #0c2d57;
}

.client-icon {
  background-color: #3bc9db;
}

.deployment-icon {
  background-color: #f03e3e;
}

.module-icon {
  background-color: #fab005;
}

.stat-details h3 {
  margin: 0;
  font-size: 24px;
  font-weight: 700;
}

.stat-details p {
  margin: 5px 0 0;
  color: #777;
  font-size: 14px;
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

.view-all-button {
  padding: 6px 12px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  font-size: 14px;
  cursor: pointer;
}

.section-actions {
  display: flex;
  align-items: center;
  gap: 10px;
}

.filter-button {
  display: flex;
  align-items: center;
  padding: 8px 15px;
  background-color: #f8f9fa;
  border: 1px solid #ddd;
  border-radius: 4px;
  cursor: pointer;
}

.filter-button i {
  margin-right: 5px;
}

/* Product Cards Styles */
.product-cards {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.product-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
  display: flex;
  align-items: center;
}

.product-card .product-icon {
  width: 40px;
  height: 40px;
  border-radius: 8px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-right: 12px;
}

.product-card .product-icon i {
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

.product-status.active {
  background-color: #e6f7ee;
  color: #0ca678;
}

/* Client List Styles */
.client-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.client-item {
  display: flex;
  align-items: center;
  padding: 10px;
  border-radius: 8px;
  background-color: #f8f9fa;
}

.client-rank {
  width: 24px;
  height: 24px;
  background-color: #0c2d57;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 14px;
  margin-right: 15px;
}

.client-avatar {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  overflow: hidden;
  margin-right: 15px;
}

.client-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.client-info {
  flex: 1;
}

.client-info h4 {
  margin: 0 0 5px;
  font-size: 16px;
}

.client-info p {
  margin: 0;
  font-size: 12px;
  color: #777;
}

.client-stats {
  display: flex;
  gap: 15px;
}

.client-stats .stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.stat-value {
  font-size: 16px;
  font-weight: 600;
}

.stat-label {
  font-size: 12px;
  color: #777;
}

/* Table Styles */
.table-container {
  overflow-x: auto;
}

.data-table {
  width: 100%;
  border-collapse: collapse;
}

.data-table th,
.data-table td {
  padding: 12px 15px;
  text-align: left;
  border-bottom: 1px solid #eee;
}

.data-table th {
  background-color: #f8f9fa;
  font-weight: 600;
}

.status-badge {
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  font-weight: 500;
}

.completed {
  background-color: #e6f7ee;
  color: #0ca678;
}

.in-progress {
  background-color: #e7f5ff;
  color: #1c7ed6;
}

.pending {
  background-color: #fff9db;
  color: #f59f00;
}

.action-button {
  background: none;
  border: none;
  color: #777;
  cursor: pointer;
  padding: 5px;
  margin-right: 5px;
}

.action-button:hover {
  color: #0c2d57;
}

.table-footer {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-top: 15px;
}

.pagination {
  display: flex;
  align-items: center;
}

.pagination-button {
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 1px solid #ddd;
  background-color: #fff;
  margin-right: 5px;
  cursor: pointer;
}

.pagination-button.active {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.items-per-page {
  display: flex;
  align-items: center;
}

.items-per-page span {
  margin-right: 10px;
  font-size: 14px;
  color: #777;
}

.items-per-page select {
  padding: 5px 10px;
  border: 1px solid #ddd;
  border-radius: 4px;
}

/* Module Grid Styles */
.module-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 15px;
}

.module-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 15px;
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
}

.module-badge {
  display: inline-block;
  padding: 3px 8px;
  background-color: #e7f5ff;
  color: #1c7ed6;
  border-radius: 4px;
  font-size: 12px;
}

.module-stats {
  display: flex;
  justify-content: space-between;
}

.module-stat {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Tabs Styles */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-button {
  padding: 8px 20px;
  border: none;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.tab-button.active {
  background-color: #0c2d57;
  color: white;
}

.tab-button:hover {
  background-color: #e7f5ff;
}

/* Charts Styles */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.chart-card h4 {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 600;
}

/* Table Controls Styles */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filter-container {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

/* Responsive Adjustments */
@media (max-width: 1200px) {
  .product-cards,
  .module-grid {
    grid-template-columns: repeat(2, 1fr);
  }
}

@media (max-width: 992px) {
  .stats-cards {
    grid-template-columns: repeat(2, 1fr);
  }
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .dashboard-sidebar {
    width: 70px;
  }

  .sidebar-header h3,
  .menu-item span,
  .user-details {
    display: none;
  }

  .dashboard-content {
    margin-left: 70px;
  }

  .stats-cards {
    grid-template-columns: 1fr;
  }

  .product-cards,
  .module-grid {
    grid-template-columns: 1fr;
  }

  .client-stats {
    display: none;
  }

  .table-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .filter-container {
    flex-direction: column;
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }
}
/* Tabs Styles */
.tabs {
  display: flex;
  gap: 10px;
  margin-bottom: 15px;
}

.tab-button {
  padding: 8px 20px;
  border: none;
  background-color: #f8f9fa;
  border-radius: 4px;
  cursor: pointer;
  font-weight: 500;
  transition: all 0.3s;
}

.tab-button.active {
  background-color: #0c2d57;
  color: white;
}

.tab-button:hover {
  background-color: #e7f5ff;
}

/* Charts Styles */
.charts-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 20px;
}

.chart-card {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 20px;
}

.chart-card h4 {
  margin: 0 0 15px;
  font-size: 16px;
  font-weight: 600;
}

/* Table Controls Styles */
.table-controls {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 15px;
}

.filter-container {
  display: flex;
  gap: 10px;
}

.filter-select {
  padding: 8px 15px;
  border: 1px solid #ddd;
  border-radius: 4px;
  background-color: #fff;
}

/* Responsive Adjustments */
@media (max-width: 992px) {
  .charts-grid {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 768px) {
  .table-controls {
    flex-direction: column;
    align-items: flex-start;
    gap: 10px;
  }

  .filter-container {
    flex-direction: column;
    width: 100%;
  }

  .filter-select {
    width: 100%;
  }
}
</style>
