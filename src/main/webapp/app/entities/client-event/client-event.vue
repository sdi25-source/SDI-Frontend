<template>
  <div class="client-event-container section pt-5">
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <router-link :to="{ name: 'ClientEventCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn button-primary btn-sm mr-3 rounded-1"
            v-if="hasAnyAuthority('ROLE_COMMERCIAL')"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('global.new')"></span>
          </button>
        </router-link>
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="ClientEventHeading">
          <span v-text="t$('sdiFrontendApp.clientEvent.home.title')" id="client-event-heading"></span>
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
        <div class="filter-item mr-3 ml-1">
          <span class="filter-label">Client</span>
          <select v-model="selectedClientFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Clients</option>
            <option v-for="client in clients" :key="client.id" :value="client">
              {{ client.name }}
            </option>
          </select>
        </div>

        <div class="filter-item mr-3">
          <span class="filter-label">Event Type</span>
          <select v-model="selectedEventTypeFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Event Types</option>
            <option v-for="eventType in clientEventTypes" :key="eventType.id" :value="eventType">
              {{ eventType.type }}
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
    <div class="card" v-if="clientEvents">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="clientEvents">
          <thead class="thead-light">
            <tr>
              <th scope="col"></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.clientEvent.event')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.clientEvent.client')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.clientEvent.clientEventType')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.clientEvent.eventDate')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="clientEvent in paginatedClientEvents" :key="clientEvent.id" data-cy="entityTable" class="align-middle">
              <td></td>
              <td>{{ clientEvent.event }}</td>
              <td>
                <div v-if="clientEvent.client">
                  <router-link :to="{ name: 'ClientView', params: { clientId: clientEvent.client.id } }">{{
                    clientEvent.client.name
                  }}</router-link>
                </div>
              </td>
              <td>
                <div>
                  <span class="event-type-badge type-other">{{ clientEvent.clientEventType.type }}</span>
                </div>
              </td>
              <td>{{ clientEvent.eventDate }}</td>

              <td class="text-center">
                <div class="action-icons">
                  <router-link
                    :to="{ name: 'ClientEventEdit', params: { clientEventId: clientEvent.id } }"
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
                  <router-link :to="{ name: 'ClientEventView', params: { clientEventId: clientEvent.id } }" custom v-slot="{ navigate }">
                    <div @click="navigate" class="icon-container view-container" data-cy="entityDetailsButton">
                      <font-awesome-icon icon="eye"></font-awesome-icon>
                    </div>
                  </router-link>
                  <div
                    class="icon-container delete-container"
                    @click="prepareRemove(clientEvent)"
                    title="Supprimer"
                    data-cy="entityDeleteButton"
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
            <tr v-if="paginatedClientEvents.length === 0">
              <td colspan="6" class="empty-message">No clients events available</td>
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
            id="sdiFrontendApp.clientEvent.delete.question"
            data-cy="clientEventDeleteDialogHeading"
            v-text="t$('entity.delete.title')"
            class="font-weight-bold"
          ></span>
        </div>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-clientEvent-heading" class="mb-0" v-text="t$('sdiFrontendApp.clientEvent.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-clientEvent"
              data-cy="entityConfirmDeleteButton"
              v-text="t$('entity.action.delete')"
              @click="removeClientEvent()"
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

<script lang="ts" src="./client-event.component.ts"></script>

<style scoped>
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
.type-other {
  background-color: #e2e3e5;
  color: #41464b;
}
.event-type-badge {
  display: inline-block;
  padding: 0.25rem 0.75rem;
  border-radius: 1rem;
  font-size: 0.75rem;
  font-weight: 600;
  text-align: center;
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

.client-event-container {
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
.empty-message {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px dashed #e2e8f0;
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

.edit-container {
  color: #0c2d57;
}

.delete-container {
  color: #0c2d57;
}

.view-container {
  color: #0c2d57;
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
}
</style>
