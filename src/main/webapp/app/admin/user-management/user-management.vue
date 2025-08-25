<template>
  <div v-if="user" class="card-body pt-lg-5 container mt-5">
    <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
      <div class="d-flex align-items-center">
        <h2 class="client-name mb-0">{{ user.firstName }}{{ ' ' }}{{ user.lastName }}</h2>
      </div>
      <span class="text-muted">
        <span v-if="user.activated" class="badge bg-success text-white">Activated</span>
        <span v-else class="badge bg-danger text-white">disabled</span>
      </span>
    </div>

    <!-- Informations principales -->
    <div class="row pt-3">
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
    <h6 class="section-title pt-5">User profiles</h6>
    <div class="row">
      <div class="col-md-6">
        <div class="info-group">
          <div class="info-value">
            <span v-for="authority in user.authorities" :key="authority" class="badge bg-info-subtle text-dark rounded-1 me-2 mb-2">
              {{ authority === 'ROLE_USER' ? 'DELIVERY MANAGER' : authority.replace('ROLE_', '') }}
            </span>
          </div>
        </div>
      </div>
    </div>

    <!-- Dates -->
    <h6 class="section-title pt-5">Time information</h6>
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

    <!-- Modal Footer with Buttons -->
    <div class="modal-footer">
      <button type="submit" @click.prevent="previousState()" class="button button-secondary" data-cy="entityDetailsBackButton">
        <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
      </button>
      <router-link :to="{ name: 'JhiUserEdit', params: { userId: user.login } }" custom v-slot="{ navigate }">
        <button @click="navigate" class="button button-primary">
          <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
        </button>
      </router-link>
    </div>
  </div>
  <div class="section"></div>
  <div class="section"></div>
</template>

<script lang="ts" src="./user-management-view.component.ts"></script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.875rem;
}

.button-secondary {
  background-color: #6c757d;
  color: #fff;
}

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

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
