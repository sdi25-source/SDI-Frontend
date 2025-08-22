<template>
  <div class="product-deployment-detail-view">
    <!-- En-tête avec titre et informations du déploiement -->
    <div class="header-container mb-4">
      <div class="d-flex justify-content-between align-items-center">
        <div>
          <h2 class="mb-1 font-weight-bold">Dates du déploiement</h2>
          <h4 class="text-primary mb-3">{{ productDeployementInfo }}</h4>
        </div>
        <button @click="goBack" class="btn btn-outline-secondary">
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
          <!-- boutton d'ajout -->
          <button
            @click="showAddRow = true"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary"
            :disabled="showAddRow"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-plus-circle mr-1"
              viewBox="0 0 16 16"
            >
              <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
              <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
            </svg>
            Ajouter un détail
          </button>
        </div>
        <!-- pour la recherche -->
        <div class="search-container">
          <div class="input-group">
            <input type="text" class="form-control" placeholder="Rechercher..." v-model="searchTerm" @input="handleSearch" />
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
            <span class="text-muted">{{ paginationInfo }}</span>
          </div>
          <div class="pagination-arrows d-flex">
            <button class="btn btn-light mr-1" :disabled="isPrevDisabled" @click="goToPrevPage">
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
            <button class="btn btn-light" :disabled="isNextDisabled" @click="goToNextPage">
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
            <tr v-if="showAddRow" class="add-row">
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
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-check"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"
                      />
                    </svg>
                    Enregistrer
                  </button>
                  <button class="btn btn-outline-secondary btn-sm" @click="cancelNewProductDeployementDetail">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
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
            <tr v-for="detail in paginatedProductDeployementDetails" :key="detail.id" class="align-middle">
              <td class="text-center">
                <input type="checkbox" v-model="detail.isSelected" class="form-check-input" />
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
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-check"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M10.97 4.97a.75.75 0 0 1 1.07 1.05l-3.99 4.99a.75.75 0 0 1-1.08.02L4.324 8.384a.75.75 0 1 1 1.06-1.06l2.094 2.093 3.473-4.425a.267.267 0 0 1 .02-.022z"
                        />
                      </svg>
                    </button>
                    <button class="btn btn-outline-secondary btn-sm" @click="cancelEdit(detail)">
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
                    </button>
                  </template>
                  <template v-else>
                    <button class="btn btn-outline-primary btn-sm mr-2" @click="editProductDeployementDetail(detail)">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-pencil"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M12.146.146a.5.5 0 0 1 .708 0l3 3a.5.5 0 0 1 0 .708l-10 10a.5.5 0 0 1-.168.11l-5 2a.5.5 0 0 1-.65-.65l2-5a.5.5 0 0 1 .11-.168l10-10zM11.207 2.5 13.5 4.793 14.793 3.5 12.5 1.207 11.207 2.5zm1.586 3L10.5 3.207 4 9.707V10h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.293l6.5-6.5zm-9.761 5.175-.106.106-1.528 3.821 3.821-1.528.106-.106A.5.5 0 0 1 5 12.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.468-.325z"
                        />
                      </svg>
                    </button>
                    <button class="btn btn-outline-danger btn-sm" @click="prepareRemove(detail)">
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
                  </template>
                </div>
              </td>
            </tr>

            <!-- Message si aucune donnée -->
            <tr v-if="productDeployementDetails.length === 0 && !showAddRow">
              <td colspan="6" class="text-center py-4">
                <div class="empty-state">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="48"
                    height="48"
                    fill="currentColor"
                    class="bi bi-inbox text-muted mb-3"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M4.98 4a.5.5 0 0 0-.39.188L1.54 8H6a.5.5 0 0 1 .5.5 1.5 1.5 0 1 0 3 0A.5.5 0 0 1 10 8h4.46l-3.05-3.812A.5.5 0 0 0 11.02 4H4.98zm-1.17-.437A1.5 1.5 0 0 1 4.98 3h6.04a1.5 1.5 0 0 1 1.17.563l3.7 4.625a.5.5 0 0 1 .106.374l-.39 3.124A1.5 1.5 0 0 1 14.117 13H1.883a1.5 1.5 0 0 1-1.489-1.314l-.39-3.124a.5.5 0 0 1 .106-.374l3.7-4.625z"
                    />
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

    <!-- Modal de confirmation de suppression -->
    <b-modal ref="removeEntity" id="removeEntity" centered title-class="text-danger">
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
            <button type="button" class="btn btn-secondary" @click="closeDialog()">Annuler</button>
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
  </div>
</template>

<script lang="ts" src="./product-deployement-detail.component.ts"></script>

<style scoped>
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

.search-container {
  width: 40%;
  max-width: 400px;
}

.card {
  border-radius: 0.5rem;
  overflow: hidden;
  border: none;
}

.table th {
  border-top: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #6c757d;
}

.table td {
  padding: 1rem;
  vertical-align: middle;
}

.action-buttons {
  display: flex;
  justify-content: center;
}

.add-row {
  background-color: rgba(0, 123, 255, 0.03);
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
</style>
