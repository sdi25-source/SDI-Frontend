<template>
  <div class="infra-component-version-container section pt-5">
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
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="InfraComponentVersionHeading">
          <span v-text="t$('sdiFrontendApp.infraComponentVersion.home.title')" id="infra-component-version-heading"></span>
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
    <div class="card" v-if="infraComponentVersions && viewMode === 'list'">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="infraComponentVersions">
          <thead class="thead-light">
            <tr>
              <th scope="col" width="80"><span v-text="t$('global.field.id')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponentVersion.version')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponentVersion.description')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.infraComponentVersion.infraComponent')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr
              v-for="infraComponentVersion in paginatedInfraComponentVersions"
              :key="infraComponentVersion.id"
              data-cy="entityTable"
              class="align-middle"
            >
              <td>
                <router-link
                  class="font-weight-bold text-primary"
                  :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }"
                >
                  {{ infraComponentVersion.id }}
                </router-link>
              </td>
              <td>
                <template v-if="infraComponentVersion.isEditing">
                  <input v-model="infraComponentVersion.version" type="text" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ infraComponentVersion.version }}
                </template>
              </td>
              <td class="text-truncate" style="max-width: 250px" :title="infraComponentVersion.description">
                <template v-if="infraComponentVersion.isEditing">
                  <input v-model="infraComponentVersion.description" type="text" class="form-control-borderless" />
                </template>
                <template v-else>
                  {{ infraComponentVersion.description }}
                </template>
              </td>
              <td>
                <template v-if="infraComponentVersion.isEditing">
                  <select v-model="infraComponentVersion.infraComponent" class="form-control-borderless">
                    <option v-for="component in infraComponents" :key="component.id" :value="component">
                      {{ component.name }}
                    </option>
                  </select>
                </template>
                <template v-else>
                  <div v-if="infraComponentVersion.infraComponent">
                    <router-link
                      :to="{ name: 'InfraComponentView', params: { infraComponentId: infraComponentVersion.infraComponent.id } }"
                    >
                      {{ infraComponentVersion.infraComponent.name }}
                    </router-link>
                  </div>
                </template>
              </td>
              <td class="text-center">
                <div class="action-icons">
                  <template v-if="infraComponentVersion.isEditing">
                    <div
                      class="icon-container save-container"
                      @click="saveInfraComponentVersion(infraComponentVersion)"
                      title="Enregistrer"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                        <path
                          d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                    <div class="icon-container cancel-container" @click="cancelEdit(infraComponentVersion)" title="Annuler">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-cancel">
                        <path
                          d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </template>
                  <template v-else>
                    <div class="icon-container edit-container" @click="editInfraComponentVersion(infraComponentVersion)" title="Modifier">
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
                    <div class="icon-container delete-container" @click="prepareRemove(infraComponentVersion)" title="Supprimer">
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
                    <router-link
                      :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }"
                      custom
                      v-slot="{ navigate }"
                    >
                      <div class="icon-container view-container" @click="navigate" data-cy="entityDetailsButton" title="Voir">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="26"
                          height="26"
                          fill="currentColor"
                          class="bi bi-arrow-right-short"
                          viewBox="0 0 16 16"
                        >
                          <path
                            fill-rule="evenodd"
                            d="M4 8a.5.5 0 0 1 .5-.5h5.793L8.146 5.354a.5.5 0 1 1 .708-.708l3 3a.5.5 0 0 1 0 .708l-3 3a.5.5 0 0 1-.708-.708L10.293 8.5H4.5A.5.5 0 0 1 4 8"
                          />
                        </svg>
                      </div>
                    </router-link>
                  </template>
                </div>
              </td>
            </tr>
            <tr v-if="showAddRow" class="add-row">
              <td>—</td>
              <td>
                <input type="text" class="form-control-borderless" v-model="newInfraComponentVersion.version" placeholder="Version" />
              </td>
              <td>
                <input
                  type="text"
                  class="form-control-borderless"
                  v-model="newInfraComponentVersion.description"
                  placeholder="Description"
                />
              </td>
              <td>
                <select class="form-control-borderless" v-model="newInfraComponentVersion.infraComponent">
                  <option v-for="component in infraComponents" :key="component.id" :value="component">
                    {{ component.name }}
                  </option>
                </select>
              </td>
              <td class="text-center">
                <div class="action-icons">
                  <div class="icon-container save-container" @click="saveNewInfraComponentVersion" title="Enregistrer">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save">
                      <path
                        d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div class="icon-container cancel-container" @click="cancelNewInfraComponentVersion" title="Annuler">
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
    <div v-if="infraComponentVersions && viewMode === 'card'" class="card-view-container">
      <div class="row">
        <div
          v-for="infraComponentVersion in paginatedInfraComponentVersions"
          :key="infraComponentVersion.id"
          class="col-md-4 col-lg-3 mb-4"
        >
          <div class="card h-100 infra-component-version-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 font-weight-bold">
                <router-link
                  class="text-primary"
                  :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }"
                >
                  #{{ infraComponentVersion.id }}
                </router-link>
              </h6>
              <div class="dropdown">
                <button class="btn btn-sm btn-light" @click="toggleDropdown(infraComponentVersion)">
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
                <div class="dropdown-menu dropdown-menu-right" :class="{ show: infraComponentVersion.showDropdown }">
                  <a class="dropdown-item" @click="editInfraComponentVersion(infraComponentVersion)">
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
                  <a class="dropdown-item" @click="prepareRemove(infraComponentVersion)">
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
                  <router-link
                    class="dropdown-item"
                    :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }"
                  >
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
                </div>
              </div>
            </div>
            <div class="card-body">
              <template v-if="infraComponentVersion.isEditing">
                <div class="form-group">
                  <label>Version</label>
                  <input v-model="infraComponentVersion.version" type="text" class="form-control" />
                </div>
                <div class="form-group">
                  <label>Description</label>
                  <textarea v-model="infraComponentVersion.description" class="form-control" rows="3"></textarea>
                </div>
                <div class="form-group">
                  <label>Composant d'infrastructure</label>
                  <select v-model="infraComponentVersion.infraComponent" class="form-control">
                    <option v-for="component in infraComponents" :key="component.id" :value="component">
                      {{ component.name }}
                    </option>
                  </select>
                </div>
                <div class="d-flex justify-content-end mt-3">
                  <button class="btn btn-sm btn-secondary mr-2" @click="cancelEdit(infraComponentVersion)">Annuler</button>
                  <button class="btn btn-sm btn-primary" @click="saveInfraComponentVersion(infraComponentVersion)">Enregistrer</button>
                </div>
              </template>
              <template v-else>
                <div class="infra-component-version-info">
                  <div class="info-row">
                    <span class="info-label">Version:</span>
                    <span class="info-value">{{ infraComponentVersion.version }}</span>
                  </div>
                  <div class="info-row">
                    <span class="info-label">Description:</span>
                    <span class="info-value notes-text">{{ infraComponentVersion.description }}</span>
                  </div>
                  <div class="info-row" v-if="infraComponentVersion.infraComponent">
                    <span class="info-label">Composant d'infrastructure:</span>
                    <span class="info-value">
                      <router-link
                        :to="{ name: 'InfraComponentView', params: { infraComponentId: infraComponentVersion.infraComponent.id } }"
                      >
                        {{ infraComponentVersion.infraComponent.name }}
                      </router-link>
                    </span>
                  </div>
                </div>
              </template>
            </div>
          </div>
        </div>

        <!-- Add new card -->
        <div v-if="showAddRow" class="col-md-4 col-lg-3 mb-4">
          <div class="card h-100 infra-component-version-card new-card">
            <div class="card-header d-flex justify-content-between align-items-center">
              <h6 class="mb-0 font-weight-bold text-primary">Nouvelle version</h6>
            </div>
            <div class="card-body">
              <div class="form-group">
                <label>Version</label>
                <input v-model="newInfraComponentVersion.version" type="text" class="form-control" placeholder="Version" />
              </div>
              <div class="form-group">
                <label>Description</label>
                <textarea v-model="newInfraComponentVersion.description" class="form-control" rows="3" placeholder="Description"></textarea>
              </div>
              <div class="form-group">
                <label>Composant d'infrastructure</label>
                <select v-model="newInfraComponentVersion.infraComponent" class="form-control">
                  <option v-for="component in infraComponents" :key="component.id" :value="component">
                    {{ component.name }}
                  </option>
                </select>
              </div>
              <div class="d-flex justify-content-end mt-3">
                <button class="btn btn-sm btn-secondary mr-2" @click="cancelNewInfraComponentVersion">Annuler</button>
                <button class="btn btn-sm btn-primary" @click="saveNewInfraComponentVersion">Enregistrer</button>
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
          v-text="t$('sdiFrontendApp.infraComponentVersion.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
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

<script lang="ts" src="./infra-component-version.component.ts"></script>

<style scoped>
.infra-component-version-container {
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

.infra-component-version-card .card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
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
