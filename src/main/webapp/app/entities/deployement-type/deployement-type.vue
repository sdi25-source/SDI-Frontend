<template>
  <div class="deployement-type-container section pt-5">
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <button
          @click="showAddRow = true"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn button-primary btn-sm mr-3 rounded-1"
          :disabled="showAddRow"
        >
          <font-awesome-icon icon="plus"></font-awesome-icon>
          <span v-text="t$('global.new')"></span>
        </button>
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="DeployementTypeHeading">
          <span v-text="t$('sdiFrontendApp.deployementType.home.title')" id="deployement-type-heading"></span>
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
        <button class="btn btn-light btn-sm ml-3" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.product.home.refreshListLabel')"></span>
        </button>
      </div>
    </div>

    <!-- Vue Tableau -->
    <div class="card" v-if="deployementTypes && viewMode === 'list'">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="deployementTypes">
          <thead class="thead-light">
            <tr>
              <th scope="col"><span v-text="t$('sdiFrontendApp.deployementType.type')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.deployementType.notes')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="deployementType in paginatedDeployementTypes" :key="deployementType.id" data-cy="entityTable" class="align-middle">
              <td>
                <template v-if="deployementType.isEditing">
                  <input v-model="deployementType.type" type="text" class="form-control-borderless" />
                </template>
                <template v-else>{{ deployementType.type }}</template>
              </td>
              <td class="text-truncate" style="max-width: 250px" :title="deployementType.notes">
                <template v-if="deployementType.isEditing">
                  <input v-model="deployementType.notes" type="text" class="form-control-borderless" />
                </template>
                <template v-else>{{ deployementType.notes }}</template>
              </td>
              <td class="text-center">
                <div class="btn-group">
                  <template v-if="deployementType.isEditing">
                    <div class="icon-container save-container" @click="saveDeployementType(deployementType)" title="Enregistrer">
                      <font-awesome-icon icon="save"></font-awesome-icon>
                    </div>
                    <div class="icon-container cancel-container" @click="cancelEdit(deployementType)" title="Annuler">
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
                      <div class="icon-container edit-container" @click="editDeployementType(deployementType)" title="Modifier">
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
                      <div class="icon-container delete-container" @click="prepareRemove(deployementType)" title="Supprimer">
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
                    </div>
                  </template>
                </div>
              </td>
            </tr>

            <tr v-if="showAddRow" class="add-row">
              <td><input v-model="newDeployementType.type" type="text" class="form-control-borderless" placeholder="Type" /></td>
              <td><input v-model="newDeployementType.notes" type="text" class="form-control-borderless" placeholder="Notes" /></td>
              <td class="text-center">
                <div class="action-icons">
                  <div class="icon-container save-container" @click="saveNewDeployementType" title="Enregistrer">
                    <font-awesome-icon icon="save"></font-awesome-icon>
                  </div>
                  <div class="icon-container cancel-container" @click="cancelNewDeployementType" title="Annuler">
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

            <tr v-if="paginatedDeployementTypes.length === 0 && !showAddRow">
              <td colspan="3" class="empty-message">No deployement type available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Vue Cartes -->
    <div v-if="deployementTypes && viewMode === 'card'" class="card-view-container">
      <div class="row">
        <div v-for="deployementType in paginatedDeployementTypes" :key="deployementType.id" class="col-md-4 col-lg-3 mb-4">
          <div class="card h-100 deployement-type-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 font-weight-bold">
                <router-link class="text-primary" :to="{ name: 'DeployementTypeView', params: { deployementTypeId: deployementType.id } }">
                  #{{ deployementType.id }}
                </router-link>
              </h6>
              <div class="dropdown">
                <button class="btn btn-sm btn-light" @click="toggleDropdown(deployementType)">
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
                <div class="dropdown-menu dropdown-menu-right" :class="{ show: deployementType.showDropdown }">
                  <a class="dropdown-item" @click="editDeployementType(deployementType)">
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
                  <a class="dropdown-item" @click="prepareRemove(deployementType)">
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
                </div>
              </div>
            </div>
            <div class="card-body">
              <template v-if="deployementType.isEditing">
                <div class="form-group">
                  <label>Type</label>
                  <input v-model="deployementType.type" type="text" class="form-control" />
                </div>
                <!--                <div class="form-group">-->
                <!--                  <label>Date de création</label>-->
                <!--                  <input v-model="deployementType.createDate" type="date" class="form-control" />-->
                <!--                </div>-->
                <!--                <div class="form-group">-->
                <!--                  <label>Date de mise à jour</label>-->
                <!--                  <input v-model="deployementType.updateDate" type="date" class="form-control" />-->
                <!--                </div>-->
                <div class="form-group">
                  <label>Notes</label>
                  <textarea v-model="deployementType.notes" class="form-control" rows="3"></textarea>
                </div>
                <div class="d-flex justify-content-end mt-3">
                  <button class="btn btn-sm btn-secondary mr-2" @click="cancelEdit(deployementType)">Annuler</button>
                  <button class="btn btn-sm btn-primary" @click="saveDeployementType(deployementType)">Enregistrer</button>
                </div>
              </template>
              <template v-else>
                <div class="deployement-type-info">
                  <div class="info-row">
                    <span class="info-label">Type:</span>
                    <span class="info-value">{{ deployementType.type }}</span>
                  </div>
                  <!--                  <div class="info-row">-->
                  <!--                    <span class="info-label">Date de création:</span>-->
                  <!--                    <span class="info-value">{{ deployementType.createDate }}</span>-->
                  <!--                  </div>-->
                  <!--                  <div class="info-row">-->
                  <!--                    <span class="info-label">Date de mise à jour:</span>-->
                  <!--                    <span class="info-value">{{ deployementType.updateDate }}</span>-->
                  <!--                  </div>-->
                  <div class="info-row">
                    <span class="info-label">Notes:</span>
                    <span class="info-value notes-text">{{ deployementType.notes }}</span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Carte d'ajout -->
        <div v-if="showAddRow" class="col-md-4 col-lg-3 mb-4">
          <div class="card h-100 deployement-type-card new-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 font-weight-bold text-primary">Nouveau type de déploiement</h6>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label>Type</label>
                <input v-model="newDeployementType.type" type="text" class="form-control" placeholder="Type" />
              </div>
              <div class="form-group">
                <label>Date de création</label>
                <input v-model="newDeployementType.createDate" type="date" class="form-control" />
              </div>
              <div class="form-group">
                <label>Date de mise à jour</label>
                <input v-model="newDeployementType.updateDate" type="date" class="form-control" />
              </div>
              <div class="form-group">
                <label>Notes</label>
                <textarea v-model="newDeployementType.notes" class="form-control" rows="3" placeholder="Notes"></textarea>
              </div>
              <div class="d-flex justify-content-end mt-3">
                <button class="btn btn-sm btn-secondary mr-2" @click="cancelNewDeployementType">Annuler</button>
                <button class="btn btn-sm btn-primary" @click="saveNewDeployementType">Enregistrer</button>
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
            id="sdiFrontendApp.deployementType.delete.question"
            data-cy="deployementTypeDeleteDialogHeading"
            v-text="t$('entity.delete.title')"
            class="font-weight-bold"
          ></span>
        </div>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-deployementType-heading"
          class="mb-0"
          v-text="t$('sdiFrontendApp.deployementType.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-deployementType"
              data-cy="entityConfirmDeleteButton"
              v-text="t$('entity.action.delete')"
              @click="removeDeployementType()"
            ></button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
  <section class="section"></section>
  <section class="section"></section>
  <section class="section"></section>
  <section class="section"></section>
</template>

<script lang="ts" src="./deployement-type.component.ts"></script>

<style scoped>
.empty-message {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px dashed #e2e8f0;
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
.deployement-type-container {
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

.deployement-type-card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.deployement-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.deployement-type-info .info-row {
  margin-bottom: 0.5rem;
  display: flex;
  flex-direction: column;
}

.deployement-type-info .info-label {
  font-weight: 600;
  color: #6c757d;
  font-size: 0.8rem;
}

.deployement-type-info .info-value {
  font-size: 0.95rem;
}

.deployement-type-info .notes-text {
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
</style>
