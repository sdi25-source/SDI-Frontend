<template>
  <div class="request-of-change-container section pt-5">
    <!-- Navigation Bar -->
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <button
          @click="openCreateRequestModal"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn button-primary btn-sm mr-3 rounded-1"
        >
          <span v-text="t$('global.new')"></span>
        </button>
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="RequestOfChangeHeading">
          <span v-text="t$('sdiFrontendApp.requestOfChange.home.title')" id="request-of-change-heading"></span>
        </h5>
      </div>

      <!-- Search Bar -->
      <div class="search-container">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Search..." v-model="searchTerm" @input="handleSearch" />
          <div class="input-group-append">
            <button class="btn btn-outline-secondary rounded-2" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <!-- Action Buttons -->
      <div class="d-flex align-items-center">
        <button class="btn btn-light btn-sm ml-3 rounded-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.requestOfChange.home.refreshListLabel')"></span>
        </button>
      </div>
    </div>

    <!-- Tabs Navigation -->
    <div class="vercel-tabs-container">
      <div class="tabs-header position-relative">
        <!-- Hover Highlight -->
        <div
          class="absolute-tab-highlight hover-highlight"
          :style="{
            left: `${hoverStyle.left}px`,
            width: `${hoverStyle.width}px`,
            opacity: hoveredIndex !== null ? 1 : 0,
          }"
        ></div>

        <!-- Active Indicator -->
        <div
          class="absolute-tab-highlight active-indicator"
          :style="{
            left: `${activeStyle.left}px`,
            width: `${activeStyle.width}px`,
          }"
        ></div>

        <!-- Tabs -->
        <div class="tabs-list">
          <div
            v-for="(status, index) in statusTabs"
            :key="status.value"
            :ref="
              el => {
                if (el) tabRefs[index] = el;
              }
            "
            class="tab-item"
            :class="{
              active: index === activeTabIndex,
              'status-tab-pending': status.value === 'PENDING',
              'status-tab-approved': status.value === 'APPROVED',
              'status-tab-rejected': status.value === 'REJECTED',
              'status-tab-completed': status.value === 'COMPLETED',
            }"
            @mouseenter="setHoveredIndex(index)"
            @mouseleave="setHoveredIndex(null)"
            @click="setActiveTabIndex(index)"
          >
            {{ status.label }} ({{ getRequestCountByStatus(status.value) }})
          </div>
        </div>
      </div>

      <!-- Tab Content -->
      <div class="tab-content mt-4">
        <div v-for="(status, index) in statusTabs" :key="status.value" v-show="activeTabIndex === index">
          <div class="card">
            <div class="table-responsive">
              <table class="table table-hover mb-0" aria-describedby="requestOfChanges">
                <thead class="thead-light">
                  <tr>
                    <th scope="col" width="50"></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.requestOfChange.title')"></span></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.requestOfChange.client')"></span></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.requestOfChange.productVersion')"></span></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.requestOfChange.customisationLevel')"></span></th>
                    <th scope="col"><span>Modules affect</span></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.requestOfChange.createDate')"></span></th>
                    <th scope="col" width="160" class="text-center">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr
                    v-for="request in getRequestsByStatus(status.value)"
                    :key="request.id"
                    data-cy="entityTable"
                    class="align-middle"
                    :class="{ 'selected-row': selectedRequest && selectedRequest.id === request.id }"
                  >
                    <td class="text-center">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :id="`request-${request.id}`"
                          :checked="selectedRequest && selectedRequest.id === request.id"
                          @change="toggleRequestSelection(request)"
                        />
                      </div>
                    </td>
                    <td>{{ request.title }}</td>
                    <td>
                      <div v-if="request.client">
                        {{ request.client.code }}
                      </div>
                    </td>
                    <td>
                      <div v-if="request.productVersion">
                        {{ request.productVersion.product?.name }} {{ ' - ' }} {{ request.productVersion.version }}
                      </div>
                    </td>
                    <td>
                      <div class="badge bg-light text-dark p-2 rounded-pill">
                        {{ request.customisationLevel?.level }}
                      </div>
                    </td>

                    <td>
                      <div
                        class="alert alert-primary d-inline-flex align-items-center py-1 px-2 btn-sm"
                        style="font-size: 0.9rem; line-height: 1; gap: 0.25rem; margin-top: 0px; margin-bottom: 0px; cursor: pointer"
                        @click="viewRequestModules(request)"
                        title="Voir les modules"
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
                        Modules
                      </div>
                    </td>
                    <td>{{ formatDate(request.createDate) }}</td>
                    <td class="text-center">
                      <div class="action-icons">
                        <div class="icon-container edit-container" @click="editRequest(request)" title="Modifier">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="14"
                            height="14"
                            fill="currentColor"
                            class="bi bi-pencil-fill"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"
                            />
                          </svg>
                        </div>
                        <div class="icon-container delete-container" @click="prepareRemove(request)" title="Supprimer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
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
                    </td>
                  </tr>
                  <tr v-if="getRequestsByStatus(status.value).length === 0">
                    <td colspan="8" class="text-center py-3">
                      <span class="text-muted">Aucune demande de changement avec ce statut</span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Detailed View Section (appears when a request is selected) -->
    <div v-if="selectedRequest" class="mt-4">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <h6 class="m-0">{{ selectedRequest.title }}</h6>
          <button class="btn btn-sm btn-outline-secondary rounded-1" @click="deselectRequest">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            <span v-text="t$('sdiFrontendApp.requestOfChange.back')"></span>
          </button>
        </div>
        <div class="card-body">
          <!-- Arrow Progress Steps -->
          <div class="container-fluid mb-4 px-0">
            <div class="wrapper">
              <div class="arrow-steps clearfix">
                <div
                  class="step"
                  :class="{
                    current: isStepActive('PENDING') || isStepActive('APPROVED') || isStepActive('COMPLETED'),
                    done: isStepCompleted('PENDING') && !isStepActive('REJECTED'),
                  }"
                >
                  <span>
                    <svg
                      v-if="isStepCompleted('PENDING') && !isStepActive('REJECTED')"
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      class="mr-2"
                    >
                      <path
                        d="M20.285 5.515a.75.75 0 00-1.06-.011L9.12 15.66l-4.65-4.65a.75.75 0 00-1.06 1.06l5.16 5.16a.75.75 0 001.06 0l10.71-10.65a.75.75 0 00-.045-1.055z"
                      />
                    </svg>
                    <span v-text="t$('sdiFrontendApp.RequestStatus.PENDING')"></span>
                  </span>
                </div>
                <div
                  class="step ml-2 mr-2"
                  :class="{
                    current: isStepActive('APPROVED') || isStepActive('COMPLETED'),
                    done: isStepCompleted('APPROVED') && !isStepActive('REJECTED') && isStepActive('COMPLETED'),
                  }"
                >
                  <span>
                    <svg
                      v-if="
                        (isStepCompleted('APPROVED') && !isStepActive('REJECTED') && isStepActive('COMPLETED')) || isStepActive('APPROVED')
                      "
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      class="mr-2"
                    >
                      <path
                        d="M20.285 5.515a.75.75 0 00-1.06-.011L9.12 15.66l-4.65-4.65a.75.75 0 00-1.06 1.06l5.16 5.16a.75.75 0 001.06 0l10.71-10.65a.75.75 0 00-.045-1.055z"
                      />
                    </svg>
                    <span v-text="t$('sdiFrontendApp.RequestStatus.APPROVED')"></span>
                  </span>
                </div>
                <div
                  class="step mr-2"
                  :class="{
                    current: isStepActive('COMPLETED'),
                    done: isStepActive('COMPLETED') && isStepCompleted('PENDING') && isStepCompleted('APPROVED'),
                  }"
                >
                  <span>
                    <svg
                      v-if="isStepActive('COMPLETED') && isStepCompleted('PENDING') && isStepCompleted('APPROVED')"
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      viewBox="0 0 24 24"
                      class="mr-2"
                    >
                      <path
                        d="M20.285 5.515a.75.75 0 00-1.06-.011L9.12 15.66l-4.65-4.65a.75.75 0 00-1.06 1.06l5.16 5.16a.75.75 0 001.06 0l10.71-10.65a.75.75 0 00-.045-1.055z"
                      />
                    </svg>
                    <span v-text="t$('sdiFrontendApp.RequestStatus.COMPLETED')"></span>
                  </span>
                </div>
                <div
                  class="step ml-1 mr-2"
                  :class="{
                    current: isStepActive('REJECTED'),
                    rejected: isStepActive('REJECTED'),
                  }"
                >
                  <span v-if="isStepActive('REJECTED')">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="14"
                      height="14"
                      fill="currentColor"
                      class="bi bi-x mr-1"
                      viewBox="0 0 16 16"
                    >
                      <path
                        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                      />
                    </svg>
                    <span v-text="t$('sdiFrontendApp.RequestStatus.REJECTED')"></span>
                  </span>
                  <span v-else v-text="t$('sdiFrontendApp.RequestStatus.REJECTED')"></span>
                </div>
              </div>
            </div>
          </div>

          <!-- Request Details -->
          <div class="row g-0 p-3">
            <div class="col-lg-12">
              <div class="p-3">
                <div class="mb-4 d-flex justify-content-between align-items-start">
                  <div class="flex-grow-1">
                    <h6 class="text-muted mb-2 small" v-text="t$('sdiFrontendApp.requestOfChange.description')"></h6>
                    <p class="mb-0">{{ selectedRequest.description || ' ' }}</p>
                  </div>
                  <div class="ms-4 text-end">
                    <h6 class="text-muted mb-2 small" v-text="t$('sdiFrontendApp.requestOfChange.createDate')"></h6>
                    <div
                      class="alert alert-secondary d-inline-flex align-items-center py-1 px-2 btn-sm"
                      style="font-size: 0.9rem; line-height: 1; gap: 0.25rem; margin-top: 0px; margin-bottom: 0px"
                    >
                      {{ formatDate(selectedRequest.createDate) }}
                    </div>
                  </div>
                </div>

                <!-- Request Details -->
                <div class="row mb-4">
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2 small" v-text="t$('sdiFrontendApp.requestOfChange.client')"></h6>
                    <p class="mb-3">{{ selectedRequest.client ? selectedRequest.client.code : '-' }}</p>

                    <h6 class="text-muted mb-2 small" v-text="t$('sdiFrontendApp.requestOfChange.productVersion')"></h6>
                    <p class="mb-0">{{ selectedRequest.productVersion ? selectedRequest.productVersion.version : '-' }}</p>
                  </div>
                  <div class="col-md-6">
                    <h6 class="text-muted mb-2 small" v-text="t$('sdiFrontendApp.requestOfChange.customisationLevel')"></h6>
                    <p class="mb-3">{{ selectedRequest.customisationLevel ? selectedRequest.customisationLevel.level : '-' }}</p>

                    <h6 class="text-muted mb-2 small" v-text="t$('sdiFrontendApp.requestOfChange.status')"></h6>
                    <div :class="['status-badge', getStatusColorClass(selectedRequest.status)]">
                      {{ getStatusText(selectedRequest.status) }}
                    </div>
                  </div>
                </div>

                <!-- Modules affectés -->
                <div class="modules-section mt-4">
                  <h6 class="text-muted mb-3 small" v-text="t$('sdiFrontendApp.requestOfChange.moduleVersion')"></h6>
                  <div class="card">
                    <div class="card-body">
                      <div v-if="!selectedRequest.moduleVersions || selectedRequest.moduleVersions.length === 0" class="text-center py-3">
                        <span class="text-muted" v-text="t$('sdiFrontendApp.requestOfChange.noModule')"></span>
                      </div>
                      <div v-else class="d-flex flex-wrap gap-2">
                        <div
                          v-for="module in selectedRequest.moduleVersions"
                          :key="module.id"
                          class="badge bg-light text-dark p-2 rounded-pill"
                        >
                          {{ module.module ? module.module.name : 'N/A' }} <span class="text-muted">{{ ' - ' }}{{ module.version }}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Action Buttons -->
          <div class="d-flex justify-content-end p-3">
            <div v-if="selectedRequest.status === 'PENDING'">
              <button class="button button-primary btn-sm rounded-2 mr-2" @click="changeRequestStatus('APPROVED')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1"
                  style="display: inline-block; vertical-align: text-bottom"
                >
                  <polyline points="20 6 9 17 4 12"></polyline>
                </svg>
                <span v-text="t$('sdiFrontendApp.requestOfChange.Approuver')"></span>
              </button>
              <button class="button button-secondary btn-sm rounded-2" @click="changeRequestStatus('REJECTED')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00366d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1"
                  style="display: inline-block; vertical-align: text-bottom"
                >
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
                <span v-text="t$('sdiFrontendApp.requestOfChange.Rejeter')"></span>
              </button>
            </div>
            <div v-if="selectedRequest.status === 'APPROVED'">
              <button class="button button-primary btn-sm rounded-2 mr-2" @click="changeRequestStatus('COMPLETED')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1"
                  style="display: inline-block; vertical-align: text-bottom"
                >
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
                  <polyline points="22 4 12 14.01 9 11.01"></polyline>
                </svg>
                <span v-text="t$('sdiFrontendApp.requestOfChange.MarkOut')"></span>
              </button>
            </div>
            <div v-if="selectedRequest.status === 'COMPLETED'">
              <button
                class="button button-primary btn-sm rounded-2"
                v-if="selectedRequest && selectedRequest.status === 'COMPLETED'"
                @click="openNewProductVersionPopup"
                v-text="t$('sdiFrontendApp.requestOfChange.AddNewProduct')"
              ></button>
            </div>
            <div v-if="selectedRequest.status === 'REJECTED'">
              <button class="button button-secondary btn-sm rounded-2" @click="changeRequestStatus('PENDING')">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="#00366d"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                  class="mr-1"
                  style="display: inline-block; vertical-align: text-bottom"
                >
                  <circle cx="12" cy="12" r="10"></circle>
                  <polyline points="12 6 12 12 16 14"></polyline>
                </svg>
                <span v-text="t$('sdiFrontendApp.requestOfChange.RemettreEnattente')"></span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Create Request Modal -->
    <div class="modal-backdrop" v-if="showCreateModal" @click="closeCreateModal"></div>
    <div class="modal-container pt-lg-5 mt-2" v-if="showCreateModal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">
            {{
              newRequest.id ? t$('sdiFrontendApp.requestOfChange.home.editLabel') : t$('sdiFrontendApp.requestOfChange.home.createLabel')
            }}
          </h5>
          <button type="button" class="close-button" @click="closeCreateModal" aria-label="Fermer">
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

        <div class="modal-body compact-form">
          <form name="editForm" novalidate @submit.prevent="saveNewRequest">
            <div class="form-container">
              <div class="form-group">
                <label class="form-control-label" v-text="t$('sdiFrontendApp.requestOfChange.title')" for="request-of-change-title"></label>
                <input
                  type="text"
                  class="form-control form-control-sm"
                  name="title"
                  id="request-of-change-title"
                  data-cy="title"
                  v-model="newRequest.title"
                  required
                />
              </div>
              <div class="form-group">
                <label
                  class="form-control-label"
                  v-text="t$('sdiFrontendApp.requestOfChange.keywords')"
                  for="request-of-change-keywords"
                ></label>
                <textarea
                  class="form-control form-control-sm"
                  name="keywords"
                  id="request-of-change-keywords"
                  data-cy="keywords"
                  v-model="newRequest.keywords"
                  rows="2"
                ></textarea>
              </div>
              <div class="form-group">
                <label
                  class="form-control-label"
                  v-text="t$('sdiFrontendApp.requestOfChange.description')"
                  for="request-of-change-description"
                ></label>
                <textarea
                  class="form-control form-control-sm"
                  name="description"
                  id="request-of-change-description"
                  data-cy="description"
                  v-model="newRequest.description"
                  rows="3"
                ></textarea>
              </div>
              <div class="form-group">
                <label
                  class="form-control-label"
                  v-text="t$('sdiFrontendApp.requestOfChange.productVersion')"
                  for="request-of-change-productVersion"
                ></label>
                <select
                  class="form-control form-control-sm"
                  id="request-of-change-productVersion"
                  data-cy="productVersion"
                  name="productVersion"
                  v-model="newRequest.productVersion"
                >
                  <option :value="null"></option>
                  <option :value="productVersionOption" v-for="productVersionOption in productVersions" :key="productVersionOption.id">
                    {{ productVersionOption.version }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label
                  class="form-control-label"
                  v-text="t$('sdiFrontendApp.requestOfChange.client')"
                  for="request-of-change-client"
                ></label>
                <select
                  class="form-control form-control-sm"
                  id="request-of-change-client"
                  data-cy="client"
                  name="client"
                  v-model="newRequest.client"
                >
                  <option :value="null"></option>
                  <option :value="clientOption" v-for="clientOption in clients" :key="clientOption.id">
                    {{ clientOption.name }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label v-text="t$('sdiFrontendApp.requestOfChange.moduleVersion')" for="request-of-change-moduleVersion"></label>
                <select
                  class="form-control form-control-sm"
                  id="request-of-change-moduleVersions"
                  data-cy="moduleVersion"
                  multiple
                  name="moduleVersion"
                  v-model="newRequest.moduleVersions"
                >
                  <option :value="moduleVersionOption" v-for="moduleVersionOption in moduleVersions" :key="moduleVersionOption.id">
                    {{ moduleVersionOption?.module?.name }} {{ ' - ' }} {{ moduleVersionOption.version }}
                  </option>
                </select>
              </div>
              <div class="form-group">
                <label
                  class="form-control-label"
                  v-text="t$('sdiFrontendApp.requestOfChange.customisationLevel')"
                  for="request-of-change-customisationLevel"
                ></label>
                <select
                  class="form-control form-control-sm"
                  id="request-of-change-customisationLevel"
                  data-cy="customisationLevel"
                  name="customisationLevel"
                  v-model="newRequest.customisationLevel"
                >
                  <option :value="null"></option>
                  <option
                    :value="customisationLevelOption"
                    v-for="customisationLevelOption in customisationLevels"
                    :key="customisationLevelOption.id"
                  >
                    {{ customisationLevelOption.level }}
                  </option>
                </select>
              </div>
            </div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary rounded-2" @click="closeCreateModal">
                <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
              </button>
              <button type="submit" class="btn btn-primary rounded-2" :disabled="isSaving">
                <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>

    <!-- Modules Modal -->
    <div class="modal-backdrop" v-if="showModulesModal" @click="closeModulesModal"></div>
    <div class="modal-container" v-if="showModulesModal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title" v-text="t$('sdiFrontendApp.requestOfChange.moduleVersion')"></h5>
          <button type="button" class="close-button" @click="closeModulesModal" aria-label="Fermer">
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
          <div v-if="selectedModuleRequest">
            <div v-if="!selectedModuleRequest.moduleVersions || selectedModuleRequest.moduleVersions.length === 0" class="text-center py-3">
              <span class="text-muted" v-text="t$('sdiFrontendApp.requestOfChange.noModule')"></span>
            </div>
            <div v-else class="d-flex flex-wrap gap-2">
              <div
                v-for="module in selectedModuleRequest.moduleVersions"
                :key="module.id"
                class="badge bg-light text-dark p-2 rounded-pill"
              >
                {{ module.module ? module.module.name : 'N/A' }} <span class="text-muted">{{ ' - ' }}{{ module.version }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Delete Confirmation Modal -->
    <div class="modal-backdrop" v-if="showDeleteModal" @click="closeDeleteModal"></div>
    <div class="modal-container" v-if="showDeleteModal" role="dialog" aria-modal="true">
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
            Confirmation de suppression
          </h5>
          <button type="button" class="close-button" @click="closeDeleteModal" aria-label="Fermer">
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
          <p>Êtes-vous sûr de vouloir supprimer cette demande de changement ?</p>
          <p v-if="requestToDelete">
            <strong>{{ requestToDelete.title }}</strong>
          </p>
          <p>Cette action est irréversible.</p>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary rounded-2"
            @click="closeDeleteModal"
            v-text="t$('sdiFrontendApp.requestOfChange.delete.cancel')"
          ></button>
          <button
            type="button"
            class="btn btn-danger rounded-2"
            @click="confirmDelete"
            v-text="t$('sdiFrontendApp.requestOfChange.delete.delete')"
          ></button>
        </div>
      </div>
    </div>

    <!-- New Product Version Popup -->
    <NewProductVersionPopup
      :is-open="showNewProductVersionPopup"
      :request-of-change="selectedRequest"
      @close="closeNewProductVersionPopup"
      @product-created="handleProductCreated"
    />
  </div>
  <div class="section"></div>
  <div class="section"></div>
</template>

<script lang="ts" src="./request-of-change.component.ts"></script>

<style scoped>
.request-of-change-container {
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
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  border: none;
  margin-bottom: 1.5rem;
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
  gap: 8px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.icon-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.view-container {
  color: #0c2d57;
}

.edit-container {
  color: #0c2d57;
}

.manage-container {
  color: #0c2d57;
}

.delete-container {
  color: #0c2d57;
}

/* Styles des boutons */

.btn-success {
  background-color: #28a745;
  border-color: #28a745;
}

.btn-danger {
  background-color: #dc3545;
  border-color: #dc3545;
}

/* Tab styling */
.vercel-tabs-container {
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
  color: #6c757d;
}

.tab-item.active {
  color: #0c2d57;
  font-weight: 500;
}

/* Status-colored tabs */
.status-tab-pending {
  color: #ff9800;
}

.status-tab-approved {
  color: #28a745;
}

.status-tab-rejected {
  color: #dc3545;
}

.status-tab-completed {
  color: #0d6efd;
}

.status-tab-pending.active {
  color: #ff9800;
  font-weight: 600;
}

.status-tab-approved.active {
  color: #28a745;
  font-weight: 600;
}

.status-tab-rejected.active {
  color: #dc3545;
  font-weight: 600;
}

.status-tab-completed.active {
  color: #0d6efd;
  font-weight: 600;
}

.absolute-tab-highlight {
  position: absolute;
  height: 30px;
  transition: all 0.3s ease-out;
  z-index: 0;
}

.hover-highlight {
  background-color: rgba(0, 0, 0, 0.05);
  border-radius: 6px;
  bottom: 6px;
}

.active-indicator {
  bottom: -1px;
  height: 2px;
  background-color: currentColor;
}

/* Selected row styling */
.selected-row {
  background-color: rgba(0, 123, 255, 0.05);
}

/* Form check styling */
.form-check {
  display: flex;
  align-items: center;
  justify-content: center;
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
  max-width: 700px;
  max-height: 90vh;
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

/* Compact form styles */
.compact-form .form-container {
  max-height: 60vh;
  overflow-y: auto;
  padding-right: 0.5rem;
}

.compact-form .form-group {
  margin-bottom: 0.75rem;
}

.compact-form label {
  font-size: 0.875rem;
  margin-bottom: 0.25rem;
}

.compact-details {
  font-size: 0.9rem;
}

.compact-details .card-title {
  font-size: 1rem;
  margin-bottom: 0.75rem;
}

.compact-details .detail-row {
  margin-bottom: 0.5rem;
  padding-bottom: 0.5rem;
}

/* Styles pour les badges de statut */
.status-badge {
  display: inline-block;
  padding: 4px 8px;
  border-radius: 4px;
  font-weight: 500;
  font-size: 0.85rem;
  position: relative;
}

.status-badge::after {
  content: '';
  display: block;
  height: 2px;
  width: 100%;
  position: absolute;
  bottom: 0;
  left: 0;
  border-radius: 1px;
}

.text-warning {
  color: #ff9800 !important;
}

.text-success {
  color: #28a745 !important;
}

.text-danger {
  color: #dc3545 !important;
}

.text-primary {
  color: #0d6efd !important;
}

.border-warning::after {
  background-color: #ff9800;
}

.border-success::after {
  background-color: #28a745;
}

.border-danger::after {
  background-color: #dc3545;
}

.border-primary::after {
  background-color: #0d6efd;
}

/* Styles pour le nouveau progress bar avec flèches */
.container-fluid {
  width: 100%;
  padding-right: 0;
  padding-left: 0;
}

.wrapper {
  display: block;
  width: 100%;
}

.arrow-steps {
  display: flex;
  width: 100%;
}

.arrow-steps .step {
  font-size: 14px;
  text-align: center;
  color: #666;
  cursor: default;
  margin: 0;
  padding: 10px 10px 10px 30px;
  flex: 1;
  position: relative;
  background-color: #d9e3f7;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  transition: background-color 0.2s ease;
}

.arrow-steps .step:after,
.arrow-steps .step:before {
  content: ' ';
  position: absolute;
  top: 0;
  right: -17px;
  width: 0;
  height: 0;
  border-top: 19px solid transparent;
  border-bottom: 17px solid transparent;
  border-left: 17px solid #d9e3f7;
  z-index: 2;
  transition: border-color 0.2s ease;
}

.arrow-steps .step:before {
  right: auto;
  left: 0;
  border-left: 17px solid #fff;
  z-index: 0;
}

.arrow-steps .step:first-child:before {
  border: none;
}

.arrow-steps .step:first-child {
  border-top-left-radius: 4px;
  border-bottom-left-radius: 4px;
}

.arrow-steps .step:last-child {
  border-top-right-radius: 4px;
  border-bottom-right-radius: 4px;
}

.arrow-steps .step span {
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
}

.arrow-steps .step.done span:before {
  opacity: 1;
  -webkit-transition: opacity 0.3s ease 0.5s;
  -moz-transition: opacity 0.3s ease 0.5s;
  -ms-transition: opacity 0.3s ease 0.5s;
  transition: opacity 0.3s ease 0.5s;
}

.arrow-steps .step.current {
  color: #fff;
  background-color: #0c2d57;
}

.arrow-steps .step.current:after {
  border-left: 17px solid #0c2d57;
}

.arrow-steps .step.rejected {
  color: #fff;
  background-color: #dc3545;
}

.arrow-steps .step.rejected:after {
  border-left: 17px solid #dc3545;
}

/* Modules section styling */
.modules-section {
  border-top: 1px solid #e9ecef;
  padding-top: 1.5rem;
}

.modules-section .table th {
  font-size: 0.75rem;
}

.modules-section .card {
  border: 1px solid #e9ecef;
  box-shadow: none;
}

.badge {
  font-weight: normal;
  font-size: 0.85rem;
}

.bg-light {
  background-color: #f8f9fa;
}

.text-dark {
  color: #212529;
}

.rounded-pill {
  border-radius: 50rem;
}

.gap-2 {
  gap: 0.5rem;
}
</style>
