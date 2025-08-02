<template>
  <div class="product-deployment-container section pt-5">
    <!-- Navigation Bar -->
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <button
          @click="showAddRow = true"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn button-primary btn-sm mr-3 rounded-1"
          :disabled="showAddRow"
          v-if="hasAnyAuthority('ROLE_USER')"
        >
          <font-awesome-icon icon="plus"></font-awesome-icon>
          <span v-text="t$('global.new')"></span>
        </button>
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="ProductDeploymentHeading">
          <span v-text="t$('sdiFrontendApp.productDeployement.home.title')" id="product-deployment-heading"></span>
          <font-awesome-icon icon="cog" class="text-secondary ml-2" style="font-size: 0.8em"></font-awesome-icon>
        </h5>
      </div>

      <!-- Search Bar -->
      <div class="search-container mr-3">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Search..." v-model="searchTerm" @input="handleSearch" />
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Filters and Actions -->
      <div class="d-flex align-items-center">
        <!-- Filters -->
        <div class="filter-item mr-2">
          <span class="filter-label">Customer</span>
          <select v-model="selectedClientFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Customers</option>
            <option v-for="client in clients" :key="client.id" :value="client">
              {{ client.name }}
            </option>
          </select>
        </div>

        <div class="filter-item mr-1">
          <span class="filter-label">Product</span>
          <select v-model="selectedProductFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Products</option>
            <option v-for="product in products" :key="product.id" :value="product">
              {{ product.name }}
            </option>
          </select>
        </div>

        <button class="btn-reset mr-3" @click="resetFilters">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path
              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
          Reset
        </button>

        <!-- Pagination -->
        <div class="pagination-info mr-3 ml-4">
          <span class="text-muted small">{{ paginationInfo }}</span>
        </div>
        <div class="pagination-arrows d-flex">
          <button class="btn btn-light btn-sm mr-1" :disabled="isPrevDisabled" @click="goToPrevPage">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-chevron-left"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
            </svg>
          </button>
          <button class="btn btn-light btn-sm" :disabled="isNextDisabled" @click="goToNextPage">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-chevron-right"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Data table -->
    <div class="card" v-if="productDeployments && viewMode === 'list'">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="productDeployments">
          <thead class="thead-light">
          <tr>
            <th scope="col"><span v-text="t$('sdiFrontendApp.productDeployement.refContract')"></span></th>
            <th scope="col"><span v-text="t$('sdiFrontendApp.productDeployement.client')"></span></th>
            <th scope="col"><span>Produit</span></th>
            <th scope="col" width="220" class="text-center" v-if="hasAnyAuthority('ROLE_USER')">Actions</th>
          </tr>
          </thead>
          <tbody>
          <tr
            v-for="productDeployment in paginatedProductDeployments"
            :key="productDeployment.id"
            data-cy="entityTable"
            class="align-middle"
            :class="{ 'selected-row': selectedProductDeployment && selectedProductDeployment.id === productDeployment.id }"
            @click="toggleProductDeploymentSelection(productDeployment)"
            style="cursor: pointer"
          >
            <td>
              <template v-if="productDeployment.isEditing">
                <input v-model="productDeployment.refContract" type="text" class="form-control-borderless" @click.stop />
              </template>
              <template v-else>
                {{ productDeployment.refContract }}
              </template>
            </td>
            <td>
              <template v-if="productDeployment.isEditing">
                <select v-model="productDeployment.client" class="form-control-borderless" @click.stop>
                  <option v-for="client in clients" :key="client.id" :value="client">
                    {{ client.name }}
                  </option>
                </select>
              </template>
              <template v-else>
                {{ productDeployment.client ? productDeployment.client.name : '' }}
              </template>
            </td>
            <td>
              <template v-if="productDeployment.isEditing">
                <select v-model="productDeployment.product" class="form-control-borderless" @click.stop>
                  <option v-for="product in products" :key="product.id" :value="product">
                    {{ product.name }}
                  </option>
                </select>
              </template>
              <template v-else>
                {{ productDeployment.product ? productDeployment.product.name : productDeployment.productName }}
              </template>
            </td>
            <td class="text-center" @click.stop v-if="hasAnyAuthority('ROLE_USER')">
              <div class="btn-group">
                <template v-if="productDeployment.isEditing">
                  <div class="icon-container save-container" @click="saveProductDeployment(productDeployment)" title="Enregistrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                      <path
                        d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div class="icon-container cancel-container" @click="cancelEdit(productDeployment)" title="Annuler">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-cancel">
                      <path
                        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </template>
                <template v-else>
                  <div class="action-icons">
                    <div
                      class="icon-container edit-container"
                      @click="editProductDeployment(productDeployment)"
                      title="Modifier"
                      v-if="hasAnyAuthority('ROLE_USER')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-pencil-fill"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"
                        />
                      </svg>
                    </div>
                    <div class="icon-container delete-container" @click="prepareRemove(productDeployment)" title="Supprimer">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="26"
                        height="26"
                        fill="currentColor"
                        class="bi bi-x"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div class="icon-container settings-container" @click="openCertifications(productDeployment)" title="Certification">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="icon"
                      >
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                    </div>
                  </div>
                </template>
              </div>
            </td>
          </tr>

          <tr v-if="showAddRow" class="add-row">
            <td>
              <input
                type="text"
                class="form-control-borderless"
                v-model="newProductDeployment.refContract"
                placeholder="Référence contrat"
              />
            </td>
            <td>
              <select v-model="newProductDeployment.client" class="form-control-borderless">
                <option value="">Select a customer</option>
                <option v-for="client in clients" :key="client.id" :value="client">
                  {{ client.name }}
                </option>
              </select>
            </td>
            <td>
              <select v-model="newProductDeployment.product" class="form-control-borderless">
                <option value="">Select a product</option>
                <option v-for="product in products" :key="product.id" :value="product">
                  {{ product.name }}
                </option>
              </select>
            </td>
            <td class="text-center">
              <div class="action-icons">
                <div class="icon-container save-container" @click="saveNewProductDeployment" title="Enregistrer">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                    <path
                      d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
                <div class="icon-container cancel-container" @click="cancelNewProductDeployment" title="Annuler">
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-cancel">
                    <path
                      d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                      fill="currentColor"
                    />
                  </svg>
                </div>
              </div>
            </td>
          </tr>
          <tr v-if="paginatedProductDeployments.length === 0 && !showAddRow">
            <td colspan="4" class="empty-message">No deployement available</td>
          </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Product certifications Modal -->
    <div class="modal-backdrop" v-if="showCertificationsModal" @click="closeCertificationsModal"></div>
    <div class="modal-container" v-if="showCertificationsModal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Client Certifications</h5>
          <button type="button" class="close-button" @click="closeCertificationsModal" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <!-- certification Section -->
          <div class="card">
            <div class="card-header">
              <div class="card-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Available certification</span>
              </div>
              <button
                class="button"
                :class="{ 'button-primary': !showCertificationSelector, 'button-secondary': showCertificationSelector }"
                @click="showCertificationSelector = !showCertificationSelector"
                v-if="hasAnyAuthority('ROLE_USER')"
              >
                {{ showCertificationSelector ? 'Close' : 'Add' }}
              </button>
            </div>

            <div class="card-body">
              <div v-if="showCertificationSelector" class="selector-container">
                <div class="select-wrapper">
                  <select class="select" v-model="selectedCertificationId">
                    <option value="">Select a certifications</option>
                    <option v-for="cert in certificationsOptionsVersions" :key="cert.id" :value="cert.id">
                      {{ cert.certification.name }} {{ '-' }} {{ cert.version }}
                    </option>
                  </select>
                </div>
                <button class="button button-success" @click="addCertificationToProduct" :disabled="!selectedCertificationId">Add</button>
              </div>
              <div style="max-height: 400px; overflow-y: auto">
                <table class="table table-hover" style="line-height: 1.2">
                  <thead>
                  <tr>
                    <th scope="col" class="pl-5">Name</th>
                    <th>Version</th>
                    <th scope="col" class="pl-2" v-if="hasAnyAuthority('ROLE_USER')">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  <!-- Liste des certifications -->
                  <tr v-for="(cert, index) in productDeploymentCertifications" :key="index">
                    <td class="pl-5">{{ getCertificationCached(cert.id).certification.name }}</td>
                    <td>{{ cert.version }}</td>
                    <td class="pl-2" v-if="hasAnyAuthority('ROLE_USER')">
                      <button class="button-icon" @click="removeCertificationFromProduct(index)" aria-label="Supprimer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="icon"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </td>
                  </tr>
                  <tr v-if="productDeploymentCertifications.length === 0">
                    <td colspan="3" class="empty-message">No selected certification</td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="button button-secondary" @click="closeCertificationsModal" v-if="hasAnyAuthority('ROLE_USER')">
            Cancel
          </button>
          <button type="button" class="button button-primary" @click="saveCertificationsModal" v-if="hasAnyAuthority('ROLE_USER')">
            Save
          </button>
        </div>
      </div>
    </div>

    <!-- Detailed View Section (appears when a product deployment is selected) -->
    <div v-if="selectedProductDeployment" class="mt-4 product-deployment-detail-view">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <!-- Breadcrumb Navigation -->
            <div class="breadcrumb-navigation">
              <div class="d-flex align-items-center">
                <span class="breadcrumb-item clickable" @click="returnToProductDeploymentList"> Product Deployments </span>
                <span class="mx-2 text-muted">/</span>
                <span class="breadcrumb-item active">
                  {{ selectedProductDeployment.product?.name }} - {{ selectedProductDeployment.client?.name }}
                </span>
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-dark rounded-1" @click="returnToProductDeploymentList">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
              <path
                fill-rule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Hide
          </button>
        </div>
        <div class="card-body">
          <!-- Tabs Navigation -->
          <div class="product-tabs-container">
            <div class="tabs-header position-relative">
              <!-- Active Indicator -->
              <div
                class="absolute-tab-highlight active-indicator"
                :style="{ left: activeTab === 'deployements' ? '0px' : '120px', width: '120px' }"
              ></div>

              <!-- Tabs -->
              <div class="tabs-list">
                <div class="tab-item" :class="{ active: activeTab === 'deployements' }" @click="activeTab = 'deployements'">
                  Deployements
                </div>
                <div class="tab-item" :class="{ active: activeTab === 'configuration' }" @click="activeTab = 'configuration'">
                  Configuration
                </div>
              </div>
            </div>

            <div class="tab-content mt-4">
              <!-- Deployements Tab -->
              <div class="deployements-tab" v-show="activeTab === 'deployements'">
                <div class="d-flex justify-content-between mb-3">
                  <h6 class="mb-0">Details of deployments</h6>
                  <button
                    class="btn btn-sm btn-primary rounded-1"
                    @click="showAddDetailRow = true"
                    :disabled="showAddDetailRow"
                    v-if="hasAnyAuthority('ROLE_USER')"
                  >
                    <font-awesome-icon icon="plus"></font-awesome-icon>
                    <span> add New Deployement</span>
                  </button>
                </div>
                <table class="table table-hover">
                  <thead class="thead-light">
                  <tr>
                    <!--<th scope="col" width="30">
                      <span class="text-muted small" style="font-size: 0.7rem;">Select</span>
                    </th>-->
                    <th scope="col">Deployement</th>
                    <th scope="col">Start date</th>
                    <th scope="col">End date</th>
                    <th scope="col">Deployement Type</th>
                    <th scope="col">Product version</th>
                    <th scope="col" width="260" class="text-center">Actions</th>
                  </tr>
                  </thead>
                  <tbody>
                  <!-- Existing detail rows -->
                  <tr
                    v-for="detail in paginatedProductDeployementDetails"
                    :key="detail.id"
                    class="align-middle"
                    :class="{ 'detail-selected-for-config': selectedDetailForConfiguration && selectedDetailForConfiguration.id === detail.id }"
                    @click="selectDetailForConfiguration(detail)"
                    style="cursor: pointer"
                  >
                    <!--<td @click.stop>
                      <input
                        type="checkbox"
                        :checked="selectedDetailForConfiguration && selectedDetailForConfiguration.id === detail.id"
                        @change="selectDetailForConfiguration(detail)"
                        title="Select for configuration view"
                        class="detail-config-checkbox"
                        readonly
                      />
                    </td>-->
                    <td class="text-truncate" style="max-width: 250px" :title="detail.notes">
                      <template v-if="detail.isEditing">
                        <input v-model="detail.notes" type="text" class="form-control" @click.stop />
                      </template>
                      <template v-else>
                        {{ detail.notes }}
                      </template>
                    </td>
                    <td>
                      <template v-if="detail.isEditing">
                        <input v-model="detail.startDeployementDate" type="date" class="form-control" @click.stop />
                      </template>
                      <template v-else>
                        {{ formatDate(detail.startDeployementDate) }}
                      </template>
                    </td>
                    <td>
                      <template v-if="detail.isEditing">
                        <input v-model="detail.endDeployementDate" type="date" class="form-control" @click.stop />
                      </template>
                      <template v-else>
                        {{ formatDate(detail.endDeployementDate) }}
                      </template>
                    </td>
                    <td>
                      <template v-if="detail.isEditing">
                        <select v-model="detail.deployementType" class="form-control" @click.stop>
                          <option v-for="type in deployementTypes" :key="type.id" :value="type">
                            {{ type.type }}
                          </option>
                        </select>
                      </template>
                      <template v-else>
                        <span class="badge badge-dark">{{ detail.deployementType ? detail.deployementType.type : '' }}</span>
                      </template>
                    </td>
                    <td>
                      <template v-if="detail.isEditing">
                        <select v-model="detail.productVersion" class="form-control" @click.stop>
                          <option
                            v-for="version in getFilteredProductVersions(selectedProductDeployment.productId)"
                            :key="version.id"
                            :value="version"
                          >
                            {{ version.version }}
                          </option>
                        </select>
                      </template>
                      <template v-else>
                        <span class="badge badge-secondary">{{ detail.productVersion ? detail.productVersion.version : '' }}</span>
                      </template>
                    </td>
                    <td class="text-center" @click.stop>
                      <div class="action-icons">
                        <template v-if="detail.isEditing">
                          <button class="btn btn-success btn-sm mr-2" @click="saveProductDeployementDetail(detail)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                              <path
                                d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                          <button class="btn btn-outline-secondary btn-sm" @click="cancelEditDetail(detail)">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-cancel">
                              <path
                                d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                                fill="currentColor"
                              />
                            </svg>
                          </button>
                        </template>
                        <template v-else>
                          <div
                            class="icon-container edit-container"
                            v-if="hasAnyAuthority('ROLE_USER')"
                            @click="editProductDeployementDetail(detail)"
                            title="Modifier"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-pencil-fill"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"
                              />
                            </svg>
                          </div>
                          <div
                            class="icon-container delete-container"
                            v-if="hasAnyAuthority('ROLE_USER')"
                            @click="prepareRemoveDetail(detail)"
                            title="Supprimer"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="26"
                              height="26"
                              fill="currentColor"
                              class="bi bi-x"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                          <!-- Configuration button for modules -->
                          <div
                            class="icon-container settings-container"
                            v-if="hasAnyAuthority('ROLE_USER')"
                            @click="openModuleSettings(detail)"
                            title="Configuration des modules"
                          >
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-gear"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M8 4.754a3.246 3.246 0 1 0 0 6.492a3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
                              />
                              <path
                                d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291A1.873 1.873 0 0 0 1.945 8.93l-.319-.094c-.835-.246-.835-1.428 0-1.674l.319-.094A1.873 1.873 0 0 0 3.06 4.377l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
                              />
                            </svg>
                          </div>
                          <!-- Eye icon for viewing details -->
                          <div class="icon-container view-container" @click="viewDetailInfo(detail)" title="Voir les détails">
                            <font-awesome-icon icon="eye"></font-awesome-icon>
                          </div>
                          <!-- NOUVEAU: Icône de navigation vers la vue détaillée -->
                          <router-link
                            :to="{ name: 'ProductDeployementDetailView', params: { productDeployementDetailId: detail.id } }"
                            custom
                            v-slot="{ navigate }"
                          >
                            <div @click="navigate" class="icon-container navigate-container" title="Voir la page détaillée">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-arrow-right"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  fill-rule="evenodd"
                                  d="M1 8a.5.5 0 0 1 .5-.5h11.793l-3.147-3.146a.5.5 0 0 1 .708-.708l4 4a.5.5 0 0 1 0 .708l-4 4a.5.5 0 0 1-.708-.708L13.293 8.5H1.5A.5.5 0 0 1 1 8z"
                                />
                              </svg>
                            </div>
                          </router-link>
                        </template>
                      </div>
                    </td>
                  </tr>

                  <!-- Add new detail row -->
                  <tr v-if="showAddDetailRow" class="add-row">
                    <!--<td>
                      <input type="checkbox" disabled style="opacity: 0.3" />
                    </td>-->
                    <td>
                      <input type="text" class="form-control" v-model="newProductDeployementDetail.notes" placeholder="Deployement" />
                    </td>
                    <td>
                      <input type="date" class="form-control" v-model="newProductDeployementDetail.startDeployementDate" />
                    </td>
                    <td>
                      <input type="date" class="form-control" v-model="newProductDeployementDetail.endDeployementDate" />
                    </td>
                    <td>
                      <select v-model="newProductDeployementDetail.deployementType" class="form-control">
                        <option value="">Sélectionner un type</option>
                        <option v-for="type in deployementTypes" :key="type.id" :value="type">
                          {{ type.type }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <select v-model="newProductDeployementDetail.productVersion" class="form-control">
                        <option value="">Sélectionner une version</option>
                        <option
                          v-for="version in getFilteredProductVersions(selectedProductDeployment.productId)"
                          :key="version.id"
                          :value="version"
                        >
                          {{ version.version }}
                        </option>
                      </select>
                    </td>
                    <td class="text-center">
                      <div class="action-buttons">
                        <button class="btn btn-success btn-sm mr-2" @click="saveNewProductDeployementDetail">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                            <path
                              d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                              fill="currentColor"
                            />
                          </svg>
                          Enregistrer
                        </button>
                        <button class="btn btn-outline-secondary btn-sm" @click="cancelNewProductDeployementDetail">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-x"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                            />
                          </svg>
                          Annuler
                        </button>
                      </div>
                    </td>
                  </tr>

                  <!-- Message if no data -->
                  <tr v-if="productDeployementDetails.length === 0 && !showAddDetailRow">
                    <td colspan="7" class="empty-message">No details available</td>
                  </tr>
                  </tbody>
                </table>
              </div>

              <!-- Configuration Tab -->
              <div class="configuration-tab" v-show="activeTab === 'configuration'">
                <div class="d-flex justify-content-between mb-3">
                  <h6 class="mb-0">
                    Infrastructure configuration
                    <span v-if="selectedDetailForConfiguration" class="text-muted ml-2">
                      (for {{ selectedDetailForConfiguration.productVersion?.version || 'N/A' }})
                    </span>
                    <span v-else class="text-muted ml-2">
                      (click on a deployment detail row to see its specific configuration)
                    </span>
                  </h6>
                </div>
                <table class="table table-hover">
                  <thead class="thead-light">
                  <tr>
                    <th scope="col">Component</th>
                    <th scope="col">Version</th>
                  </tr>
                  </thead>
                  <tbody>
                  <tr
                    v-for="infraComponent in getInfraComponentVersionsForSelectedProduct()"
                    :key="infraComponent.id"
                    class="align-middle"
                  >
                    <td>
                      <strong>{{ infraComponent.infraComponent ? infraComponent.infraComponent.name : 'N/A' }}</strong>
                    </td>
                    <td>
                      <span class="badge badge-dark">{{ infraComponent.version }}</span>
                    </td>
                  </tr>

                  <!-- Message if no infrastructure data -->
                  <tr v-if="getInfraComponentVersionsForSelectedProduct().length === 0">
                    <td colspan="2" class="text-center py-4">
                      <div class="empty-state">
                        <span v-if="selectedDetailForConfiguration">
                          No configured infrastructure for this product version
                        </span>
                        <span v-else>
                          <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-cursor-fill text-muted mb-2" viewBox="0 0 16 16">
                            <path d="M14.082 2.182a.5.5 0 0 1 .103.557L8.528 15.467a.5.5 0 0 1-.917-.007L5.57 10.694.803 8.652a.5.5 0 0 1-.006-.916l12.728-5.657a.5.5 5 0 0 1 .557.103z"/>
                          </svg>
                          <h5 class="text-muted">No deployment selected</h5>
                          <p class="text-muted">Click on a deployment detail row to view its infrastructure configuration</p>
                        </span>
                      </div>
                    </td>
                  </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Module Settings Modal - CORRIGÉ -->
    <div class="modal-backdrop" v-if="showModuleSettingsModal" @click="closeModuleSettingsModal"></div>
    <div class="modal-container elegant-modal" v-if="showModuleSettingsModal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Configuration of authorized modules</h5>
          <button type="button" class="close-button" @click="closeModuleSettingsModal" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Tabs Header -->
        <div class="tabs-header position-relative">
          <div class="tabs-list pt-2">
            <div class="tab-item active">
              <div class="card-title">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="20"
                  height="20"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="icon"
                >
                  <rect x="3" y="3" width="7" height="7"></rect>
                  <rect x="14" y="3" width="7" height="7"></rect>
                  <rect x="14" y="14" width="7" height="7"></rect>
                  <rect x="3" y="14" width="7" height="7"></rect>
                </svg>
                <span>Modules Version</span>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-body">
          <div v-if="selectedDetail">
            <h6 class="mb-3">Detail : {{ selectedDetail.productVersion ? selectedDetail.productVersion.version : '' }}</h6>

            <!-- Modules Section -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span>Authorized modules</span>
                </div>
                <button class="button button-primary" @click="showModuleSelector = !showModuleSelector">
                  {{ showModuleSelector ? 'Close' : 'Add' }}
                </button>
              </div>

              <div class="card-body">
                <div v-if="showModuleSelector" class="selector-container">
                  <div class="select-wrapper">
                    <select v-model="selectedModuleVersionId" class="select">
                      <option value="">Select a version module</option>
                      <option
                        v-for="moduleVersion in availableModuleVersions"
                        :key="moduleVersion.id"
                        :value="moduleVersion.id"
                      >
                        {{ getModuleName(moduleVersion) }} - {{ moduleVersion.version }}
                      </option>
                    </select>
                  </div>
                  <button class="button button-success" @click="addModuleToDetail" :disabled="!selectedModuleVersionId">Add</button>
                </div>

                <ul class="component-list scroll-container">
                  <li v-for="(moduleVersion, index) in selectedAllowedModuleVersions" :key="index" class="component-item">
                    <div class="component-info">
                      <span class="component-name">
                        {{ moduleVersion.module?.name || 'Module inconnu' }}
                        <span class="component-version">{{ moduleVersion.version }}</span>
                      </span>
                    </div>
                    <div class="action-buttons">
                      <button class="button-icon" @click="removeModuleFromDetail(index)" aria-label="Supprimer">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="18"
                          height="18"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          stroke-width="2"
                          stroke-linecap="round"
                          stroke-linejoin="round"
                          class="icon"
                        >
                          <line x1="18" y1="6" x2="6" y2="18"></line>
                          <line x1="6" y1="6" x2="18" y2="18"></line>
                        </svg>
                      </button>
                    </div>
                  </li>
                  <li v-if="selectedAllowedModuleVersions.length === 0" class="empty-message">No authorized module added</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="button button-secondary" @click="closeModuleSettingsModal">Cancel</button>
          <button type="button" class="button button-primary" @click="saveModuleSettingsAndCreateDeployments">Save</button>
        </div>
      </div>
    </div>

    <!-- Detail Info Modal - CORRIGÉ -->
    <div class="modal-backdrop" v-if="showDetailInfoModal" @click="closeDetailInfoModal"></div>
    <div class="modal-container large-modal" v-if="showDetailInfoModal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Deployment information</h5>
          <button type="button" class="close-button" @click="closeDetailInfoModal" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body" v-if="selectedDetailInfo">
          <!-- Header with Client, Product, Notes - Style like the image -->
          <div class="detail-header-elegant">
            <div class="header-row">
              <span class="header-label">Customer :</span>
              <span class="header-value">{{ selectedProductDeployment?.client?.name || 'N/A' }}</span>
            </div>
            <div class="header-row">
              <span class="header-label">Product :</span>
              <span class="header-value">{{ selectedProductDeployment?.product?.name || 'N/A' }}</span>
            </div>
            <div class="header-row">
              <span class="header-label">Deployement :</span>
              <span class="header-value">{{ selectedDetailInfo.notes || 'Aucune note' }}</span>
            </div>
          </div>

          <div class="info-grid-elegant">
            <div class="info-section-elegant">
              <h6 class="section-title-elegant">Deployment informations</h6>
              <div class="info-row-elegant">
                <span class="info-label-elegant">Deployement Type : </span>
                <span class="info-value-elegant">
                  <span class="badge badge-dark">{{
                      selectedDetailInfo.deployementType ? selectedDetailInfo.deployementType.type : 'N/A'
                    }}</span>
                </span>
              </div>
              <div class="info-row-elegant">
                <span class="info-label-elegant">Product Version :</span>
                <span class="info-value-elegant">
                  <span class="badge badge-secondary">{{
                      selectedDetailInfo.productVersion ? selectedDetailInfo.productVersion.version : 'N/A'
                    }}</span>
                </span>
              </div>
            </div>

            <div class="info-section-elegant">
              <h6 class="section-title-elegant">Dates</h6>
              <div class="info-row-elegant">
                <span class="info-label-elegant">Start date :</span>
                <span class="info-value-elegant">{{ formatDate(selectedDetailInfo.startDeployementDate) || 'Non définie' }}</span>
              </div>
              <div class="info-row-elegant">
                <span class="info-label-elegant">End date :</span>
                <span class="info-value-elegant">{{ formatDate(selectedDetailInfo.endDeployementDate) || 'Non définie' }}</span>
              </div>
            </div>

            <div
              class="info-section-elegant"
              v-if="selectedDetailInfo.allowedModuleVersions && selectedDetailInfo.allowedModuleVersions.length > 0"
            >
              <h6 class="section-title-elegant">Deployed modules</h6>
              <div class="modules-list-elegant">
                <div v-for="moduleVersion in selectedDetailInfo.allowedModuleVersions" :key="moduleVersion.id" class="module-item-elegant">
                  <span class="module-name-elegant">{{ moduleVersion.module?.name || getModuleName(moduleVersion) || 'Module inconnu' }}</span>
                  <span class="module-version-elegant badge badge-primary">{{ moduleVersion.version }}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Infrastructure Info Modal -->
    <div class="modal-backdrop" v-if="showInfraInfoModal" @click="closeInfraInfoModal"></div>
    <div class="modal-container" v-if="showInfraInfoModal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Infrastructure component information</h5>
          <button type="button" class="close-button" @click="closeInfraInfoModal" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body" v-if="selectedInfraInfo">
          <div class="info-grid">
            <div class="info-section">
              <h6 class="section-title">Icomponent information</h6>
              <div class="info-row">
                <span class="info-label">Name :</span>
                <span class="info-value">{{ selectedInfraInfo.infraComponent ? selectedInfraInfo.infraComponent.name : 'N/A' }}</span>
              </div>
              <div class="info-row">
                <span class="info-label">Type :</span>
                <span class="info-value">
                  <span class="badge badge-secondary">{{
                      selectedInfraInfo.infraComponent ? selectedInfraInfo.infraComponent.type : 'N/A'
                    }}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Description:</span>
                <span class="info-value">{{
                    selectedInfraInfo.infraComponent ? selectedInfraInfo.infraComponent.description : 'Aucune description'
                  }}</span>
              </div>
            </div>

            <div class="info-section">
              <h6 class="section-title">Version</h6>
              <div class="info-row">
                <span class="info-label">Version :</span>
                <span class="info-value">
                  <span class="badge badge-dark">{{ selectedInfraInfo.version }}</span>
                </span>
              </div>
              <div class="info-row">
                <span class="info-label">Description of the version :</span>
                <span class="info-value">{{ selectedInfraInfo.description || 'Aucune description' }}</span>
              </div>
            </div>

            <div class="info-section">
              <h6 class="section-title">Dates</h6>
              <div class="info-row">
                <span class="info-label">Creation date :</span>
                <span class="info-value">{{ selectedInfraInfo.createDate || 'Non définie' }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modals -->
    <b-modal ref="removeEntity" id="removeEntity" centered title-class="text-danger">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <font-awesome-icon icon="exclamation-triangle" class="text-danger mr-2"></font-awesome-icon>
          <span
            id="sdiFrontendApp.productDeployment.delete.question"
            data-cy="productDeploymentDeleteDialogHeading"
            v-text="t$('entity.delete.title')"
            class="font-weight-bold"
          ></span>
        </div>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-productDeployment-heading"
          class="mb-0"
          v-text="t$('sdiFrontendApp.productDeployment.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-productDeployment"
              data-cy="entityConfirmDeleteButton"
              v-text="t$('entity.action.delete')"
              @click="removeProductDeployment()"
            ></button>
          </div>
        </div>
      </template>
    </b-modal>

    <b-modal ref="removeDetailEntity" id="removeDetailEntity" centered title-class="text-danger">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            fill="currentColor"
            class="bi bi-exclamation-triangle-fill text-danger mr-2"
            viewBox="0 0 16 16"
          >
            <path
              d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"
            />
          </svg>
          <span class="font-weight-bold">Deletion confirmation</span>
        </div>
      </template>
      <div class="modal-body">
        <p class="mb-0">Are you sure you want to delete this deployment detail ?</p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="closeDetailDialog()">Cancel</button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-productDeployementDetail"
              data-cy="entityConfirmDeleteButton"
              @click="removeProductDeployementDetail()"
            >
              Delete
            </button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
  <div class="section"></div>
  <div class="section"></div>
  <div class="section"></div>
  <div class="section"></div>
</template>

<script lang="ts" src="./product-deployement.component.ts"></script>

<style scoped>
/* Tous les styles CSS restent identiques */
.product-deployment-container {
  padding: 1.8rem;
}

.navigation-bar {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.search-container {
  width: 40%;
  max-width: 500px;
}

.card {
  border-radius: 0.5rem;
  overflow: hidden;
  border: none;
  margin-top: 1.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.table th {
  border-top: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #6c757d;
}

.table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

.action-icons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.icon-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.save-container {
  color: #000;
}

.cancel-container {
  color: #6c757d;
}

.edit-container {
  color: #000;
}

.delete-container {
  color: #000;
}

.settings-container {
  color: #000;
}

.view-container {
  color: #131f3a;
}

.view-container:hover {
  background-color: rgba(0, 123, 255, 0.1);
}

.form-control-borderless {
  display: block;
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid #ced4da;
  border-radius: 0;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-control-borderless:focus {
  outline: none;
  box-shadow: none;
  border-bottom: 2px solid #000;
}

.add-row {
  background-color: rgba(0, 0, 0, 0.03);
}

.selected-row {
  background-color: rgba(0, 0, 0, 0.05);
  border-left: 4px solid #000;
}

/* NOUVEAU: Styles pour la sélection de détail pour configuration */
.detail-selected-for-config {
  background-color: rgba(0, 123, 255, 0.1);
  border-left: 4px solid #007bff;
}

.detail-config-checkbox {
  transform: scale(1.2);
  cursor: pointer;
}

.detail-config-checkbox:checked {
  accent-color: #007bff;
}

/* Filter styles */
.filter-item {
  display: inline-flex;
  align-items: center;
  position: relative;
}

.filter-label {
  margin-right: 8px;
  font-size: 0.875rem;
  color: #6c757d;
}

.filter-select {
  appearance: none;
  background: transparent;
  border: none;
  padding: 4px 20px 4px 0;
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;
  color: #343a40;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23343a40' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 16px;
}

.filter-select:focus {
  outline: none;
}

.btn-reset {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  color: #6c757d;
  font-size: 0.875rem;
}

.btn-reset:hover {
  color: #000;
}

.btn-reset svg {
  margin-right: 4px;
}

/* Tabs styling */
.product-tabs-container {
  margin-top: 20px;
}

.tabs-header {
  border-bottom: 1px solid #e9ecef;
  position: relative;
  margin-bottom: 20px;
}

.tabs-list {
  display: flex;
  position: relative;
  z-index: 1;
}

.tab-item {
  padding: 10px 16px;
  cursor: pointer;
  font-size: 14px;
  position: relative;
  transition: color 0.3s ease;
}

.tab-item.active {
  color: #000;
  font-weight: 500;
}

.tab-item:not(.active) {
  color: #6c757d;
}

.absolute-tab-highlight {
  position: absolute;
  height: 30px;
  transition: all 0.3s ease-out;
  z-index: 0;
}

.active-indicator {
  bottom: -1px;
  height: 2px;
  background-color: #000;
}

/* Breadcrumb navigation */
.breadcrumb-navigation {
  padding: 0.5rem 0;
}

.breadcrumb-item {
  font-size: 0.9rem;
}

.breadcrumb-item.active {
  font-weight: 600;
  color: #0f172a;
}

.breadcrumb-item.clickable {
  color: #000;
  cursor: pointer;
}

.breadcrumb-item.clickable:hover {
  text-decoration: underline;
}

/* Product detail view */
.product-deployment-detail-view {
  transition: all 0.3s ease;
}

.tab-content > div {
  transition: all 0.3s ease;
}

/* Badge styles */
.badge {
  padding: 0.25em 0.6em;
  font-size: 75%;
  font-weight: 700;
  border-radius: 0.25rem;
}

.badge-dark {
  background-color: #343a40;
  color: white;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}

.badge-primary {
  background-color: #007bff;
  color: white;
}

/* Empty state */
.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

/* Modal styles */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  width: 90%;
  max-width: 900px;
  max-height: 85vh;
  display: flex;
  flex-direction: column;
}

/* Large modal for detail view */
.large-modal {
  width: 95%;
  max-width: 1200px;
  max-height: 85vh;
}

/* Elegant modal for module settings */
.elegant-modal {
  max-width: 800px;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 85vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.close-button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.modal-footer .btn {
  margin-left: 0.5rem;
}

.pagination-info {
  color: #6c757d;
}

.pagination-arrows .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}

/* Button styles */
.btn-dark {
  background-color: #000;
  border-color: #000;
  color: white;
}

.btn-dark:hover {
  background-color: #333;
  border-color: #333;
}

.btn-dark:focus {
  box-shadow: 0 0 0 0.2rem rgba(0, 0, 0, 0.25);
}

.btn-outline-dark {
  color: #000;
  border-color: #000;
}

.btn-outline-dark:hover {
  background-color: #000;
  border-color: #000;
  color: white;
}

.form-control:focus {
  border-color: #000;
  box-shadow: 0 0 0 0.2rem rgba(0, 0, 0, 0.25);
}

.form-label {
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #374151;
}

/* Elegant modal styles - inspired by Product Version parameters */
.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f4f5f6;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #131f3a;
}

.card-body {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  max-height: 400px;
}

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

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.button-primary:hover {
  background-color: #26538a;
}

.button-secondary {
  background-color: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

.button-secondary:hover {
  background-color: #e2e8f0;
}

.button-success {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

.button-success:hover {
  background-color: #059669;
}

.button-success:disabled {
  background-color: #d1d5db;
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.7;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.button-icon:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.selector-container {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.select-wrapper {
  position: relative;
  flex: 1;
}

.select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #0f172a;
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  padding-right: 2rem;
}

.select:focus {
  outline: none;
  border-color: #1e40af;
  box-shadow: 0 0 0 2px rgba(30, 64, 175, 0.2);
}

.component-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.component-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.component-item:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.component-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.component-name {
  font-weight: 500;
  color: #0f172a;
}

.component-version {
  font-size: 0.75rem;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
}

.empty-message {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px dashed #e2e8f0;
}

.scroll-container {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.icon {
  flex-shrink: 0;
}

/* Elegant detail header styles */
.detail-header-elegant {
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
  color: white;
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.header-row {
  display: flex;
  align-items: center;
  gap: 1rem;
}

.header-label {
  font-weight: 700;
  font-size: 0.9rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  min-width: 100px;
  opacity: 0.9;
}

.header-value {
  font-weight: 600;
  font-size: 1.1rem;
  background: rgba(255, 255, 255, 0.15);
  padding: 0.5rem 1rem;
  border-radius: 8px;
  backdrop-filter: blur(10px);
  flex: 1;
}

/* Elegant info grid styles */
.info-grid-elegant {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section-elegant {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.section-title-elegant {
  font-size: 1rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.info-row-elegant {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row-elegant:last-child {
  border-bottom: none;
}

.info-label-elegant {
  font-weight: 500;
  color: #6c757d;
  min-width: 150px;
}

.info-value-elegant {
  color: #343a40;
  text-align: right;
  flex: 1;
}

.modules-list-elegant {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.module-item-elegant {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.module-name-elegant {
  font-weight: 500;
  color: #343a40;
}

.module-version-elegant {
  font-size: 0.75rem;
}

.icon-save,
.icon-cancel {
  width: 16px;
  height: 16px;
}

/* Date formatting */
.date-display {
  font-family: 'Courier New', monospace;
  font-weight: 500;
}

/* Info modal styles */
.info-grid {
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
}

.info-section {
  background-color: #f8f9fa;
  border-radius: 8px;
  padding: 1rem;
}

.section-title {
  font-size: 1rem;
  font-weight: 600;
  color: #343a40;
  margin-bottom: 0.75rem;
  border-bottom: 1px solid #dee2e6;
  padding-bottom: 0.5rem;
}

.info-row {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.info-row:last-child {
  border-bottom: none;
}

.info-label {
  font-weight: 500;
  color: #6c757d;
  min-width: 120px;
}

.info-value {
  color: #343a40;
  text-align: right;
  flex: 1;
}

.modules-list {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.module-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem;
  background-color: white;
  border-radius: 4px;
  border: 1px solid #dee2e6;
}

.module-name {
  font-weight: 500;
  color: #343a40;
}

.module-version {
  font-size: 0.75rem;
}

.navigate-container {
  color: #131f3a;
}

.navigate-container:hover {
  background-color: rgba(0, 123, 255, 0.1);
}
</style>
