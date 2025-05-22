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
            class="btn btn-primary btn-sm mr-3 rounded-3"
            :disabled="showAddRow"
          >
            <span v-text="t$('global.new')"></span>
          </button>
          <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="ProductDeploymentHeading">
            <span v-text="t$('sdiFrontendApp.productDeployement.home.title')" id="product-deployment-heading"></span>
            <font-awesome-icon icon="cog" class="text-secondary ml-2" style="font-size: 0.8em"></font-awesome-icon>
          </h5>
        </div>

        <div class="d-flex align-items-center">
          <span class="text-muted mr-2">{{ productDeployments.length }} déploiements</span>
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

      <!-- Section des filtres -->
      <div class="filters-container mb-4">
        <div class="row">
          <div class="col-md-4">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-search"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                    />
                  </svg>
                </span>
              </div>
              <input type="text" class="form-control" placeholder="Rechercher..." v-model="searchTerm" @input="handleSearch" />
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">Client</span>
              </div>
              <select class="form-control" v-model="selectedClientFilter" @change="applyFilters">
                <option :value="null">Tous les clients</option>
                <option v-for="client in clients" :key="client.id" :value="client">
                  {{ client.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-md-3">
            <div class="input-group">
              <div class="input-group-prepend">
                <span class="input-group-text">Produit</span>
              </div>
              <select class="form-control" v-model="selectedProductFilter" @change="applyFilters">
                <option :value="null">Tous les produits</option>
                <option v-for="product in products" :key="product.id" :value="product">
                  {{ product.name }}
                </option>
              </select>
            </div>
          </div>
          <div class="col-md-2">
            <button class="btn btn-outline-secondary btn-block" @click="resetFilters">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                fill="currentColor"
                class="bi bi-x-circle mr-1"
                viewBox="0 0 16 16"
              >
                <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                <path
                  d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                />
              </svg>
              Réinitialiser
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
                <th scope="col"><span>Produit</span></th>

                <th scope="col"><span v-text="t$('sdiFrontendApp.productDeployement.notes')"></span></th>
                <th scope="col" width="220" class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="productDeployment in paginatedProductDeployments"
                :key="productDeployment.id"
                data-cy="entityTable"
                class="align-middle"
                :class="{ 'selected-row': selectedProductDeployment && selectedProductDeployment.id === productDeployment.id }"
                @click="viewProductDeploymentDetails(productDeployment)"
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

                <td class="text-truncate" style="max-width: 250px" :title="productDeployment.notes">
                  <template v-if="productDeployment.isEditing">
                    <input v-model="productDeployment.notes" type="text" class="form-control-borderless" @click.stop />
                  </template>
                  <template v-else>
                    {{ productDeployment.notes }}
                  </template>
                </td>
                <td class="text-center" @click.stop>
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
                        <div
                          class="icon-container details-container"
                          @click="viewProductDeploymentDetails(productDeployment)"
                          title="Voir les détails"
                        >
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-list-ul"
                            viewBox="0 0 16 16"
                          >
                            <path
                              fill-rule="evenodd"
                              d="M5 11.5a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h9a.5.5 0 0 1 0 1h-9a.5.5 0 0 1-.5-.5zm-3 1a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2zm0 4a1 1 0 1 0 0-2 1 1 0 0 0 0 2z"
                            />
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
                    <option value="">Sélectionner un client</option>
                    <option v-for="client in clients" :key="client.id" :value="client">
                      {{ client.name }}
                    </option>
                  </select>
                </td>
                <td>
                  <select v-model="newProductDeployment.product" class="form-control-borderless">
                    <option value="">Sélectionner un produit</option>
                    <option v-for="product in products" :key="product.id" :value="product">
                      {{ product.name }}
                    </option>
                  </select>
                </td>

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
            <h2 class="mb-1 font-weight-bold">Dates des déploiement</h2>
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
              class="btn btn-primary rounded-3"
              :disabled="showAddDetailRow"
            >
              New
            </button>
          </div>

          <div class="search-container">
            <div class="input-group">
              <input type="text" class="form-control" placeholder="Rechercher..." v-model="detailSearchTerm" @input="handleDetailSearch" />
              <div class="input-group-append">
                <button class="btn btn-outline-secondary" type="button">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-search"
                    viewBox="0 0 16 16"
                  >
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
                <!--
              <th scope="col">Date de début</th>
              <th scope="col">Date de fin</th>
              -->
                <th scope="col">Notes</th>
                <th scope="col">Type de déploiement</th>
                <th scope="col">Version du produit</th>

                <th scope="col" width="180" class="text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              <!-- Ligne d'ajout -->
              <tr v-if="showAddDetailRow" class="add-row">
                <td><input type="text" class="form-control" v-model="newProductDeployementDetail.notes" placeholder="Notes" /></td>
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

              <!-- Lignes de données -->
              <tr
                v-for="detail in paginatedProductDeployementDetails"
                :key="detail.id"
                class="align-middle"
                :class="{ 'selected-row': detail.isSelected }"
                @click="selectDetail(detail)"
                style="cursor: pointer"
              >
                <!--
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
                    <select v-model="detail.deployementType" class="form-control" @click.stop>
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
                    <span class="badge badge-primary">{{ detail.productVersion ? detail.productVersion.version : '' }}</span>
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
                      <div class="icon-container edit-container" @click="editProductDeployementDetail(detail)" title="Modifier">
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
                      <div class="icon-container delete-container" @click="prepareRemoveDetail(detail)" title="Supprimer">
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

                      <!-- Bouton pour configurer les modules autorisés -->
                      <div class="icon-container settings-container" @click="openModuleSettings(detail)" title="Configuration des modules">
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
                    </template>
                  </div>
                </td>
              </tr>

              <!-- Message si aucune donnée -->
              <tr v-if="productDeployementDetails.length === 0 && !showAddDetailRow">
                <td colspan="6" class="text-center py-4">
                  <div class="empty-state">
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

      <!-- Modal de configuration pour les modules autorisés -->
      <b-modal
        ref="moduleSettingsModal"
        id="moduleSettingsModal"
        centered
        size="lg"
        title="Configuration des modules autorisés"
        v-model="showModuleSettingsModal"
      >
        <div class="modal-body">
          <div v-if="selectedDetail">
            <h5 class="mb-3">Détail: {{ selectedDetail.productVersion ? selectedDetail.productVersion.version : '' }}</h5>

            <div class="mb-4">
              <h6 class="mb-2">Modules autorisés</h6>
              <div class="d-flex mb-3">
                <div class="flex-grow-1 mr-2">
                  <select v-model="selectedModuleVersionId" class="form-control">
                    <option value="">Sélectionner un module</option>
                    <option v-for="moduleVersion in moduleVersions" :key="moduleVersion.id" :value="moduleVersion.id">
                      {{ moduleVersion.module?.name }} - {{ moduleVersion.version }}
                    </option>
                  </select>
                </div>
                <button class="btn btn-primary" @click="addModuleToDetail" :disabled="!selectedModuleVersionId">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-plus" viewBox="0 0 16 16">
                    <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                  </svg>
                  Ajouter
                </button>
              </div>

              <div class="table-responsive">
                <table class="table table-sm table-bordered">
                  <thead class="thead-light">
                    <tr>
                      <th>Module</th>
                      <th>Version</th>
                      <th width="80" class="text-center">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-for="(moduleVersion, index) in selectedAllowedModuleVersions" :key="index">
                      <td>{{ moduleVersion.module?.name }}</td>
                      <td>{{ moduleVersion.version }}</td>
                      <td class="text-center">
                        <button class="btn btn-sm btn-outline-danger" @click="removeModuleFromDetail(index)">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-trash"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
                            />
                            <path
                              fill-rule="evenodd"
                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                            />
                          </svg>
                        </button>
                      </td>
                    </tr>
                    <tr v-if="selectedAllowedModuleVersions.length === 0">
                      <td colspan="3" class="text-center py-3">
                        <p class="text-muted mb-0">Aucun module autorisé ajouté</p>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
        <template #modal-footer>
          <div class="w-100">
            <div class="d-flex justify-content-between">
              <button type="button" class="btn btn-secondary" @click="closeModuleSettingsModal">Annuler</button>
              <button type="button" class="btn btn-primary" @click="saveModuleSettingsAndCreateDeployments">
                Enregistrer et créer les déploiements
              </button>
            </div>
          </div>
        </template>
      </b-modal>

      <!-- Barre d'onglets en bas -->
      <div v-if="showTabs" class="bottom-tabs-container">
        <div class="tabs-header">
          <div class="tabs">
            <!--
            <button
              class="tab-button"
              :class="{ active: activeTab === 'description' }"
              @click="activeTab = 'description'"
            >
              Description
            </button>
            -->
            <button class="tab-button" :class="{ active: activeTab === 'modulesDeployement' }" @click="activeTab = 'modulesDeployement'">
              Modules Deployement
            </button>
            <!--
            <button
              class="tab-button"
              :class="{ active: activeTab === 'configuration' }"
              @click="activeTab = 'configuration'"
            >
              Configuration
            </button>
            -->
          </div>
          <button class="clear-button" @click="clearSelection"><i class="bi bi-x"></i> Close</button>
        </div>

        <div class="tab-content">
          <!-- Onglet Description
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
          -->

          <!-- Onglet Modules Deployement -->
          <div v-if="activeTab === 'modulesDeployement'" class="modules-tab">
            <div class="d-flex justify-content-between align-items-center mb-3">
              <h5>Modules de déploiement</h5>
            </div>

            <!-- Tableau des modules de déploiement (affichage statique) -->
            <div class="table-responsive">
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th scope="col">Code</th>
                    <th scope="col">Notes</th>
                    <th scope="col">Version du module</th>
                  </tr>
                </thead>
                <tbody>
                  <!-- Lignes des modules de déploiement -->
                  <tr v-for="moduleDeployement in filteredModuleDeployements" :key="moduleDeployement.id">
                    <td>{{ moduleDeployement.code }}</td>
                    <td class="text-truncate" style="max-width: 200px" :title="moduleDeployement.notes">
                      {{ moduleDeployement.notes }}
                    </td>
                    <td>
                      <span class="badge badge-info">{{
                        moduleDeployement.moduleVersion ? moduleDeployement.moduleVersion.version : '-'
                      }}</span>
                    </td>
                  </tr>

                  <!-- Message si aucun module -->
                  <tr v-if="filteredModuleDeployements.length === 0">
                    <td colspan="3" class="text-center py-4">
                      <div class="empty-state">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="48"
                          height="48"
                          fill="currentColor"
                          class="bi bi-box text-muted mb-3"
                          viewBox="0 0 16 16"
                        >
                          <path
                            d="M8.186 1.113a.5.5 0 0 0-.372 0L1.846 3.5 8 5.961 14.154 3.5 8.186 1.113zM15 4.239l-6.5 2.6v7.922l6.5-2.6V4.24zM7.5 14.762V6.838L1 4.239v7.923l6.5 2.6zM7.443.184a1.5 1.5 0 0 1 1.114 0l7.129 2.852A.5.5 0 0 1 16 3.5v8.662a1 1 0 0 1-.629.928l-7.185 2.874a.5.5 0 0 1-.372 0L.63 13.09a1 1 0 0 1-.63-.928V3.5a.5.5 0 0 1 .314-.464L7.443.184z"
                          />
                        </svg>
                        <h5 class="text-muted">Aucun module de déploiement trouvé</h5>
                        <p class="text-muted">Utilisez l'icône de configuration sur un détail pour ajouter des modules</p>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          <!-- Onglet Configuration -->
          <div v-if="activeTab === 'configuration'" class="config-tab">
            <h5>Configuration</h5>

            <div class="row">
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0">Paramètres généraux</h6>
                  </div>
                  <div class="card-body">
                    <p>Configurez les paramètres généraux pour les détails sélectionnés.</p>
                  </div>
                </div>
              </div>
              <div class="col-md-6">
                <div class="card mb-3">
                  <div class="card-header">
                    <h6 class="mb-0">Paramètres avancés</h6>
                  </div>
                  <div class="card-body">
                    <p>Configurez les paramètres avancés pour les détails sélectionnés.</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Modal de confirmation de suppression pour les modules de déploiement -->
    </div>
  </div>
  <div class="section"></div>
  <div class="section"></div>
  <div class="section"></div>
</template>

<script lang="ts" src="./product-deployement.component.ts"></script>

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

.filters-container {
  background-color: #f8f9fa;
  padding: 1rem;
  border-radius: 0.5rem;
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
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

.settings-container {
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
  padding: 2rem;
  margin-left: 1, 5px;
  background: white;
  border-top: 1px solid #ddd;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.1);
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

.modules-tab,
.config-tab {
  padding: 0.5rem;
}

.selected-row {
  background-color: rgba(0, 123, 255, 0.05);
}

.btn-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.btn-primary:hover {
  background-color: #26538a;
}
</style>
