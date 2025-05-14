<template>
  <div class="product-deployment-container section pt-5">
    <!-- Vue principale des déploiements -->
    <div v-if="!selectedProductDeployment">
      <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
        <div class="d-flex align-items-center">
          <button
            @click="showAddRow = true"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary btn-sm mr-3"
            :disabled="showAddRow"
          >
            <span v-text="t$('global.new')"></span>
          </button>
          <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="ProductDeploymentHeading">
            <span v-text="t$('sdiFrontendApp.productDeployement.home.title')" id="product-deployment-heading"></span>
            <font-awesome-icon icon="cog" class="text-secondary ml-2" style="font-size: 0.8em"></font-awesome-icon>
          </h5>
        </div>

        <div class="search-container">
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

        <div class="d-flex align-items-center">
          <div class="pagination-info mr-3">
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
          <div class="view-toggle ml-3">
            <button class="btn btn-light btn-sm" :class="{ active: viewMode === 'list' }" @click="viewMode = 'list'">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                <path
                  fill-rule="evenodd"
                  d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                />
              </svg>
            </button>
            <button class="btn btn-light btn-sm" :class="{ active: viewMode === 'card' }" @click="viewMode = 'card'">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-grid-3x3-gap-fill"
                viewBox="0 0 16 16"
              >
                <path
                  d="M1 2a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 7a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1zM1 12a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H2a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1H7a1 1 0 0 1-1-1zm5 0a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1v2a1 1 0 0 1-1 1h-2a1 1 0 0 1-1-1z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Data table (List View) -->
      <div class="card" v-if="productDeployments && viewMode === 'list'">
        <div class="table-responsive">
          <table class="table table-hover mb-0" aria-describedby="productDeployments">
            <thead class="thead-light">
            <tr>
              <th scope="col"><span v-text="t$('sdiFrontendApp.productDeployement.refContract')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.productDeployement.client')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.productDeployement.createDate')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.productDeployement.notes')"></span></th>
              <th scope="col" width="220" class="text-center">Actions</th>
            </tr>
            </thead>
            <tbody>
            <tr v-for="productDeployment in paginatedProductDeployments" :key="productDeployment.id" data-cy="entityTable" class="align-middle">
              <td>
                <template v-if="productDeployment.isEditing">
                  <input v-model="productDeployment.refContract" type="text" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ productDeployment.refContract }}
                </template>
              </td>
              <td>
                <template v-if="productDeployment.isEditing">
                  <select v-model="productDeployment.client" class="form-control-borderless">
                    <option v-for="client in clients" :key="client.id" :value="client">
                      {{ client.code }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  {{ productDeployment.client ? productDeployment.client.code : '' }}
                </template>
              </td>
              <td>
                <template v-if="productDeployment.isEditing">
                  <input v-model="productDeployment.createDate" type="date" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ productDeployment.createDate }}
                </template>
              </td>
              <td class="text-truncate" style="max-width: 250px" :title="productDeployment.notes">
                <template v-if="productDeployment.isEditing">
                  <input v-model="productDeployment.notes" type="text" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ productDeployment.notes }}
                </template>
              </td>
              <td class="text-center">
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
                      <div class="icon-container edit-container" @click="editProductDeployment(productDeployment)" title="Modifier">
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
                            d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                            fill="currentColor"
                          />
                        </svg>
                      </div>
                      <!-- Bouton pour voir les détails -->
                      <div class="icon-container details-container" @click="viewProductDeploymentDetails(productDeployment)" title="Voir les détails">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-list-ul"
                          viewBox="0 0 16 16"
                        >
                          <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                        </svg>
                      </div>
                    </div>
                  </template>
                </div>
              </td>
            </tr>

            <tr v-if="showAddRow" class="add-row">
              <td><input type="text" class="form-control-borderless" v-model="newProductDeployment.refContract" placeholder="Référence contrat" /></td>
              <td>
                <select v-model="newProductDeployment.client" class="form-control-borderless">
                  <option value="">Sélectionner un client</option>
                  <option v-for="client in clients" :key="client.id" :value="client">
                    {{ client.code }}
                  </option>
                </select>
              </td>
              <td><input type="date" class="form-control-borderless" v-model="newProductDeployment.createDate" /></td>
              <td><input type="text" class="form-control-borderless" v-model="newProductDeployment.notes" placeholder="Notes" /></td>
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
            </tbody>
          </table>
        </div>
      </div>

      <!-- Card View -->
      <div v-if="productDeployments && viewMode === 'card'" class="card-view-container">
        <div class="row">
          <div v-for="productDeployment in paginatedProductDeployments" :key="productDeployment.id" class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100 product-deployment-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 font-weight-bold">
                  <router-link class="text-primary" :to="{ name: 'ProductDeploymentView', params: { productDeploymentId: productDeployment.id } }">
                    #{{ productDeployment.id }}
                  </router-link>
                </h6>
                <div class="dropdown">
                  <button class="btn btn-sm btn-light" @click="toggleDropdown(productDeployment)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-three-dots-vertical"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M9.5 13a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0m0-5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0"
                      />
                    </svg>
                  </button>
                  <div class="dropdown-menu dropdown-menu-right" :class="{ show: productDeployment.showDropdown }">
                    <a class="dropdown-item" @click="editProductDeployment(productDeployment)">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-pencil-fill mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"
                        />
                      </svg>
                      Modifier
                    </a>
                    <a class="dropdown-item" @click="prepareRemove(productDeployment)">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-trash mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5m3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0z"
                        />
                        <path
                          d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4zM2.5 3h11V2h-11z"
                        />
                      </svg>
                      Supprimer
                    </a>
                    <router-link class="dropdown-item" :to="{ name: 'ProductDeploymentView', params: { productDeploymentId: productDeployment.id } }">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-eye mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
                        />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                      </svg>
                      Voir
                    </router-link>
                    <!-- Lien pour voir les détails -->
                    <a class="dropdown-item" @click="viewProductDeploymentDetails(productDeployment)">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-list-ul mr-2"
                        viewBox="0 0 16 16"
                      >
                        <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                      </svg>
                      Voir les détails
                    </a>
                  </div>
                </div>
              </div>
              <div class="card-body">
                <template v-if="productDeployment.isEditing">
                  <div class="form-group">
                    <label>Référence contrat</label>
                    <input v-model="productDeployment.refContract" type="text" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Client</label>
                    <select v-model="productDeployment.client" class="form-control">
                      <option v-for="client in clients" :key="client.id" :value="client">
                        {{ client.code }}
                      </option>
                    </select>
                  </div>
                  <div class="form-group">
                    <label>Date de création</label>
                    <input v-model="productDeployment.createDate" type="date" class="form-control" />
                  </div>
                  <div class="form-group">
                    <label>Notes</label>
                    <textarea v-model="productDeployment.notes" class="form-control" rows="3"></textarea>
                  </div>
                  <div class="d-flex justify-content-end mt-3">
                    <button class="btn btn-sm btn-secondary mr-2" @click="cancelEdit(productDeployment)">Annuler</button>
                    <button class="btn btn-sm btn-primary" @click="saveProductDeployment(productDeployment)">Enregistrer</button>
                  </div>
                </template>
                <template v-else>
                  <div class="product-deployment-info">
                    <div class="info-row">
                      <span class="info-label">Référence contrat:</span>
                      <span class="info-value">{{ productDeployment.refContract }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Produit</span>
                      <span class="info-value">{{ productDeployment.refContract }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Client:</span>
                      <span class="info-value">{{ productDeployment.client ? productDeployment.client.code : '' }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Date de création:</span>
                      <span class="info-value">{{ productDeployment.createDate }}</span>
                    </div>
                    <div class="info-row">
                      <span class="info-label">Notes:</span>
                      <span class="info-value notes-text">{{ productDeployment.notes }}</span>
                    </div>
                    <!-- Bouton pour voir les détails -->
                    <div class="d-flex justify-content-end mt-3">
                      <button class="btn btn-sm btn-outline-primary" @click="viewProductDeploymentDetails(productDeployment)">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="16"
                          height="16"
                          fill="currentColor"
                          class="bi bi-list-ul mr-2"
                          viewBox="0 0 16 16"
                        >
                          <path fill-rule="evenodd" d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"/>
                        </svg>
                        Voir les détails
                      </button>
                    </div>
                  </div>
                </template>
              </div>
            </div>
          </div>

          <!-- Add new card -->
          <div v-if="showAddRow" class="col-md-4 col-lg-3 mb-4">
            <div class="card h-100 product-deployment-card new-card">
              <div class="card-header d-flex justify-content-between align-items-center">
                <h6 class="mb-0 font-weight-bold text-primary">Nouveau déploiement</h6>
              </div>
              <div class="card-body">
                <div class="form-group">
                  <label>Référence contrat</label>
                  <input v-model="newProductDeployment.refContract" type="text" class="form-control" placeholder="Référence contrat" />
                </div>
                <div class="form-group">
                  <label>Client</label>
                  <select v-model="newProductDeployment.client" class="form-control">
                    <option value="">Sélectionner un client</option>
                    <option v-for="client in clients" :key="client.id" :value="client">
                      {{ client.code }}
                    </option>
                  </select>
                </div>
                <div class="form-group">
                  <label>Date de création</label>
                  <input v-model="newProductDeployment.createDate" type="date" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Notes</label>
                  <textarea v-model="newProductDeployment.notes" class="form-control" rows="3" placeholder="Notes"></textarea>
                </div>
                <div class="d-flex justify-content-end mt-3">
                  <button class="btn btn-sm btn-secondary mr-2" @click="cancelNewProductDeployment">Annuler</button>
                  <button class="btn btn-sm btn-primary" @click="saveNewProductDeployment">Enregistrer</button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal suppression -->
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
    </div>

    <!-- Vue des détails d'un déploiement spécifique -->
    <div v-if="selectedProductDeployment" class="product-deployment-detail-view">
      <!-- En-tête avec titre et informations du déploiement -->
      <div class="header-container mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <h2 class="mb-1 font-weight-bold">Détails du déploiement</h2>
            <h4 class="text-primary mb-3">{{ productDeployementInfo }}</h4>
          </div>
          <button @click="goBackToList" class="btn btn-outline-secondary">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-arrow-left mr-1"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Retour
          </button>
        </div>
      </div>

      <!-- Barre d'outils -->
      <div class="toolbar-container mb-4">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <button
              @click="showAddDetailRow = true"
              id="jh-create-entity-detail"
              data-cy="entityCreateButton"
              class="btn btn-primary"
              :disabled="showAddDetailRow"
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-plus-circle mr-1"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z"/>
                <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z"/>
              </svg>
              Ajouter un détail
            </button>
          </div>

          <div class="search-container">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="Rechercher..." v-model="detailSearchTerm" @input="handleDetailSearch" />
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

          <div class="d-flex align-items-center">
            <div class="pagination-info mr-3">
              <span class="text-muted">{{ detailPaginationInfo }}</span>
            </div>
            <div class="pagination-arrows d-flex">
              <button class="btn btn-light mr-1" :disabled="isDetailPrevDisabled" @click="goToDetailPrevPage">
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
              <button class="btn btn-light" :disabled="isDetailNextDisabled" @click="goToDetailNextPage">
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
      </div>

      <!-- Tableau des détails -->
      <div class="card shadow-sm">
        <div class="table-responsive">
          <table class="table table-hover mb-0">
            <thead class="thead-light">
            <tr>
              <th scope="col" width="50" class="text-center">✓</th>
              <th scope="col">Date de début</th>
              <th scope="col">Date de fin</th>
              <th scope="col">Type de déploiement</th>
              <th scope="col">Version du produit</th>
              <th scope="col">Notes</th>
              <th scope="col" width="180" class="text-center">Actions</th>
            </tr>
            </thead>
            <tbody>
            <!-- Ligne d'ajout -->
            <tr v-if="showAddDetailRow" class="add-row">
              <td><input type="date" class="form-control" v-model="newProductDeployementDetail.startDeployementDate" /></td>
              <td><input type="date" class="form-control" v-model="newProductDeployementDetail.endDeployementDate" /></td>
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
                  <option v-for="version in productVersions" :key="version.id" :value="version">
                    {{ version.version }}
                  </option>
                </select>
              </td>
              <td><input type="text" class="form-control" v-model="newProductDeployementDetail.notes" placeholder="Notes" /></td>
              <td class="text-center">
                <div class="action-buttons">
                  <button class="btn btn-success btn-sm mr-2" @click="saveNewProductDeployementDetail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
                      <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                    </svg>
                    Enregistrer
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="cancelNewProductDeployementDetail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                      <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                    </svg>
                    Annuler
                  </button>
                </div>
              </td>
            </tr>

            <!-- Lignes de données -->
            <tr v-for="detail in paginatedProductDeployementDetails" :key="detail.id" class="align-middle">
              <td class="text-center">
                <input
                  type="checkbox"
                  :checked="detail .isSelected "
                  @change="handleCheckboxChange(detail )"
                  class="form-check-input"
                >
              </td>
              <td>
                <template v-if="detail.isEditing">
                  <input v-model="detail.startDeployementDate" type="date" class="form-control" />
                </template>
                <template v-else>
                  {{ formatDate(detail.startDeployementDate) }}
                </template>
              </td>
              <td>
                <template v-if="detail.isEditing">
                  <input v-model="detail.endDeployementDate" type="date" class="form-control" />
                </template>
                <template v-else>
                  {{ formatDate(detail.endDeployementDate) }}
                </template>
              </td>
              <td>
                <template v-if="detail.isEditing">
                  <select v-model="detail.deployementType" class="form-control">
                    <option v-for="type in deployementTypes" :key="type.id" :value="type">
                      {{ type.type }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  <span class="badge badge-info">{{ detail.deployementType ? detail.deployementType.type : '' }}</span>
                </template>
              </td>
              <td>
                <template v-if="detail.isEditing">
                  <select v-model="detail.productVersion" class="form-control">
                    <option v-for="version in productVersions" :key="version.id" :value="version">
                      {{ version.version }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  <span class="badge badge-primary">{{ detail.productVersion ? detail.productVersion.version : '' }}</span>
                </template>
              </td>
              <td class="text-truncate" style="max-width: 250px" :title="detail.notes">
                <template v-if="detail.isEditing">
                  <input v-model="detail.notes" type="text" class="form-control" />
                </template>
                <template v-else>
                  {{ detail.notes }}
                </template>
              </td>
              <td class="text-center">
                <div class="action-buttons">
                  <template v-if="detail.isEditing">
                    <button class="btn btn-success btn-sm mr-2" @click="saveProductDeployementDetail(detail)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-check" viewBox="0 0 16 16">
                        <path d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"/>
                      </svg>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" @click="cancelEdit(detail)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                        <path d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"/>
                      </svg>
                    </button>
                  </template>
                  <template v-else>
                    <button class="btn btn-outline-primary btn-sm mr-2" @click="editProductDeployementDetail(detail)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil" viewBox="0 0 16 16">
                        <path d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"/>
                      </svg>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" @click="prepareRemoveDetail(detail)">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16">
                        <path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/>
                        <path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/>
                      </svg>
                    </button>
                  </template>
                </div>
              </td>
            </tr>

            <!-- Message si aucune donnée -->
            <tr v-if="productDeployementDetails.length === 0 && !showAddDetailRow">
              <td colspan="6" class="text-center py-4">
                <div class="empty-state">
                  <svg xmlns="http://www.w3.org/2000/svg" width="48" height="48" fill="currentColor" class="bi bi-inbox text-muted mb-3" viewBox="0 0 16 16">
                    <path d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z"/>
                  </svg>
                  <h5 class="text-muted">Aucun détail disponible</h5>
                  <p class="text-muted">Cliquez sur "Ajouter un détail" pour commencer</p>
                </div>
              </td>
            </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Modal de confirmation de suppression pour les détails -->
      <b-modal ref="removeDetailEntity" id="removeDetailEntity" centered title-class="text-danger">
        <template #modal-title>
          <div class="d-flex align-items-center">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" class="bi bi-exclamation-triangle-fill text-danger mr-2" viewBox="0 0 16 16">
              <path d="M8.982 1.566a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566zM8 5c.535 0 .954.462.9.995l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995A.905.905 0 0 1 8 5zm.002 6a1 1 0 1 1 0 2 1 1 0 0 1 0-2z"/>
            </svg>
            <span class="font-weight-bold">Confirmation de suppression</span>
          </div>
        </template>
        <div class="modal-body">
          <p class="mb-0">Êtes-vous sûr de vouloir supprimer ce détail de déploiement ?</p>
        </div>
        <template #modal-footer>
          <div class="w-100">
            <div class="d-flex justify-content-between">
              <button type="button" class="btn btn-secondary" @click="closeDetailDialog()">Annuler</button>
              <button
                type="button"
                class="btn btn-danger"
                id="jhi-confirm-delete-productDeployementDetail"
                data-cy="entityConfirmDeleteButton"
                @click="removeProductDeployementDetail()"
              >
                Supprimer
              </button>
            </div>
          </div>
        </template>
      </b-modal>
      <!-- Ajoutez après votre tableau -->
      <div v-if="showTabs" class="bottom-tabs-container">
        <div class="tabs-header">
          <div class="tabs">
            <button
              class="tab-button"
              :class="{ active: activeTab === 'description' }"
              @click="activeTab = 'description'"
            >
              Description
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'modules' }"
              @click="activeTab = 'modules'"
            >
              Modules
            </button>
            <button
              class="tab-button"
              :class="{ active: activeTab === 'configuration' }"
              @click="activeTab = 'configuration'"
            >
              Configuration
            </button>
          </div>
          <button class="clear-button" @click="clearSelection">
            <i class="bi bi-x"></i> Effacer
          </button>
        </div>

        <div class="tab-content">
          <div v-if="activeTab === 'description'" class="description-tab">
            <h5>Détails sélectionnés ({{ selectedDetails.length }})</h5>
            <ul>
              <li v-for="detail in selectedDetails" :key="detail.id">
                {{ detail.productVersion?.version }} -
                Du {{ formatDate(detail.startDeployementDate) }}
                au {{ formatDate(detail.endDeployementDate) }}
              </li>
            </ul>
          </div>

          <div v-if="activeTab === 'modules'" class="modules-tab">
            <h5>Modules associés</h5>
            <!-- Contenu spécifique aux modules -->
          </div>

          <div v-if="activeTab === 'configuration'" class="config-tab">
            <h5>Configuration</h5>
            <!-- Contenu spécifique à la configuration -->
          </div>
        </div>
      </div>
    </div>
  </div>
  <section class="section"></section>
  <section class="section"></section>
  <section class="section"></section>
  <section class="section"></section>
</template>

<script lang="ts" src="./product-deployement.component.ts" >

</script>

<style scoped>
.product-deployment-container {
  padding: 1.5rem;
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

.btn-group .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
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

.icon-container:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.icon-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.save-container {
  color: #0c2d57;
}

.cancel-container {
  color: #6c757d;
}

.edit-container {
  color: #0c2d57;
}

.delete-container {
  color: #0c2d57;
}

.view-container {
  color: #0c2d57;
}

.details-container {
  color: #0c2d57;
}

.icon-save,
.icon-cancel {
  width: 20px;
  height: 20px;
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
  border-bottom: 2px solid #007bff;
}

.add-row {
  background-color: rgba(0, 123, 255, 0.03);
}

.view-toggle .btn.active {
  background-color: #e9ecef;
  border-color: #dee2e6;
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

/* Card View Styles */
.card-view-container {
  margin-top: 1.5rem;
}

.product-deployment-card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.product-deployment-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.product-deployment-info .info-row {
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
}

.product-deployment-info .info-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.8rem;
}

.product-deployment-info .info-value {
  font-size: 0.95rem;
}

.product-deployment-info .notes-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1rem;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: rgba(0, 123, 255, 0.05);
}

/* Styles pour la vue des détails */
.product-deployment-detail-view {
  padding: 1.5rem;
  background-color: #f8f9fa;
  min-height: 100vh;
}

.header-container {
  background-color: white;
  padding: 1.5rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.toolbar-container {
  background-color: white;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.empty-state {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 2rem;
}

.badge {
  font-size: 0.85rem;
  padding: 0.5em 0.75em;
}

.badge-info {
  background-color: #17a2b8;
}

.badge-primary {
  background-color: #007bff;
}
.bottom-tabs-container {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  background: white;
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 10px rgba(0,0,0,0.1);
  z-index: 1000;
}

.tabs-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.5rem 1rem;
  background: #f8f9fa;
  border-bottom: 1px solid #ddd;
}

.tabs {
  display: flex;
  gap: 1rem;
}

.tab-button {
  padding: 0.5rem 1rem;
  background: none;
  border: none;
  border-bottom: 3px solid transparent;
  cursor: pointer;
  font-weight: 500;
}

.tab-button.active {
  border-bottom-color: #0d6efd;
  color: #0d6efd;
}

.clear-button {
  background: none;
  border: none;
  color: #6c757d;
  cursor: pointer;
}

.clear-button:hover {
  color: #0d6efd;
}

.tab-content {
  padding: 1rem;
  max-height: 300px;
  overflow-y: auto;
}

.description-tab ul {
  list-style: none;
  padding: 0;
}

.description-tab li {
  padding: 0.5rem 0;
  border-bottom: 1px solid #eee;
}
</style>
