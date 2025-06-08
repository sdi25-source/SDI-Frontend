<template>
  <div class="component-type-container section pt-5">
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
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="ComponentTypeHeading">
          <span v-text="t$('sdiFrontendApp.componentType.home.title')" id="component-type-heading"></span>
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

    <!-- Data table (List View) -->
    <div class="card" v-if="componentTypes && viewMode === 'list'">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="componentTypes">
          <thead class="thead-light">
            <tr>
              <th scope="col"><span v-text="t$('sdiFrontendApp.componentType.type')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="componentType in paginatedComponentTypes" :key="componentType.id" data-cy="entityTable" class="align-middle">
              <td>
                <template v-if="componentType.isEditing">
                  <input v-model="componentType.type" type="text" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ componentType.type }}
                </template>
              </td>
              <td class="text-center">
                <div class="btn-group">
                  <template v-if="componentType.isEditing">
                    <div class="icon-container save-container" @click="saveComponentType(componentType)" title="Enregistrer">
                      <font-awesome-icon icon="save"></font-awesome-icon>
                    </div>
                    <div class="icon-container cancel-container" @click="cancelEdit(componentType)" title="Annuler">
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
                      <div class="icon-container edit-container" @click="editComponentType(componentType)" title="Modifier">
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
                      <div class="icon-container delete-container" @click="prepareRemove(componentType)" title="Supprimer">
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
              <td><input type="text" class="form-control-borderless" v-model="newComponentType.type" placeholder="Type" /></td>
              <td class="text-center">
                <div class="action-icons">
                  <div class="icon-container save-container" @click="saveNewComponentType" title="Enregistrer">
                    <font-awesome-icon icon="save"></font-awesome-icon>
                  </div>
                  <div class="icon-container cancel-container" @click="cancelNewComponentType" title="Annuler">
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
            <tr v-if="paginatedComponentTypes.length === 0 && !showAddRow">
              <td colspan="2" class="empty-message">No componenet type available</td>
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
            id="sdiFrontendApp.componentType.delete.question"
            data-cy="componentTypeDeleteDialogHeading"
            v-text="t$('entity.delete.title')"
            class="font-weight-bold"
          ></span>
        </div>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-componentType-heading"
          class="mb-0"
          v-text="t$('sdiFrontendApp.componentType.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-componentType"
              data-cy="entityConfirmDeleteButton"
              v-text="t$('entity.action.delete')"
              @click="removeComponentType()"
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

<script lang="ts" src="./component-type.component.ts"></script>

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

.component-type-container {
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

.component-type-card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.component-type-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.component-type-card .card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
}

.component-type-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-weight: 600;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.info-value {
  color: #212529;
}

.dropdown-menu {
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 0.875rem;
  color: #212529;
  background-color: #fff;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.25rem;
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: flex;
  align-items: center;
  padding: 0.5rem 1.5rem;
  font-weight: 400;
  color: #212529;
  cursor: pointer;
}

.dropdown-item:hover {
  background-color: #f8f9fa;
  text-decoration: none;
}

.new-card {
  border: 1px dashed #dee2e6;
  background-color: #f8f9fa;
}
</style>
