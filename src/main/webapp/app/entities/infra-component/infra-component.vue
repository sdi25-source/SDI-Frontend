<template>
  <div class="infra-component-container section pt-5">
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
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="InfraComponentHeading">
          <span v-text="t$('sdiFrontendApp.infraComponent.home.title')" id="infra-component-heading"></span>
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
    <div class="card" v-if="infraComponents && viewMode === 'list'">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="infraComponents">
          <thead class="thead-light">
            <tr>
              <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponent.name')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponent.vendor')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponent.notes')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponent.createDate')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponent.componentType')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.versions')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="infraComponent in paginatedInfraComponents" :key="infraComponent.id" data-cy="entityTable" class="align-middle">
              <td>
                <template v-if="infraComponent.isEditing">
                  <input v-model="infraComponent.name" type="text" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ infraComponent.name }}
                </template>
              </td>
              <td>
                <template v-if="infraComponent.isEditing">
                  <input v-model="infraComponent.vendor" type="text" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ infraComponent.vendor }}
                </template>
              </td>
              <td class="text-truncate" style="max-width: 200px" :title="infraComponent.notes">
                <template v-if="infraComponent.isEditing">
                  <input v-model="infraComponent.notes" type="text" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ infraComponent.notes }}
                </template>
              </td>
              <td>
                <template v-if="infraComponent.isEditing">
                  <input v-model="infraComponent.createDate" type="date" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ infraComponent.createDate }}
                </template>
              </td>
              <td>
                <template v-if="infraComponent.isEditing">
                  <select v-model="infraComponent.componentType" class="form-control-borderless">
                    <option v-for="type in componentTypes" :key="type.id" :value="type">
                      {{ type.type }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  <div v-if="infraComponent.componentType">
                    {{ infraComponent.componentType.type }}
                  </div>
                </template>
              </td>
              <td>
                <button
                  class="alert alert-primary d-inline-flex align-items-center py-1 px-2 btn-sm"
                  style="font-size: 0.9rem; line-height: 1; gap: 0.25rem; margin-top: 0px; margin-bottom: 0px"
                  @click="openVersionsModal(infraComponent)"
                >
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="14"
                    height="14"
                    fill="currentColor"
                    class="bi bi-layers"
                    viewBox="0 0 512 512"
                  >
                    <path
                      d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5L0 80C0 53.5 21.5 32 48 32l149.5 0c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
                    />
                  </svg>
                  Versions
                </button>
              </td>
              <td class="text-center">
                <div class="btn-group">
                  <template v-if="infraComponent.isEditing">
                    <div class="icon-container save-container" @click="saveInfraComponent(infraComponent)" title="Enregistrer">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                        <path
                          d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div class="icon-container cancel-container" @click="cancelEdit(infraComponent)" title="Annuler">
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
                      <div class="icon-container edit-container" @click="editInfraComponent(infraComponent)" title="Modifier">
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
                      <div class="icon-container delete-container" @click="prepareRemove(infraComponent)" title="Supprimer">
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
              <td><input type="text" class="form-control-borderless" v-model="newInfraComponent.name" placeholder="Nom" /></td>
              <td><input type="text" class="form-control-borderless" v-model="newInfraComponent.vendor" placeholder="Fournisseur" /></td>
              <td><input type="text" class="form-control-borderless" v-model="newInfraComponent.notes" placeholder="Notes" /></td>
              <td>
                <input type="date" class="form-control-borderless" v-model="newInfraComponent.createDate" placeholder="Date de création" />
              </td>
              <td>
                <select v-model="newInfraComponent.componentType" class="form-control-borderless">
                  <option value="">-- Sélectionner un type --</option>
                  <option v-for="type in componentTypes" :key="type.id" :value="type">
                    {{ type.type }}
                  </option>
                </select>
              </td>
              <td></td>
              <td class="text-center">
                <div class="action-icons">
                  <div class="icon-container save-container" @click="saveNewInfraComponent" title="Enregistrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                      <path
                        d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div class="icon-container cancel-container" @click="cancelNewInfraComponent" title="Annuler">
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
    <div v-if="infraComponents && viewMode === 'card'" class="card-view-container">
      <div class="row">
        <div v-for="infraComponent in paginatedInfraComponents" :key="infraComponent.id" class="col-md-4 col-lg-3 mb-4">
          <div class="card h-100 infra-component-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 font-weight-bold">
                <router-link class="text-primary" :to="{ name: 'InfraComponentView', params: { infraComponentId: infraComponent.id } }">
                  #{{ infraComponent.id }}
                </router-link>
              </h6>
              <div class="dropdown">
                <button class="btn btn-sm btn-light" @click="toggleDropdown(infraComponent)">
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
                <div class="dropdown-menu dropdown-menu-right" :class="{ show: infraComponent.showDropdown }">
                  <a class="dropdown-item" @click="editInfraComponent(infraComponent)">
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
                  <a class="dropdown-item" @click="prepareRemove(infraComponent)">
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
                  <router-link class="dropdown-item" :to="{ name: 'InfraComponentView', params: { infraComponentId: infraComponent.id } }">
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
                  <a class="dropdown-item" @click="openVersionsModal(infraComponent)">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-layers mr-2"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0l3.515-1.874zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z"
                      />
                    </svg>
                    Versions
                  </a>
                </div>
              </div>
            </div>
            <div class="card-body">
              <div class="mb-3">
                <h5 class="card-title">{{ infraComponent.name }}</h5>
                <h6 class="card-subtitle mb-2 text-muted">{{ infraComponent.vendor }}</h6>
              </div>
              <div class="mb-2">
                <small class="text-muted">Notes:</small>
                <p class="card-text text-truncate" :title="infraComponent.notes">{{ infraComponent.notes || 'N/A' }}</p>
              </div>
              <div class="mb-2">
                <small class="text-muted">Date de création:</small>
                <p class="card-text">{{ infraComponent.createDate || 'N/A' }}</p>
              </div>
              <div>
                <small class="text-muted">Type de composant:</small>
                <p class="card-text">
                  <router-link
                    v-if="infraComponent.componentType"
                    :to="{ name: 'ComponentTypeView', params: { componentTypeId: infraComponent.componentType.id } }"
                  >
                    {{ infraComponent.componentType.type }}
                  </router-link>
                  <span v-else>N/A</span>
                </p>
              </div>
              <div class="mt-3">
                <button class="btn btn-info btn-sm w-100" @click="openVersionsModal(infraComponent)">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="16"
                    height="16"
                    fill="currentColor"
                    class="bi bi-layers mr-1"
                    viewBox="0 0 16 16"
                  >
                    <path
                      d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0l3.515-1.874zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z"
                    />
                  </svg>
                  Gérer les versions
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Confirmation modal -->
    <b-modal ref="removeEntity" id="removeEntity">
      <template #modal-title>
        <span
          id="sdiFrontendApp.infraComponent.delete.question"
          data-cy="infraComponentDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-infraComponent-heading" v-text="t$('sdiFrontendApp.infraComponent.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-infraComponent"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeInfraComponent()"
          ></button>
        </div>
      </template>
    </b-modal>

    <!-- Modal pour les versions -->
    <b-modal ref="versionsModal" id="versionsModal" size="xl" title-class="text-primary" hide-footer>
      <template #modal-title>
        <div class="d-flex align-items-center">
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="currentColor" class="bi bi-layers" viewBox="0 0 512 512">
            <path
              d="M345 39.1L472.8 168.4c52.4 53 52.4 138.2 0 191.2L360.8 472.9c-9.3 9.4-24.5 9.5-33.9 .2s-9.5-24.5-.2-33.9L438.6 325.9c33.9-34.3 33.9-89.4 0-123.7L310.9 72.9c-9.3-9.4-9.2-24.6 .2-33.9s24.6-9.2 33.9 .2zM0 229.5L0 80C0 53.5 21.5 32 48 32l149.5 0c17 0 33.3 6.7 45.3 18.7l168 168c25 25 25 65.5 0 90.5L277.3 442.7c-25 25-65.5 25-90.5 0l-168-168C6.7 262.7 0 246.5 0 229.5zM144 144a32 32 0 1 0 -64 0 32 32 0 1 0 64 0z"
            />
          </svg>
          <span class="font-weight-bold pl-2">{{ selectedComponent ? selectedComponent.name : '' }} versions</span>
        </div>
      </template>
      <div class="versions-modal-content">
        <div class="infra-component-version-container">
          <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
            <div class="d-flex align-items-center">
              <button @click="showAddVersionRow = true" class="btn btn-primary btn-sm mr-3" :disabled="showAddVersionRow">
                <span v-text="t$('global.new')"></span>
              </button>
            </div>

            <div class="search-container">
              <div class="input-group">
                <input type="text" class="form-control" placeholder="Search..." v-model="versionSearchTerm" @input="handleVersionSearch" />
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
                <span class="text-muted small">{{ versionPaginationInfo }}</span>
              </div>
              <div class="pagination-arrows d-flex">
                <button class="btn btn-light btn-sm mr-1" :disabled="isVersionPrevDisabled" @click="goToVersionPrevPage">
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
                <button class="btn btn-light btn-sm" :disabled="isVersionNextDisabled" @click="goToVersionNextPage">
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
                <button class="btn btn-light btn-sm" :class="{ active: versionViewMode === 'list' }" @click="versionViewMode = 'list'">
                  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-list" viewBox="0 0 16 16">
                    <path
                      fill-rule="evenodd"
                      d="M2.5 12a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5zm0-4a.5.5 0 0 1 .5-.5h10a.5.5 0 0 1 0 1H3a.5.5 0 0 1-.5-.5z"
                    />
                  </svg>
                </button>
                <button class="btn btn-light btn-sm" :class="{ active: versionViewMode === 'card' }" @click="versionViewMode = 'card'">
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
          <div class="card" v-if="filteredVersions && versionViewMode === 'list'">
            <div class="table-responsive">
              <table class="table table-hover mb-0" aria-describedby="infraComponentVersions">
                <thead class="thead-light">
                  <tr>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponentVersion.version')"></span></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponentVersion.description')"></span></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponentVersion.createDate')"></span></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponentVersion.updateDate')"></span></th>
                    <th scope="col" width="160" class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-for="version in paginatedVersions" :key="version.id" data-cy="entityTable" class="align-middle">
                    <td>
                      <template v-if="version.isEditing">
                        <input v-model="version.version" type="text" class="form-control-borderless" />
                      </template>
                      <template v-else>
                        {{ version.version }}
                      </template>
                    </td>
                    <td class="text-truncate" style="max-width: 250px" :title="version.description">
                      <template v-if="version.isEditing">
                        <input v-model="version.description" type="text" class="form-control-borderless" />
                      </template>
                      <template v-else>
                        {{ version.description }}
                      </template>
                    </td>
                    <td>
                      <template v-if="version.isEditing">
                        <input v-model="version.createDate" type="date" class="form-control-borderless" />
                      </template>
                      <template v-else>
                        {{ version.createDate }}
                      </template>
                    </td>
                    <td>
                      <template v-if="version.isEditing">
                        <input v-model="version.updateDate" type="date" class="form-control-borderless" />
                      </template>
                      <template v-else>
                        {{ version.updateDate }}
                      </template>
                    </td>
                    <td class="text-center">
                      <div class="action-icons">
                        <template v-if="version.isEditing">
                          <div class="icon-container save-container" @click="saveInfraComponentVersion(version)" title="Enregistrer">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                              <path
                                d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                          <div class="icon-container cancel-container" @click="cancelVersionEdit(version)" title="Annuler">
                            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-cancel">
                              <path
                                d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                                fill="currentColor"
                              />
                            </svg>
                          </div>
                        </template>
                        <template v-else>
                          <div class="icon-container edit-container" @click="editInfraComponentVersion(version)" title="Modifier">
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
                          <div class="icon-container delete-container" @click="prepareRemoveVersion(version)" title="Supprimer">
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
                        </template>
                      </div>
                    </td>
                  </tr>
                  <tr v-if="showAddVersionRow" class="add-row">
                    <td><input type="text" class="form-control-borderless" v-model="newVersion.version" placeholder="Version" /></td>
                    <td>
                      <input type="text" class="form-control-borderless" v-model="newVersion.description" placeholder="Description" />
                    </td>
                    <td>
                      <input type="date" class="form-control-borderless" v-model="newVersion.createDate" placeholder="Date de création" />
                    </td>
                    <td>
                      <input
                        type="date"
                        class="form-control-borderless"
                        v-model="newVersion.updateDate"
                        placeholder="Date de mise à jour"
                      />
                    </td>
                    <td class="text-center">
                      <div class="action-icons">
                        <div class="icon-container save-container" @click="saveNewVersion" title="Enregistrer">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                            <path
                              d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                        <div class="icon-container cancel-container" @click="cancelNewVersion" title="Annuler">
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

          <!-- Card View pour les versions -->
          <div v-if="filteredVersions && versionViewMode === 'card'" class="card-view-container">
            <div class="row">
              <div v-for="version in paginatedVersions" :key="version.id" class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 infra-component-version-card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 font-weight-bold">
                      <span class="text-primary">#{{ version.id }}</span>
                    </h6>
                    <div class="dropdown">
                      <button class="btn btn-sm btn-light" @click="toggleVersionDropdown(version)">
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
                      <div class="dropdown-menu dropdown-menu-right" :class="{ show: version.showDropdown }">
                        <a class="dropdown-item" @click="editInfraComponentVersion(version)">
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
                        <a class="dropdown-item" @click="prepareRemoveVersion(version)">
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
                    <template v-if="version.isEditing">
                      <div class="form-group">
                        <label>Version</label>
                        <input v-model="version.version" type="text" class="form-control" />
                      </div>
                      <div class="form-group">
                        <label>Description</label>
                        <textarea v-model="version.description" class="form-control" rows="3"></textarea>
                      </div>
                      <div class="form-group">
                        <label>Date de création</label>
                        <input v-model="version.createDate" type="date" class="form-control" />
                      </div>
                      <div class="form-group">
                        <label>Date de mise à jour</label>
                        <input v-model="version.updateDate" type="date" class="form-control" />
                      </div>
                      <div class="d-flex justify-content-end mt-3">
                        <button class="btn btn-sm btn-secondary mr-2" @click="cancelVersionEdit(version)">Annuler</button>
                        <button class="btn btn-sm btn-primary" @click="saveInfraComponentVersion(version)">Enregistrer</button>
                      </div>
                    </template>
                    <template v-else>
                      <div class="infra-component-version-info">
                        <div class="info-row">
                          <span class="info-label">Version:</span>
                          <span class="info-value">{{ version.version }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Description:</span>
                          <span class="info-value notes-text">{{ version.description }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Date de création:</span>
                          <span class="info-value">{{ version.createDate }}</span>
                        </div>
                        <div class="info-row">
                          <span class="info-label">Date de mise à jour:</span>
                          <span class="info-value">{{ version.updateDate }}</span>
                        </div>
                      </div>
                    </template>
                  </div>
                </div>
              </div>

              <!-- Add new version card -->
              <div v-if="showAddVersionRow" class="col-md-4 col-lg-3 mb-4">
                <div class="card h-100 infra-component-version-card new-card">
                  <div class="card-header d-flex justify-content-between align-items-center">
                    <h6 class="mb-0 font-weight-bold text-primary">Nouvelle version</h6>
                  </div>
                  <div class="card-body">
                    <div class="form-group">
                      <label>Version</label>
                      <input v-model="newVersion.version" type="text" class="form-control" placeholder="Version" />
                    </div>
                    <div class="form-group">
                      <label>Description</label>
                      <textarea v-model="newVersion.description" class="form-control" rows="3" placeholder="Description"></textarea>
                    </div>
                    <div class="form-group">
                      <label>Date de création</label>
                      <input v-model="newVersion.createDate" type="date" class="form-control" />
                    </div>
                    <div class="form-group">
                      <label>Date de mise à jour</label>
                      <input v-model="newVersion.updateDate" type="date" class="form-control" />
                    </div>
                    <div class="d-flex justify-content-end mt-3">
                      <button class="btn btn-sm btn-secondary mr-2" @click="cancelNewVersion">Annuler</button>
                      <button class="btn btn-sm btn-primary" @click="saveNewVersion">Enregistrer</button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      <div class="modal-footer"></div>
    </b-modal>

    <!-- Modal suppression version -->
    <b-modal ref="removeVersionEntity" id="removeVersionEntity" centered title-class="text-danger">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <font-awesome-icon icon="exclamation-triangle" class="text-danger mr-2"></font-awesome-icon>
          <span
            id="sdiFrontendApp.infraComponentVersion.delete.question"
            data-cy="infraComponentVersionDeleteDialogHeading"
            v-text="t$('entity.delete.title')"
            class="font-weight-bold"
          ></span>
        </div>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-infraComponentVersion-heading"
          class="mb-0"
          v-text="t$('sdiFrontendApp.infraComponentVersion.delete.question', { id: removeVersionId })"
        ></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeVersionDialog()"></button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-infraComponentVersion"
              data-cy="entityConfirmDeleteButton"
              v-text="t$('entity.action.delete')"
              @click="removeInfraComponentVersion()"
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

<script lang="ts" src="./infra-component.component.ts"></script>

<style scoped>
.infra-component-container {
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

.infra-component-card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.infra-component-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.infra-component-card .card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
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

/* Styles pour le modal des versions */
.versions-modal-content {
  max-height: 70vh;
  overflow-y: auto;
}

.infra-component-version-card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.infra-component-version-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.infra-component-version-info {
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
</style>
