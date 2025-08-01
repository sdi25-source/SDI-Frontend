<template>
  <div class="client-container section pt-5">
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <!-- Dropdown Actions -->
        <div class="dropdown mr-3">
          <button
            class="btn button-primary btn-sm dropdown-toggle rounded-1"
            type="button"
            id="actionsDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            @click="toggleActionsDropdown"
          >
            Actions
          </button>
          <ul class="dropdown-menu" :class="{ show: showActionsDropdown }" aria-labelledby="actionsDropdown">
            <li>
              <router-link :to="{ name: 'ClientCreate' }" custom v-slot="{ navigate }" v-if="hasAnyAuthority('ROLE_COMMERCIAL')">
                <button
                  @click="
                    navigate();
                    closeActionsDropdown();
                  "
                  class="dropdown-item"
                  data-cy="entityCreateButton"
                >
                  <i class="bi bi-plus mr-2"></i>
                  <span v-text="t$('global.new')"></span>
                </button>
              </router-link>
            </li>
            <li>
              <button
                @click="
                  exportToCSV();
                  closeActionsDropdown();
                "
                class="dropdown-item"
                :disabled="!clients || clients.length === 0 || isExporting"
              >
                <i class="bi bi-box-arrow-up mr-2"></i>
                <span>{{ isExporting ? 'Export in progress ...' : 'Export CSV' }}</span>
              </button>
            </li>
            <li>
              <button
                @click="
                  openImportModal();
                  closeActionsDropdown();
                "
                class="dropdown-item"
                v-if="hasAnyAuthority('ROLE_COMMERCIAL')"
              >
                <i :class="isExporting ? 'bi bi-arrow-clockwise spin' : 'bi bi-box-arrow-down'" class="mr-2"></i>
                <span>Importer CSV</span>
              </button>
            </li>
          </ul>
        </div>

        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="ClientHeading">
          <span v-text="t$('sdiFrontendApp.client.home.title')" id="client-heading"></span>
          <font-awesome-icon icon="cog" class="text-secondary" style="font-size: 0.8em"></font-awesome-icon>
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
        <!-- Filters -->
        <div class="filter-item mr-3">
          <span class="filter-label">Client Type</span>
          <select v-model="selectedClientTypeFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Client Types</option>
            <option v-for="clientType in clientTypes" :key="clientType.id" :value="clientType">
              {{ clientType.type }}
            </option>
          </select>
        </div>
        <div class="filter-item mr-3">
          <span class="filter-label">Client Size</span>
          <select v-model="selectedClientSizeFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Client Sizes</option>
            <option v-for="clientSize in clientSizes" :key="clientSize.id" :value="clientSize">
              {{ clientSize.sizeName }}
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
      </div>
    </div>

    <!-- Data table (List View) -->
    <div class="card" v-if="clients && viewMode === 'list'">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="clients">
          <thead class="thead-light">
            <tr>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.clientLogo')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.name')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.code')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.mainContactName')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.mainContactEmail')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.mainContactPhoneNumber')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.clientType')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.size')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in paginatedClients" :key="client.id" data-cy="entityTable" class="align-middle">
              <td>
                <img
                  v-if="client.clientLogo"
                  :src="client.clientLogo"
                  :alt="client.name + ' logo'"
                  class="client-logo"
                  width="60"
                  height="60"
                />
                <span v-else>-</span>
              </td>
              <td>{{ client.name }}</td>
              <td>{{ client.code }}</td>
              <td>{{ client.mainContactName }}</td>
              <td>{{ client.mainContactEmail }}</td>
              <td>{{ client.mainContactPhoneNumber }}</td>
              <td>
                <div v-if="client.clientType">
                  {{ client.clientType.type }}
                </div>
              </td>
              <td>
                <div v-if="client.size">
                  {{ client.size.sizeName }}
                </div>
              </td>
              <td class="text-center">
                <div class="action-icons">
                  <router-link
                    :to="{ name: 'ClientEdit', params: { clientId: client.id } }"
                    custom
                    v-slot="{ navigate }"
                    v-if="hasAnyAuthority('ROLE_COMMERCIAL')"
                  >
                    <div @click="navigate" class="icon-container edit-container" data-cy="entityEditButton">
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
                  </router-link>
                  <router-link :to="{ name: 'ClientView', params: { clientId: client.id } }" custom v-slot="{ navigate }">
                    <div @click="navigate" class="icon-container edit-container" data-cy="entityDetailsButton">
                      <font-awesome-icon icon="eye"></font-awesome-icon>
                    </div>
                  </router-link>
                  <div
                    class="icon-container delete-container"
                    @click="prepareRemove(client)"
                    title="Supprimer"
                    v-if="hasAnyAuthority('ROLE_COMMERCIAL')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                      <path
                        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedClients.length === 0">
              <td colspan="9" class="empty-message">No customers available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!--  Modal suppression -->
    <div class="modal-backdrop" v-if="removeEntity" @click="closeDialog()"></div>
    <div class="modal-container" v-if="removeEntity" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-danger">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-exclamation-triangle mr-2"
              viewBox="0 0 16 16"
            >
              <path
                d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"
              />
              <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
            </svg>
            <span v-text="t$('entity.delete.title')"></span>
          </h5>
          <button type="button" class="close-button" @click="closeDialog()" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p>
            <strong v-text="t$('sdiFrontendApp.client.delete.question', {})"></strong>
          </p>
          <p v-text="t$('entity.delete.irreversible')"></p>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary rounded-2"
            @click="closeDialog()"
            v-text="t$('sdiFrontendApp.requestOfChange.delete.cancel')"
          ></button>
          <button
            type="button"
            class="btn btn-danger rounded-2"
            @click="removeClient()"
            v-text="t$('sdiFrontendApp.requestOfChange.delete.delete')"
          ></button>
        </div>
      </div>
    </div>

    <!-- Modal Import -->
    <b-modal ref="importModal" id="importModal" centered title="Importer des clients">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <font-awesome-icon icon="upload" class="text-primary mr-2"></font-awesome-icon>
          <span class="font-weight-bold">Import clients</span>
        </div>
      </template>
      <div class="modal-body">
        <div class="mb-3">
          <label for="csvFile" class="form-label">Select a CSV file</label>
          <input type="file" class="form-control" id="csvFile" accept=".csv" @change="handleFileSelect" ref="fileInput" />
          <small class="form-text text-muted"> The file must contain the columns: name, code, main contact, email, telephone </small>
        </div>
        <div v-if="importPreview.length > 0" class="mt-3">
          <h6>Data preview ({{ importPreview.length }} lignes) :</h6>
          <div class="table-responsive" style="max-height: 200px; overflow-y: auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Code</th>
                  <th>Contact</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in importPreview.slice(0, 5)" :key="index">
                  <td>{{ row.name }}</td>
                  <td>{{ row.code }}</td>
                  <td>{{ row.mainContactName }}</td>
                  <td>{{ row.mainContactEmail }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="closeImportModal()">Cancel</button>
            <button type="button" class="btn btn-primary" :disabled="importPreview.length === 0 || isImporting" @click="processImport()">
              <font-awesome-icon
                :icon="isImporting ? 'spinner' : 'upload'"
                :class="{ 'fa-spin': isImporting }"
                class="mr-2"
              ></font-awesome-icon>
              {{ isImporting ? 'Importing...' : `Importer ${importPreview.length} clients` }}
            </button>
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

<script lang="ts" src="./client.component.ts"></script>

<style scoped>
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
  max-width: 1000px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
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
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
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
  padding: 1.25rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

/* Styles existants conservés */
.empty-message {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px dashed #e2e8f0;
}

/* Styles pour le dropdown Actions */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 0.875rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.375rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: #1e2125;
  background-color: #e9ecef;
}

.dropdown-item:disabled {
  color: #6c757d;
  pointer-events: none;
  background-color: transparent;
}

.dropdown-item .mr-2 {
  margin-right: 0.5rem;
}

/* Styles pour les filtres et autres éléments existants */
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

/* Styles pour les modales */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-backdrop-blur {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1040;
}

.content-blurred {
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
}

.modal-improved {
  z-index: 1050;
  position: relative;
}

.modal-content {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 8px;
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.close {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6c757d;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.close:hover {
  opacity: 1;
  color: #343a40;
}

.scrollable-form {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 0rem;
}

/* Styles existants conservés */
.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #012970;
  margin-bottom: 5px;
}

.client-container {
  padding: 1.5rem;
}

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.button-primary:hover {
  background-color: #26538a;
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

.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-view-container {
  margin-top: 1.5rem;
}

.client-card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.client-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.client-type-card .card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
}

.client-info {
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

.notes-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.new-card {
  border: 1px dashed #dee2e6;
  background-color: #f8f9fa;
}

.user-form-container {
  padding: 0;
  max-width: 100%;
}

.user-edit {
  padding: 0;
  background-color: transparent;
}
</style>
