<template>
  <div v-if="user" class="card-body">
    <!-- Informations principales -->
    <h6 class="section-title">General information</h6>
    <span v-if="user.activated" class="badge bg-success text-white">Activated</span>
    <span v-else class="badge bg-danger text-white">disabled</span>
    <div class="row">
      <div class="col-md-6">
        <div class="info-group">
          <label class="info-label">Login</label>
          <div class="info-value">{{ user.login }}</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="info-group">
          <label class="info-label">Email</label>
          <div class="info-value">{{ user.email }}</div>
        </div>
      </div>
    </div>

    <!-- Profils -->
    <h6 class="section-title pt-3">User profiles</h6>
    <div class="info-group">
      <div class="info-value">
        <span v-for="authority in user.authorities" :key="authority" class="badge bg-info-subtle text-dark rounded-1 me-2 mb-2">
          {{ authority === 'ROLE_USER' ? 'MANAGER' : authority.replace('ROLE_', '') }}
        </span>
      </div>
    </div>

    <!-- Dates -->
    <h6 class="section-title pt-3">Time information</h6>
    <div class="row">
      <div class="col-md-6">
        <div class="info-group">
          <label class="info-label">Date of creation</label>
          <div class="info-value">{{ formatDate(user.createdDate) }}</div>
        </div>
      </div>
      <div class="col-md-6">
        <div class="info-group">
          <label class="info-label">Created By</label>
          <div class="info-value">{{ user.lastModifiedBy }}</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./user-management-view.component.ts"></script>

<style scoped>
.user-details.card {
  border: 1px solid rgba(0, 0, 0, 0.125);
  border-radius: 0.375rem;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);
}

.card-header {
  background-color: #f8f9fa;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid rgba(0, 0, 0, 0.125);
}

.card-body {
  padding: 1.25rem;
}

.card-footer {
  background-color: #f8f9fa;
  padding: 1rem 1.25rem;
  border-top: 1px solid rgba(0, 0, 0, 0.125);
}

.section {
  margin-bottom: 1.5rem;
}

.section-title {
  color: #495057;
  font-weight: 600;
  margin-bottom: 1rem;
  padding-bottom: 0.5rem;
  border-bottom: 1px solid #e9ecef;
}

.info-group {
  margin-bottom: 0.75rem;
}

.info-label {
  font-weight: 500;
  font-size: 0.85rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
  display: block;
}

.info-value {
  font-size: 0.95rem;
  color: #212529;
}

.badge {
  display: inline-block;
  padding: 0.35em 0.5em;
  font-size: 75%;
  font-weight: 600;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.bg-success {
  background-color: #198754;
}

.bg-danger {
  background-color: #dc3545;
}

.bg-info-subtle {
  background-color: #cff4fc;
}

.text-white {
  color: white;
}

.text-dark {
  color: #212529;
}

.rounded-1 {
  border-radius: 0.25rem;
}

.me-2 {
  margin-right: 0.5rem;
}

.mb-2 {
  margin-bottom: 0.5rem;
}

.mb-0 {
  margin-bottom: 0;
}

.mb-4 {
  margin-bottom: 1.5rem;
}

.mt-3 {
  margin-top: 1rem;
}

.row {
  display: flex;
  flex-wrap: wrap;
  margin-right: -0.75rem;
  margin-left: -0.75rem;
}

.col-md-6 {
  flex: 0 0 50%;
  max-width: 50%;
  padding-right: 0.75rem;
  padding-left: 0.75rem;
}

@media (max-width: 767.98px) {
  .col-md-6 {
    flex: 0 0 100%;
    max-width: 100%;
    margin-bottom: 0.5rem;
  }
}
</style>
