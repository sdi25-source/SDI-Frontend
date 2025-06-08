<template>
  <div class="product-container section pt-5">
    <!-- Navigation Bar -->
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <button
          @click="showAddRow = true"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn button-primary btn-sm mr-3 rounded-1"
          :disabled="showAddRow"
          v-if="hasAnyAuthority('ROLE_USER')"
        >
          <font-awesome-icon icon="plus"></font-awesome-icon>
          <span v-text="t$('global.new')"></span>
        </button>
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="ProductHeading">
          <span v-text="t$('sdiFrontendApp.product.home.title')" id="product-heading"></span>
        </h5>
      </div>

      <!-- Search Bar -->
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

      <!-- Action Buttons -->
      <div class="d-flex align-items-center">
        <!-- Product Line Filter -->
        <div class="filter-item mr-4">
          <span class="filter-label mr-3">Product Line</span>
          <select v-model="selectedProductLineFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Product Lines</option>
            <option v-for="productLine in productLineOptions" :key="productLine.id" :value="productLine.id">
              {{ productLine.name }}
            </option>
          </select>
        </div>

        <!-- Reset Button -->
        <button class="btn-reset mr-4" @click="resetFilters">
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
                fillRule="evenodd"
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
                fillRule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Data table -->
    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="products">
          <thead class="thead-light">
            <tr>
              <th scope="col"><span class="pl-4" v-text="t$('sdiFrontendApp.product.logo')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.product.name')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.product.description')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.product.productLine')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <!-- Existing product rows -->
            <tr
              v-for="product in paginatedProducts"
              :key="product.id"
              data-cy="entityTable"
              class="align-middle"
              :class="{ 'selected-row': selectedProduct && selectedProduct.id === product.id }"
              @click="toggleProductSelection(product)"
              style="cursor: pointer"
            >
              <td>
                <img
                  v-if="product.logo"
                  :src="product.logo"
                  :alt="product.name + ' logo'"
                  class="product-logo ml-4"
                  width="40"
                  height="40"
                />
              </td>
              <td>
                <template v-if="product.isEditing">
                  <input type="text" class="form-control-borderless" v-model="product.name" placeholder="Nom" @click.stop />
                </template>
                <template v-else>
                  {{ product.name }}
                </template>
              </td>
              <td class="text-truncate" style="max-width: 200px">
                <template v-if="product.isEditing">
                  <input type="text" class="form-control-borderless" v-model="product.description" placeholder="Description" @click.stop />
                </template>
                <template v-else>
                  <span :title="product.description">{{ product.description }}</span>
                </template>
              </td>
              <td>
                <template v-if="product.isEditing">
                  <select
                    v-model="editProductLineIds"
                    multiple
                    class="form-control-borderless"
                    @change="updateEditProductLines(product)"
                    @click.stop
                  >
                    <option v-for="productLine in productLineOptions" :key="productLine.id" :value="productLine.id">
                      {{ productLine.name }}
                    </option>
                  </select>
                  <div v-if="product.productLines && product.productLines.length > 0" class="selected-items mt-2">
                    <span v-for="line in product.productLines" :key="line.id" class="badge badge-primary mr-1">
                      {{ line.name }}
                      <button type="button" class="close ml-1" @click.stop="removeEditProductLine(product, line.id)">&times;</button>
                    </span>
                  </div>
                </template>
                <template v-else>
                  <span
                    v-for="(productLine, i) in product.productLines"
                    :key="productLine.id"
                    class="badge badge-light alert-secondary ml-2"
                  >
                    {{ productLine.name }}
                  </span>
                </template>
              </td>
              <td class="text-center" @click.stop>
                <div class="action-icons">
                  <template v-if="product.isEditing">
                    <div class="icon-container save-container" @click="saveEditProduct(product)" title="Enregistrer">
                      <font-awesome-icon icon="save"></font-awesome-icon>
                    </div>
                    <div class="icon-container cancel-container" @click="cancelEdit(product)" title="Annuler">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-cancel" width="14" height="14">
                        <path
                          d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                          fill="currentColor"
                        />
                      </svg>
                    </div>
                  </template>
                  <template v-else>
                    <div
                      class="icon-container edit-container"
                      @click="editProduct(product)"
                      title="Modifier"
                      v-if="hasAnyAuthority('ROLE_USER')"
                    >
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
                    <div
                      class="icon-container delete-container"
                      @click="prepareRemove(product)"
                      title="Supprimer"
                      v-if="hasAnyAuthority('ROLE_USER')"
                    >
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
                    <div class="icon-container settings-container" @click="openProductSettings(product)" title="Paramètres">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="icon"
                      >
                        <rect x="3" y="3" width="7" height="7"></rect>
                        <rect x="14" y="3" width="7" height="7"></rect>
                        <rect x="14" y="14" width="7" height="7"></rect>
                        <rect x="3" y="14" width="7" height="7"></rect>
                      </svg>
                    </div>
                    <div class="icon-container settings-container" @click="openCertifications(product)" title="Certification">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="icon"
                      >
                        <circle cx="12" cy="8" r="7"></circle>
                        <polyline points="8.21 13.89 7 23 12 20 17 23 15.79 13.88"></polyline>
                      </svg>
                    </div>
                  </template>
                </div>
              </td>
            </tr>
            <!-- Row to add a new product -->
            <tr v-if="showAddRow" class="add-row">
              <td class="logo-input-container">
                <div class="custom-file-upload">
                  <input
                    type="file"
                    id="logo-upload"
                    class="form-control-file"
                    accept="image/*"
                    @change="handleNewImageUpload($event)"
                    aria-label="Upload product logo"
                  />
                  <label for="logo-upload" class="file-upload-label">
                    <span class="file-upload-text">Choose Image</span>
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="upload-icon"
                    >
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                      <polyline points="17 8 12 3 7 8"></polyline>
                      <line x1="12" y1="3" x2="12" y2="15"></line>
                    </svg>
                  </label>
                  <small v-if="newProduct.logo" class="form-text text-muted"> Loaded image </small>
                </div>
              </td>
              <td><input type="text" class="form-control-borderless" v-model="newProduct.name" placeholder="Name" /></td>
              <td><input type="text" class="form-control-borderless" v-model="newProduct.description" placeholder="Description" /></td>
              <td>
                <select v-model="selectedProductLineIds" multiple class="form-control-borderless" @change="updateProductLines">
                  <option v-for="productLine in productLineOptions" :key="productLine.id" :value="productLine.id">
                    {{ productLine.name }}
                  </option>
                </select>
                <div v-if="newProduct.productLines && newProduct.productLines.length > 0" class="selected-items mt-2">
                  <span v-for="line in newProduct.productLines" :key="line.id" class="badge badge-primary mr-1">
                    {{ line.name }}
                    <button type="button" class="close ml-1" @click="removeProductLine(line.id)">&times;</button>
                  </span>
                </div>
              </td>
              <td class="text-center">
                <div class="action-icons">
                  <div class="icon-container save-container" @click="saveNewProduct" title="Enregistrer">
                    <font-awesome-icon icon="save"></font-awesome-icon>
                  </div>
                  <div class="icon-container cancel-container" @click="cancelNewProduct" title="Annuler">
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-cancel" width="14" height="14">
                      <path
                        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                  <div class="icon-container settings-container" @click="openSettingsModal" title="Paramètres">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      stroke-width="2"
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      class="icon"
                    >
                      <rect x="3" y="3" width="7" height="7"></rect>
                      <rect x="14" y="3" width="7" height="7"></rect>
                      <rect x="14" y="14" width="7" height="7"></rect>
                      <rect x="3" y="14" width="7" height="7"></rect>
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedProducts.length === 0 && !showAddRow">
              <td colspan="5" class="empty-message">No product available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Detailed View Section (appears when a product is selected) -->
    <div v-if="selectedProduct" class="mt-4 product-detail-view" style="transition: all 2s ease">
      <div class="card">
        <div class="card-header d-flex justify-content-between align-items-center">
          <div class="d-flex align-items-center">
            <!-- GitHub-style Breadcrumb Navigation -->
            <div class="breadcrumb-navigation">
              <div class="d-flex align-items-center">
                <template v-for="(item, index) in breadcrumb" :key="index">
                  <span v-if="index > 0" class="mx-2 text-muted" style="user-select: none">/</span>
                  <span
                    class="breadcrumb-item"
                    :class="{ active: index === breadcrumb.length - 1, clickable: index < breadcrumb.length - 1 }"
                    @click="navigateToBreadcrumb(index)"
                  >
                    {{ item.name }}
                  </span>
                </template>
              </div>
            </div>
          </div>
          <button class="btn btn-sm btn-outline-secondary rounded-1" @click="returnToProductList">
            <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
              <path
                fillRule="evenodd"
                d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
              />
            </svg>
            Hide
          </button>
        </div>
        <div class="card-body">
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
                  v-for="(tab, index) in tabs"
                  :key="index"
                  :ref="
                    el => {
                      if (el) tabRefs[index] = el;
                    }
                  "
                  class="tab-item"
                  :class="{ active: index === activeTabIndex }"
                  @mouseenter="setHoveredIndex(index)"
                  @mouseleave="setHoveredIndex(null)"
                  @click="setActiveTabIndex(index)"
                >
                  {{ tab }}
                </div>
              </div>
            </div>

            <div class="tab-content mt-4" style="transition: all 2s ease">
              <!-- Versions Tab (when no version is selected) -->
              <div v-if="!selectedVersion && activeTabIndex === 0" class="versions-tab">
                <div class="d-flex justify-content-between mb-3">
                  <h6 class="mb-0"></h6>
                  <button
                    @click="showAddVersionLigne"
                    id="jh-create-entity"
                    data-cy="entityCreateButton"
                    class="btn btn-sm btn-primary btn-sm mr-3 rounded-1"
                    :disabled="showAddVersionRow"
                    v-if="hasAnyAuthority('ROLE_USER')"
                  >
                    <font-awesome-icon icon="plus"></font-awesome-icon>
                    <span> New Version</span>
                  </button>
                </div>
                <table class="table table-hover">
                  <thead class="thead-light">
                    <tr>
                      <th></th>
                      <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.version')"></span></th>
                      <!--                      <th scope="col"><span v-text="t$('sdiFrontendApp.productVersion.root')"></span></th>-->
                      <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.notes')"></span></th>
                      <th scope="row" class="pl-lg-5 ml-5"><span class="pl-lg-5 ml-5"></span></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="productVersions.length === 0 && !showAddVersionRow">
                      <td colspan="6" class="empty-message">
                        <span>No product version available</span>
                      </td>
                    </tr>
                    <tr v-for="(version, index) in paginatedVersions" :key="index" @click="selectVersion(version)" style="cursor: pointer">
                      <td></td>
                      <td>
                        <template v-if="isEditingVersion && editingVersionData && editingVersionData.id === version.id">
                          <input
                            type="text"
                            class="form-control-borderless"
                            v-model="editingVersionData.version"
                            placeholder="Version"
                            @click.stop
                          />
                        </template>
                        <template v-else>
                          {{ version.version }}
                        </template>
                      </td>
                      <!--                      <td>-->
                      <!--                        <div v-if="version.root">{{ version.product.name }} {{ ' - ' }} {{ version.root?.version }}</div>-->
                      <!--                        <div v-else>-</div>-->
                      <!--                      </td>-->
                      <td>
                        <template v-if="isEditingVersion && editingVersionData && editingVersionData.id === version.id">
                          <input
                            type="text"
                            class="form-control-borderless"
                            v-model="editingVersionData.notes"
                            placeholder="Notes"
                            @click.stop
                          />
                        </template>
                        <template v-else>
                          <span class="text-truncate" style="max-width: 200px" :title="version.notes">
                            {{ version.notes || 'No Description available' }}
                          </span>
                        </template>
                      </td>
                      <td @click.stop class="d-flex align-items-center justify-content-center">
                        <div class="mr-lg-5 action-icons">
                          <template v-if="isEditingVersion && editingVersionData && editingVersionData.id === version.id">
                            <div class="icon-container save-container" @click="saveEditVersion(version)" title="Enregistrer">
                              <font-awesome-icon icon="save"></font-awesome-icon>
                            </div>
                            <div class="icon-container cancel-container" @click="cancelEditVersion()" title="Annuler">
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
                            </div>
                            <div class="icon-container settings-container" @click="openVersionSettingsFromEdit" title="Paramètres">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                fill="currentColor"
                                class="bi bi-gear"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M8 4.754a3.246 3.246 0 1 0 0 6.492a3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
                                />
                                <path
                                  d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291a1.873 1.873 0 0 0-1.116-2.693l-.318-.094c-.835-.246-.835-1.428 0-1.674l.319-.094a1.873 1.873 0 0 0 1.115-2.692l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
                                />
                              </svg>
                            </div>
                          </template>
                          <template v-else>
                            <div
                              class="icon-container edit-container"
                              @click="editVersion(version)"
                              title="Modifier"
                              v-if="hasAnyAuthority('ROLE_USER')"
                            >
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
                            <div
                              class="icon-container delete-container"
                              @click="prepareRemoveVersion(version)"
                              title="Supprimer"
                              v-if="hasAnyAuthority('ROLE_USER')"
                            >
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
                            <div class="icon-container settings-container" @click="openVersionSettings(version)" title="Paramètres">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="14"
                                height="14"
                                fill="currentColor"
                                class="bi bi-gear"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M8 4.754a3.246 3.246 0 1 0 0 6.492a3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
                                />
                                <path
                                  d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291a1.873 1.873 0 0 0-1.116-2.693l-.318-.094c-.835-.246-.835-1.428 0-1.674l.319-.094a1.873 1.873 0 0 0 1.115-2.692l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
                                />
                              </svg>
                            </div>
                            <div class="icon-container select-container" @click="selectVersion(version)" title="Sélectionner">
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
                          </template>
                        </div>
                      </td>
                    </tr>
                    <!-- Add new version row -->
                    <tr v-if="showAddVersionRow" class="add-row">
                      <td></td>
                      <td><input type="text" class="form-control-borderless" v-model="newVersion.version" value="newVersion.version" /></td>
                      <!--                      <td>{{ newVersion.root?.product.name }}{{ ' - ' }}{{ newVersion.root?.version }}</td>-->
                      <td><input type="text" class="form-control-borderless" v-model="newVersion.notes" placeholder="Notes" /></td>
                      <td>
                        <div class="mr-lg-5 action-icons">
                          <div class="icon-container save-container" @click="saveNewVersion" title="Enregistrer">
                            <font-awesome-icon icon="save"></font-awesome-icon>
                          </div>
                          <div class="icon-container delete-container" @click="cancelNewVersion" title="Annuler">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="20"
                              height="20"
                              fill="currentColor"
                              class="bi bi-x"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
                              />
                            </svg>
                          </div>
                          <div class="icon-container settings-container" @click="openNewVersionSettings" title="Paramètres">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="14"
                              height="14"
                              fill="currentColor"
                              class="bi bi-gear"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M8 4.754a3.246 3.246 0 1 0 0 6.492a3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
                              />
                              <path
                                d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291a1.873 1.873 0 0 0-1.116-2.693l-.318-.094c-.835-.246-.835-1.428 0-1.674l.319-.094a1.873 1.873 0 0 0 1.115-2.692l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
                              />
                            </svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Modules Tab (when version is selected) -->
              <div v-if="selectedVersion && activeTabIndex === 0" class="modules-tab" style="transition: all 2s ease">
                <div class="d-flex justify-content-between align-items-center mb-3">
                  <h6 class="mb-0">{{ t$('sdiFrontendApp.moduleVersion.home.title') }}</h6>
                  <div>
                    <button class="btn btn-sm btn-outline-secondary rounded-1 mr-2" @click="returnToVersionsList">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-arrow-left"
                        viewBox="0 0 16 16"
                      >
                        <path
                          fill-rule="evenodd"
                          d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                        />
                      </svg>
                      {{ t$('sdiFrontendApp.productVersion.backToVersions') }}
                    </button>
                    <button
                      class="btn btn-sm btn-primary rounded-1"
                      @click="toggleAddModuleVersionRow"
                      :disabled="showAddModuleVersionRow"
                      v-if="hasAnyAuthority('ROLE_USER')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-plus-circle me-1"
                        viewBox="0 0 16 16"
                      >
                        <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
                        <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                      </svg>
                      {{ t$('sdiFrontendApp.moduleVersion.add') }}
                    </button>
                  </div>
                </div>

                <table class="table table-hover">
                  <thead class="thead-light">
                    <tr>
                      <th class="pl-5">{{ t$('sdiFrontendApp.moduleVersion.module') }}</th>
                      <th>{{ t$('sdiFrontendApp.moduleVersion.version') }}</th>
                      <th>{{ t$('sdiFrontendApp.product.description') }}</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    <!-- Existing Module Versions -->
                    <tr v-if="getFilteredModules.length === 0 && !showAddModuleVersionRow">
                      <td colspan="6" class="empty-message">
                        <span>{{ t$('sdiFrontendApp.moduleVersion.noModules') }}</span>
                      </td>
                    </tr>
                    <tr v-for="(module, index) in getFilteredModules" :key="index">
                      <td class="pl-5">{{ getModuleVersionWithModuleCached(module.id)?.module?.name }}</td>
                      <td>{{ module.version }}</td>
                      <td class="text-truncate" style="max-width: 250px" :title="module.notes">
                        {{ getModuleVersionWithModuleCached(module.id).notes }}
                      </td>
                      <td>
                        <div class="action-icons pr-lg-5 mr-lg-5">
                          <div class="icon-container edit-container" :title="t$('entity.action.edit')" v-if="hasAnyAuthority('ROLE_USER')">
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
                          <div
                            class="icon-container delete-container"
                            :title="t$('entity.action.delete')"
                            v-if="hasAnyAuthority('ROLE_USER')"
                          >
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
                              />
                            </svg>
                          </div>
                          <div class="icon-container save-container" @click="openModuleFeaturesModal(module)" title="features">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="icon"
                            >
                              <polygon points="12 2 2 7 12 12 22 7 12 2"></polygon>
                              <polyline points="2 17 12 22 22 17"></polyline>
                              <polyline points="2 12 12 17 22 12"></polyline>
                            </svg>
                          </div>
                        </div>
                      </td>
                    </tr>
                    <!-- Add Module Version Row -->
                    <tr v-if="showAddModuleVersionRow" class="add-row">
                      <td class="pl-5">
                        <select
                          v-model="newModuleVersion.module"
                          class="form-control-borderless"
                          :class="{ 'is-invalid': !newModuleVersion.module }"
                        >
                          <option :value="null">{{ t$('global.form.selectModulePlaceholder') }}</option>
                          <option v-for="module in moduleOptions" :key="module.id" :value="{ id: module.id }">
                            {{ module.name }}
                          </option>
                        </select>
                        <div v-if="!newModuleVersion.module" class="invalid-feedback">
                          {{ t$('global.form.required') }}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control-borderless"
                          v-model="newModuleVersion.version"
                          :placeholder="t$('sdiFrontendApp.moduleVersion.versionPlaceholder')"
                          :class="{ 'is-invalid': !newModuleVersion.version }"
                        />
                        <div v-if="!newModuleVersion.version" class="invalid-feedback">
                          {{ t$('global.form.required') }}
                        </div>
                      </td>
                      <td>
                        <input
                          type="text"
                          class="form-control-borderless"
                          v-model="newModuleVersion.notes"
                          :placeholder="t$('sdiFrontendApp.moduleVersion.notesPlaceholder')"
                        />
                      </td>
                      <td>
                        <div class="action-icons">
                          <div
                            class="icon-container save-container"
                            @click="saveNewModuleVersionAndAssign"
                            :title="t$('entity.action.save')"
                          >
                            <font-awesome-icon icon="save"></font-awesome-icon>
                          </div>
                          <div
                            class="icon-container cancel-container"
                            @click="cancelAddModuleVersionRow"
                            :title="t$('entity.action.cancel')"
                          >
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
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
              <!-- Configuration Tab (when version is selected) -->
              <div v-if="selectedVersion && activeTabIndex === 1" class="configuration-tab" style="transition: all 2s ease">
                <div class="d-flex justify-content-between mb-2">
                  <h6 class="mb-0"></h6>
                  <button class="btn btn-sm btn-outline-secondary rounded-1" @click="returnToVersionsList">
                    <svg
                      xmlns="http://www.w3.org/2000/svg"
                      width="16"
                      height="16"
                      fill="currentColor"
                      class="bi bi-arrow-left"
                      viewBox="0 0 16 16"
                    >
                      <path
                        fillRule="evenodd"
                        d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
                      />
                    </svg>
                    Back to versions
                  </button>
                </div>
                <table class="table table-hover">
                  <thead class="thead-light">
                    <tr>
                      <th>Type</th>
                      <th>Nom</th>
                      <th>Version</th>
                      <th>Description</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="getFilteredInfraComponents.length === 0">
                      <td colspan="4" class="empty-message">
                        <span>No component available for this version</span>
                      </td>
                    </tr>
                    <tr v-for="(component, index) in getFilteredInfraComponents" :key="index">
                      <td>{{ component.infraComponent?.componentType.type }}</td>
                      <td>{{ component.infraComponent?.name }}</td>
                      <td>{{ component.version }}</td>
                      <td>{{ component.description }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>

      <!-- Product certifications Modal -->
      <div class="modal-backdrop" v-if="showCertificationsModal" @click="closeCertificationsModal"></div>
      <div class="modal-container" v-if="showCertificationsModal" role="dialog" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Product Certifications</h5>
            <button type="button" class="close-button" @click="closeCertificationsModal" aria-label="Fermer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- certification Section -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span>Available certification</span>
                </div>
                <button
                  class="button"
                  :class="{ 'button-primary': !showCertificationSelector, 'button-secondary': showCertificationSelector }"
                  @click="showCertificationSelector = !showCertificationSelector"
                  v-if="hasAnyAuthority('ROLE_USER')"
                >
                  {{ showCertificationSelector ? 'Close' : 'Add' }}
                </button>
              </div>

              <div class="card-body">
                <div v-if="showCertificationSelector" class="selector-container">
                  <div class="select-wrapper">
                    <select class="select" v-model="selectedCertificationId">
                      <option value="">Select a certifications</option>
                      <option v-for="cert in certificationsOptionsVersions" :key="cert.id" :value="cert.id">
                        {{ cert.certification.name }} {{ '-' }} {{ cert.version }}
                      </option>
                    </select>
                  </div>
                  <button class="button button-success" @click="addCertificationToProduct" :disabled="!selectedCertificationId">Add</button>
                </div>
                <div style="max-height: 400px; overflow-y: auto">
                  <table class="table table-hover" style="line-height: 1.2">
                    <thead>
                      <tr>
                        <th scope="col" class="pl-5">Name</th>
                        <th>Version</th>
                        <th scope="col" class="pl-2" v-if="hasAnyAuthority('ROLE_USER')">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      <!-- Liste des certifications -->
                      <tr v-for="(cert, index) in productCertifications" :key="index">
                        <td class="pl-5">{{ getCertificationCached(cert.id).certification.name }}</td>
                        <td>{{ cert.version }}</td>
                        <td class="pl-2" v-if="hasAnyAuthority('ROLE_USER')">
                          <button class="button-icon" @click="removeCertificationFromProduct(index)" aria-label="Supprimer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="icon"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      <tr v-if="productCertifications.length === 0">
                        <td colspan="3" class="empty-message">No selected certification</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="button button-secondary" @click="closeCertificationsModal" v-if="hasAnyAuthority('ROLE_USER')">
              Cancel
            </button>
            <button type="button" class="button button-primary" @click="saveCertificationsModal" v-if="hasAnyAuthority('ROLE_USER')">
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Product Settings Modal -->
      <div class="modal-backdrop" v-if="showSettingsModal" @click="closeSettingsModal"></div>
      <div class="modal-container" v-if="showSettingsModal" role="dialog" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Product modules</h5>
            <button type="button" class="close-button" @click="closeSettingsModal" aria-label="Fermer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>

          <div class="modal-body">
            <!-- Modules Section -->
            <div class="card">
              <div class="card-header">
                <div class="card-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span>Available modules</span>
                </div>
                <button
                  class="button"
                  :class="{ 'button-primary': !showModuleSelector, 'button-secondary': showModuleSelector }"
                  @click="showModuleSelector = !showModuleSelector"
                  v-if="hasAnyAuthority('ROLE_USER')"
                >
                  {{ showModuleSelector ? 'Close' : 'Add' }}
                </button>
              </div>
              <div class="card-body">
                <div v-if="showModuleSelector" class="selector-container">
                  <div class="select-wrapper">
                    <select class="select" v-model="selectedModuleVersionId">
                      <option value="">Select a module</option>
                      <option v-for="module in moduleOptions" :key="module.id" :value="module.id">
                        {{ module.name }}
                      </option>
                    </select>
                  </div>
                  <button class="button button-success" @click="addModuleToProduct" :disabled="!selectedModuleVersionId">Add</button>
                  <button
                    class="button button-primary"
                    v-if="!showNewModuleForm"
                    @click="showNewModuleForm = true"
                    title="Créer un nouveau module"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" viewBox="0 0 16 16">
                      <path d="M8 4a.5.5 0 0 1 .5.5v3h3a.5.5 0 0 1 0 1h-3v3a.5.5 0 0 1-1 0v-3h-3a.5.5 0 0 1 0-1h3v-3A.5.5 0 0 1 8 4z" />
                    </svg>
                  </button>
                </div>

                <!-- Formulaire d'ajout d'un nouveau module -->
                <div v-if="showNewModuleForm" class="new-module-form mb-4">
                  <h6 class="mb-2">Create New Module</h6>
                  <div class="form-group mb-2">
                    <label for="new-module-name">Name</label>
                    <input
                      type="text"
                      id="new-module-name"
                      class="form-control"
                      v-model="newModuleInSettingsModal.name"
                      placeholder="Name"
                    />
                  </div>
                  <div class="form-group mb-3">
                    <label for="new-module-desc">Description</label>
                    <textarea
                      id="new-module-desc"
                      class="form-control"
                      v-model="newModuleInSettingsModal.description"
                      placeholder="Description"
                      rows="2"
                    ></textarea>
                  </div>
                  <div class="d-flex gap-2 justify-content-end">
                    <button class="button button-secondary btn-sm" @click="cancelNewModuleInSettings">Cancel</button>
                    <button class="button button-primary btn-sm" @click="addNewModuleFromSettingsModal">Add</button>
                  </div>
                </div>
                <div style="max-height: 300px; overflow-y: auto">
                  <table class="table table-hover" style="line-height: 0.1">
                    <thead>
                      <tr>
                        <th scope="col" class="pl-5">Name</th>
                        <th></th>
                        <th scope="col" class="pl-2" v-if="hasAnyAuthority('ROLE_USER')">Actions</th>
                      </tr>
                    </thead>
                    <tbody v-for="(module, index) in productModules" :key="index">
                      <tr>
                        <td class="pl-5">{{ module.name }}</td>
                        <td></td>
                        <td class="pl-2" v-if="hasAnyAuthority('ROLE_USER')">
                          <button class="button-icon" @click="removeModuleFromProduct(index)" aria-label="Supprimer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              stroke-width="2"
                              stroke-linecap="round"
                              stroke-linejoin="round"
                              class="icon"
                            >
                              <line x1="18" y1="6" x2="6" y2="18"></line>
                              <line x1="6" y1="6" x2="18" y2="18"></line>
                            </svg>
                          </button>
                        </td>
                      </tr>
                      <tr v-if="productModules.length === 0">
                        <td colspan="3" class="empty-message">No selected module</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="button button-secondary" @click="closeSettingsModal" v-if="hasAnyAuthority('ROLE_USER')">
              Cancel
            </button>
            <button type="button" class="button button-primary" @click="saveSettingsModal" v-if="hasAnyAuthority('ROLE_USER')">Save</button>
          </div>
        </div>
      </div>

      <!-- Version Settings Modal -->
      <div class="modal-backdrop" v-if="showVersionSettingsModal" @click="closeVersionSettingsModal"></div>
      <div class="modal-container" v-if="showVersionSettingsModal" role="dialog" aria-modal="true">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title">Product Version parameters</h5>
            <button type="button" class="close-button" @click="closeVersionSettingsModal" aria-label="Fermer">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24"
                height="24"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
                class="icon"
              >
                <line x1="18" y1="6" x2="6" y2="18"></line>
                <line x1="6" y1="6" x2="18" y2="18"></line>
              </svg>
            </button>
          </div>
          <div class="tabs-header position-relative">
            <!-- Tabs -->
            <div class="tabs-list pt-2">
              <div
                class="tab-item"
                :class="{ active: activeVersionSettingsSection === 'configuration' }"
                @click.prevent="showConfigurationSection"
              >
                <div class="card-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon"
                  >
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                    <line x1="6" y1="6" x2="6.01" y2="6"></line>
                    <line x1="6" y1="18" x2="6.01" y2="18"></line>
                  </svg>
                  <span>Infrastructure components</span>
                </div>
              </div>
              <div
                class="tab-item pl-lg-2"
                :class="{ active: activeVersionSettingsSection === 'modules' }"
                @click.prevent="showModulesSection"
              >
                <div class="card-title">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="20"
                    height="20"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    stroke-width="2"
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    class="icon"
                  >
                    <rect x="3" y="3" width="7" height="7"></rect>
                    <rect x="14" y="3" width="7" height="7"></rect>
                    <rect x="14" y="14" width="7" height="7"></rect>
                    <rect x="3" y="14" width="7" height="7"></rect>
                  </svg>
                  <span>Modules Version</span>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-body">
            <!-- Infrastructure Components Section -->
            <div class="card" v-if="activeVersionSettingsSection === 'configuration'">
              <div align="right" class="mr-3">
                <button
                  class="button"
                  :class="{ 'button-primary': !showVersionInfraSelector, 'button-secondary': showVersionInfraSelector }"
                  @click="showVersionInfraSelector = !showVersionInfraSelector"
                  v-if="hasAnyAuthority('ROLE_USER')"
                >
                  {{ showVersionInfraSelector ? 'Close' : 'Add' }}
                </button>
              </div>
              <div class="card-body">
                <div v-if="showVersionInfraSelector" class="selector-container">
                  <div class="select-wrapper">
                    <select class="select" v-model="selectedVersionInfraComponentId">
                      <option value="">Select a component</option>
                      <option v-for="component in infraComponentVersionOptions" :key="component.id" :value="component.id">
                        {{ getIfraComponentVersionWithInfraCached(component.id).infraComponent.name }} ({{ component.version }})
                      </option>
                    </select>
                  </div>
                  <button class="button button-success" @click="addInfraToVersion" :disabled="!selectedVersionInfraComponentId">Add</button>
                </div>

                <!-- Grille pour afficher 3 composants par ligne -->
                <div class="component-grid scroll-container">
                  <div v-for="(component, index) in versionInfraComponents" :key="index" class="component-item-grid">
                    <div class="component-info-compact">
                      <span class="component-name-compact">
                        {{ getIfraComponentVersionWithInfraCached(component.id).infraComponent.name }}
                      </span>
                      <span class="component-version-compact">{{ component.version }}</span>
                    </div>
                    <button
                      class="button-icon-compact"
                      @click="removeInfraFromVersion(index)"
                      aria-label="Supprimer"
                      v-if="hasAnyAuthority('ROLE_USER')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="icon"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div v-if="versionInfraComponents.length === 0" class="empty-message-grid">No selected component</div>
                </div>
              </div>
            </div>
            <!-- Modules Section -->
            <div class="card" v-if="activeVersionSettingsSection === 'modules'">
              <div align="right" class="mr-3">
                <button
                  class="button"
                  :class="{ 'button-primary': !showVersionModuleSelector, 'button-secondary': showVersionModuleSelector }"
                  @click="showVersionModuleSelector = !showVersionModuleSelector"
                  v-if="hasAnyAuthority('ROLE_USER')"
                >
                  {{ showVersionModuleSelector ? 'Close' : 'Add' }}
                </button>
              </div>
              <div class="card-body">
                <div v-if="showVersionModuleSelector" class="selector-container">
                  <div class="select-wrapper">
                    <select id="module-select" class="select" v-model="selectedModuleId" @change="fetchModuleVersionsForSelectedModule">
                      <option value="">Select a module</option>
                      <option v-for="module in selectedProduct.modules" :key="module.id" :value="module.id">
                        {{ module.name }}
                      </option>
                    </select>
                  </div>
                  <div class="select-wrapper" v-if="selectedModuleId">
                    <select id="module-version-select" class="select" v-model="selectedVersionModuleId">
                      <option value="">Select a version</option>
                      <option v-for="moduleVersion in filteredModuleVersionOptions" :key="moduleVersion.id" :value="moduleVersion.id">
                        {{ moduleVersion.version }}
                      </option>
                    </select>
                  </div>

                  <!-- Bouton pour ajouter la version du module -->
                  <button class="button button-success" @click="addModuleToVersion" :disabled="!selectedVersionModuleId">Add</button>
                </div>

                <!-- Grille pour afficher 5 modules par ligne -->
                <div class="component-grid scroll-container">
                  <div v-for="(moduleVersion, index) in versionModuleVersions" :key="index" class="component-item-grid">
                    <div class="component-info-compact p-3">
                      <span class="component-name-compact">
                        {{ getModuleVersionWithModuleCached(moduleVersion.id)?.module?.name }}
                      </span>
                      <span class="component-version-compact">{{ moduleVersion.version }}</span>
                    </div>
                    <button
                      class="button-icon-compact"
                      @click="removeModuleFromVersion(index)"
                      aria-label="Supprimer"
                      v-if="hasAnyAuthority('ROLE_USER')"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        stroke-width="2"
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        class="icon"
                      >
                        <line x1="18" y1="6" x2="6" y2="18"></line>
                        <line x1="6" y1="6" x2="18" y2="18"></line>
                      </svg>
                    </button>
                  </div>

                  <div v-if="versionModuleVersions.length === 0" class="empty-message-grid">No selected module</div>
                </div>
              </div>
            </div>
          </div>

          <div class="modal-footer">
            <button type="button" class="button button-secondary" @click="closeVersionSettingsModal" v-if="hasAnyAuthority('ROLE_USER')">
              Cancel
            </button>
            <button type="button" class="button button-primary" @click="saveVersionSettingsModal" v-if="hasAnyAuthority('ROLE_USER')">
              Save
            </button>
          </div>
        </div>
      </div>

      <!-- Module Versions Modal -->
      <div class="card modal fade show" v-if="showModuleVersionsModal" style="display: block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">{{ selectedModule ? selectedModule.name : '' }}</h5>
              <button type="button" class="close" @click="closeModuleVersionsModal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="d-flex justify-content-between mb-3">
                <h6 class="mb-0">List of versions</h6>
                <button class="button button-primary" @click="showAddModuleVersionRow = true" :disabled="showAddModuleVersionRow">
                  New Version
                </button>
              </div>
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Version</th>
                    <th>Notes</th>
                    <th class="pl-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="moduleVersions.length === 0 && !showAddModuleVersionRow">
                    <td colspan="5" class="text-center">No version available for this module</td>
                  </tr>
                  <tr v-for="(version, index) in moduleVersions" :key="index">
                    <td>{{ version.version }}</td>
                    <td class="text-truncate" style="max-width: 200px" :title="version.notes">
                      {{ version.notes || '-' }}
                    </td>
                    <td>
                      <div class="action-icons">
                        <div class="icon-container edit-container" @click="editModuleVersion(version)" title="Modifier">
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
                        <div class="icon-container delete-container" @click="removeModuleVersion(index)" title="Supprimer">
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
                        </div>
                      </div>
                    </td>
                  </tr>
                  <!-- Add new module version row -->
                  <tr v-if="showAddModuleVersionRow" class="add-row">
                    <td><input type="text" class="form-control-borderless" v-model="newModuleVersion.version" placeholder="Version" /></td>
                    <td><input type="text" class="form-control-borderless" v-model="newModuleVersion.notes" placeholder="Notes" /></td>
                    <td>
                      <div class="action-icons">
                        <div class="icon-container save-container" @click="saveNewModuleVersion" title="Enregistrer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-check2"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                            />
                          </svg>
                        </div>
                        <div class="icon-container cancel-container" @click="cancelNewModuleVersion" title="Annuler">
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
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
              <!-- Features Table -->
              <div v-if="showFeaturesTable" class="mt-4">
                <div class="d-flex justify-content-between mb-3">
                  <h6 class="mb-0">Features for version {{ selectedModuleVersion.version }}</h6>
                  <div>
                    <button type="button" class="button button-primary" @click="showAddFeatureRow = true" :disabled="showAddFeatureRow">
                      Add Feature
                    </button>
                    <button type="button" class="button button-secondary ml-2" @click="closeFeatureModule">x</button>
                  </div>
                </div>
                <table class="table table-hover">
                  <thead class="thead-light">
                    <tr>
                      <th>Name</th>
                      <th>Description</th>
                      <th>Created</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr v-if="features.length === 0 && !showAddFeatureRow">
                      <td colspan="4" class="text-center">No features available for this module version</td>
                    </tr>
                    <tr v-for="(feature, index) in features" :key="index">
                      <td>
                        <template v-if="feature.isEditing">
                          <input type="text" class="form-control-borderless" v-model="feature.name" placeholder="Name" />
                        </template>
                        <template v-else>
                          {{ feature.name }}
                        </template>
                      </td>
                      <td>
                        <template v-if="feature.isEditing">
                          <input type="text" class="form-control-borderless" v-model="feature.description" placeholder="Description" />
                        </template>
                        <template v-else>
                          {{ feature.description }}
                        </template>
                      </td>
                      <td>{{ formatDate(feature.createDate) }}</td>
                      <td>
                        <div class="action-icons">
                          <template v-if="feature.isEditing">
                            <div class="icon-container save-container" @click="saveEditFeature(feature)" title="Enregistrer">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-check2"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                                />
                              </svg>
                            </div>
                            <div class="icon-container cancel-container" @click="cancelEditFeature(feature)" title="Annuler">
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
                            </div>
                          </template>
                          <template v-else>
                            <div class="icon-container edit-container" @click="editFeature(feature)" title="Modifier">
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
                            <div class="icon-container delete-container" @click="removeFeature(index)" title="Supprimer">
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
                            </div>
                          </template>
                        </div>
                      </td>
                    </tr>
                    <!-- Add new feature row -->
                    <tr v-if="showAddFeatureRow" class="add-row">
                      <td><input type="text" class="form-control-borderless" v-model="newFeature.name" placeholder="Name" /></td>
                      <td>
                        <input type="text" class="form-control-borderless" v-model="newFeature.description" placeholder="Description" />
                      </td>
                      <td>{{ formatDate(newFeature.createDate) }}</td>
                      <td>
                        <div class="action-icons">
                          <div class="icon-container save-container" @click="saveNewFeature" title="Enregistrer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-check2"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                              />
                            </svg>
                          </div>
                          <div class="icon-container cancel-container" @click="cancelNewFeature" title="Annuler">
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
                          </div>
                        </div>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
      <!-- Module Features Modal -->
      <div class="card modal fade show" v-if="showModuleFeaturesModal" style="display: block" tabindex="-1" role="dialog">
        <div class="modal-dialog modal-lg" role="document">
          <div class="modal-content">
            <div class="modal-header">
              <h5 class="modal-title">Features</h5>
              <button type="button" class="close" @click="closeModuleFeaturesModal">
                <span>&times;</span>
              </button>
            </div>
            <div class="modal-body">
              <div class="d-flex justify-content-between mb-3">
                <h6 class="mb-0">{{ moduleVersionSelected }}</h6>
                <button
                  class="button button-primary"
                  @click="showAddFeatureRow = true"
                  :disabled="showAddFeatureRow"
                  v-if="hasAnyAuthority('ROLE_USER')"
                >
                  Add Feature
                </button>
              </div>
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Name</th>
                    <th>Description</th>
                    <th v-if="hasAnyAuthority('ROLE_USER')">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="features.length === 0 && !showAddFeatureRow">
                    <td colspan="4" class="text-center">No features available for this module version</td>
                  </tr>
                  <tr v-for="(feature, index) in features" :key="index">
                    <td>
                      <template v-if="feature.isEditing">
                        <input type="text" class="form-control-borderless" v-model="feature.name" placeholder="Name" />
                      </template>
                      <template v-else>
                        {{ feature.name }}
                      </template>
                    </td>
                    <td>
                      <template v-if="feature.isEditing">
                        <input type="text" class="form-control-borderless" v-model="feature.description" placeholder="Description" />
                      </template>
                      <template v-else>
                        {{ feature.description }}
                      </template>
                    </td>
                    <td v-if="hasAnyAuthority('ROLE_USER')">
                      <div class="action-icons">
                        <template v-if="feature.isEditing">
                          <div class="icon-container save-container" @click="saveEditFeature(feature)" title="Enregistrer">
                            <svg
                              xmlns="http://www.w3.org/2000/svg"
                              width="16"
                              height="16"
                              fill="currentColor"
                              class="bi bi-check2"
                              viewBox="0 0 16 16"
                            >
                              <path
                                d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                              />
                            </svg>
                          </div>
                          <div class="icon-container cancel-container" @click="cancelEditFeature(feature)" title="Annuler">
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
                          </div>
                        </template>
                        <template v-else>
                          <div class="icon-container edit-container" @click="editFeature(feature)" title="Modifier">
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
                          <div class="icon-container delete-container" @click="removeFeature(index)" title="Supprimer">
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
                          </div>
                        </template>
                      </div>
                    </td>
                  </tr>
                  <!-- Add new feature row -->
                  <tr v-if="showAddFeatureRow" class="add-row">
                    <td><input type="text" class="form-control-borderless" v-model="newFeature.name" placeholder="Name" /></td>
                    <td>
                      <input type="text" class="form-control-borderless" v-model="newFeature.description" placeholder="Description" />
                    </td>
                    <td>
                      <div class="action-icons">
                        <div class="icon-container save-container" @click="saveNewFeature" title="Enregistrer">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-check2"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M13.854 3.646a.5.5 0 0 1 0 .708l-7 7a.5.5 0 0 1-.708 0l-3.5-3.5a.5.5 0 1 1 .708-.708L6.5 10.293l6.646-6.647a.5.5 0 0 1 .708 0z"
                            />
                          </svg>
                        </div>
                        <div class="icon-container cancel-container" @click="cancelNewFeature" title="Annuler">
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
                        </div>
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>

      <!-- Delete Confirmation Modal -->
      <b-modal ref="removeEntity" id="removeEntity" centered title-class="text-danger">
        <template #modal-title>
          <div class="d-flex align-items-center">
            <font-awesome-icon icon="exclamation-triangle" class="text-danger mr-2"></font-awesome-icon>
            <span
              id="sdiFrontendApp.product.delete.question"
              data-cy="productDeleteDialogHeading"
              v-text="t$('entity.delete.title')"
              class="font-weight-bold"
            ></span>
          </div>
        </template>
        <div class="modal-body">
          <p id="jhi-delete-product-heading" class="mb-0" v-text="t$('sdiFrontendApp.product.delete.question', {})"></p>
        </div>
        <template #modal-footer>
          <div class="w-100">
            <div class="d-flex justify-content-between">
              <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
              <button
                type="button"
                class="btn btn-danger"
                id="jhi-confirm-delete-product"
                data-cy="entityConfirmDeleteButton"
                v-text="t$('entity.action.delete')"
                @click="removeProduct()"
              ></button>
            </div>
          </div>
        </template>
      </b-modal>

      <!-- Version Delete Confirmation Modal -->
      <b-modal ref="removeVersionEntity" id="removeVersionEntity" centered title-class="text-danger">
        <template #modal-title>
          <div class="d-flex align-items-center">
            <font-awesome-icon icon="exclamation-triangle" class="text-danger mr-2"></font-awesome-icon>
            <span
              id="sdiFrontendApp.productVersion.delete.question"
              data-cy="productVersionDeleteDialogHeading"
              v-text="t$('entity.delete.title')"
              class="font-weight-bold"
            ></span>
          </div>
        </template>
        <div class="modal-body">
          <p
            id="jhi-delete-productVersion-heading"
            class="mb-0"
            v-text="t$('sdiFrontendApp.productVersion.delete.question', { id: removeVersionId })"
          ></p>
        </div>
        <template #modal-footer>
          <div class="w-100">
            <div class="d-flex justify-content-between">
              <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeVersionDialog()"></button>
              <button
                type="button"
                class="btn btn-danger"
                id="jhi-confirm-delete-productVersion"
                data-cy="entityConfirmDeleteButton"
                v-text="t$('entity.action.delete')"
                @click="removeProductVersion()"
              ></button>
            </div>
          </div>
        </template>
      </b-modal>

      <!-- Module Delete Confirmation Modal -->
      <b-modal ref="removeModuleEntity" id="removeModuleEntity" centered title-class="text-danger">
        <template #modal-title>
          <div class="d-flex align-items-center">
            <font-awesome-icon icon="exclamation-triangle" class="text-danger mr-2"></font-awesome-icon>
            <span
              id="sdiFrontendApp.module.delete.question"
              data-cy="moduleDeleteDialogHeading"
              v-text="t$('entity.delete.title')"
              class="font-weight-bold"
            ></span>
          </div>
        </template>
        <div class="modal-body">
          <p id="jhi-delete-module-heading" class="mb-0" v-text="t$('sdiFrontendApp.module.delete.question', { id: removeModuleId })"></p>
        </div>
        <template #modal-footer>
          <div class="w-100">
            <div class="d-flex justify-content-between">
              <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeModuleDialog()"></button>
              <button
                type="button"
                class="btn btn-danger"
                id="jhi-confirm-delete-module"
                data-cy="entityConfirmDeleteButton"
                v-text="t$('entity.action.delete')"
                @click="removeModuleConfirm()"
              ></button>
            </div>
          </div>
        </template>
      </b-modal>
    </div>

    <div class="section"></div>
    <div class="section"></div>
    <div class="section"></div>
  </div>
</template>

<script lang="ts" src="./product.component.ts"></script>

<style scoped>
.component-grid {
  display: grid;
  grid-template-columns: repeat(5, 1fr);
  gap: 0.75rem;
  padding: 0;
  margin: 0;
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
}

/* Élément de composant compact */
.component-item-grid {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem 0.5rem;
  border-radius: 8px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
  min-height: 100px;
  position: relative;
}

.component-item-grid:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

/* Informations du composant compactes */
.component-info-compact {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 0.25rem;
  flex-grow: 1;
  justify-content: center;
}

.component-name-compact {
  font-weight: 600;
  color: #0f172a;
  font-size: 0.875rem;
  line-height: 1.2;
  word-break: break-word;
  hyphens: auto;
}

.component-version-compact {
  font-size: 0.75rem;
  color: #64748b;
  background-color: #e2e8f0;
  padding: 0.125rem 0.375rem;
  border-radius: 12px;
  font-weight: 500;
}

/* Bouton de suppression compact */
.button-icon-compact {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.25rem;
  border-radius: 4px;
  transition: all 0.2s;
  position: absolute;
  top: 0.5rem;
  right: 0.5rem;
  width: 24px;
  height: 24px;
}

.button-icon-compact:hover {
  background-color: #fee2e2;
  color: #dc2626;
}

/* Message vide pour la grille */
.empty-message-grid {
  grid-column: 1 / -1;
  padding: 2rem;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 8px;
  border: 2px dashed #e2e8f0;
}

/* Responsive design */
@media (max-width: 768px) {
  .component-grid {
    grid-template-columns: repeat(2, 1fr);
    gap: 0.5rem;
  }
}

@media (max-width: 480px) {
  .component-grid {
    grid-template-columns: 1fr;
  }
}

/* Styles existants pour la cohérence */
.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-body {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}

.selector-container {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.select-wrapper {
  position: relative;
  flex: 1;
}

.select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #0f172a;
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  padding-right: 2rem;
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

.button-secondary {
  background-color: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

.button-success {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

.button-success:disabled {
  background-color: #d1d5db;
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.7;
}

.scroll-container {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
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
.scroll-container {
  max-height: 250px;
  overflow-y: auto;
  padding-right: 0.5rem;
}
/* Modal Backdrop */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

/* Modal Container */
.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  background-color: #fff;
  width: 90%;
  max-width: 800px;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  z-index: 1001;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-content {
  display: flex;
  flex-direction: column;
  height: 100%;
}

.modal-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 1rem;
  border-bottom: 1px solid #e5e8eb;
}

.modal-title {
  margin: 0;
  font-size: 1.25rem;
  color: #1a2526;
}

.close-button {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.close-button .icon {
  color: #1a2526;
}

/* Tabs Header */
.tabs-header {
  padding: 0 1rem;
  border-bottom: 2px solid #e5e8eb;
}

.tabs-list {
  display: flex;
  gap: 0.5rem;
}

.tab-item {
  padding: 0.75rem 1rem;
  cursor: pointer;
  color: #a0b3b7; /* Gray for inactive tabs */
  transition: color 0.2s ease;
}

.tab-item.active {
  color: #1a2526; /* Black for active tab */
  border-bottom: 2px solid #1a2526; /* Underline for active tab */
}

.tab-item:hover {
  color: #1a2526;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
}

.card-title .icon {
  color: inherit; /* Inherit color from parent (gray or black) */
}

/* Modal Body */
.modal-body {
  padding: 1rem;
  overflow-y: auto;
  flex-grow: 1;
}

.grid {
  display: grid;
  gap: 1rem;
}

/* Card Styling */
.card {
  border: 1px solid #e5e8eb;
  border-radius: 6px;
  overflow: hidden;
}

.card-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.75rem 1rem;
  background-color: #f9fafb;
  border-bottom: 1px solid #e5e8eb;
}

.card-body {
  padding: 1rem;
}

/* Buttons */
.button {
  padding: 0.5rem 1rem;
  border-radius: 4px;
  font-size: 0.875rem;
  cursor: pointer;
  border: none;
}

.button-primary {
  background-color: #007bff;
  color: #fff;
}

.button-secondary {
  background-color: #6c757d;
  color: #fff;
}

.button-success {
  background-color: #28a745;
  color: #fff;
}

.button-icon {
  background: none;
  border: none;
  cursor: pointer;
  padding: 0.25rem;
}

.button-icon .icon {
  color: #131f3a;
}

/* Selector Container */
.selector-container {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 1rem;
  align-items: flex-end;
}

.select-wrapper {
  flex: 1;
}

.select {
  width: 100%;
  padding: 0.5rem;
  border: 1px solid #ced4da;
  border-radius: 4px;
  font-size: 0.875rem;
}

/* Component List */
.component-list {
  list-style: none;
  padding: 0;
  margin: 0;
}

.component-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0.1rem 0;
  border-bottom: 0px solid #e5e8eb;
}

.component-info {
  display: flex;
  flex-direction: column;
}

.component-name {
  font-weight: 500;
  color: #1a2526;
}

.component-version {
  color: #a0b3b7;
  font-size: 0.875rem;
}

.empty-message {
  padding: 0.5rem 0;
  color: #a0b3b7;
  font-style: italic;
}

/* Modal Footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 0.5rem;
  padding: 1rem;
  border-top: 1px solid #e5e8eb;
}

/* Existing styles (unchanged, included for context) */
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

/* New styles for logo input */
.logo-input-container {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

.custom-file-upload {
  position: relative;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.form-control-file {
  width: 0.1px;
  height: 0.1px;
  opacity: 0;
  overflow: hidden;
  position: absolute;
  z-index: -1;
}

.file-upload-label {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0.75rem;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: #fff;
  border: 1px solid #ced4da;
  border-radius: 6px;
  cursor: pointer;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out,
    background-color 0.15s ease-in-out;
}

.file-upload-label:hover {
  background-color: #f8f9fa;
  border-color: #b8c2cc;
}

.file-upload-label:focus-within {
  outline: none;
  border-color: #007bff;
  box-shadow: 0 0 0 2px rgba(0, 123, 255, 0.2);
}

.file-upload-text {
  flex-grow: 1;
  text-align: left;
}

.upload-icon {
  flex-shrink: 0;
  color: #6c757d;
}

.form-text {
  font-size: 0.85rem;
  margin-top: 0.25rem;
}

.logo-preview {
  margin-top: 0.5rem;
}

.logo-thumbnail {
  max-width: 80px;
  max-height: 80px;
  object-fit: contain;
  border-radius: 4px;
  border: 1px solid #e2e8f0;
  background-color: #f8f9fa;
}

/* Ensure consistency with other inputs */
select.form-control-borderless {
  padding: 0.375rem 0;
  height: calc(1.5em + 0.75rem + 2px);
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  padding-right: 2rem;
  appearance: none;
}

select.form-control-borderless:focus {
  outline: none;
  border-bottom: 2px solid #007bff;
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .file-upload-label {
    font-size: 0.9rem;
    padding: 0.3rem 0.6rem;
  }

  .logo-thumbnail {
    max-width: 60px;
    max-height: 60px;
  }
}
.component-info-s {
  display: flex;
  align-items: center;
  flex-wrap: nowrap;
}

.component-version,
.component-root {
  margin-left: 8px;
}
/* Style général pour la ligne contenant les modules */
.modules-row td {
  padding: 0;
  border-top: none;
}

/* Conteneur des modules */
.modules-row .p-3.bg-light {
  background-color: #f8f9fa !important;
  border-radius: 0.25rem;
  margin: 0 0.5rem 0.75rem 0.5rem;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #dee2e6;
}

/* Titre des modules */
.modules-row h6 {
  color: #495057;
  font-weight: 600;
  font-size: 0.95rem;
  border-bottom: 1px solid #e9ecef;
  padding-bottom: 0.75rem;
  margin-bottom: 1rem;
}

/* Tableau des modules */
.modules-row .table-responsive {
  margin-bottom: 0;
}

.modules-row .table {
  margin-bottom: 0;
}

.modules-row .table-sm {
  font-size: 0.9rem;
}

/* Entêtes du tableau des modules */
.modules-row .table thead th {
  background-color: #f1f3f5;
  color: #495057;
  font-weight: 600;
  border-bottom-width: 1px;
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
  font-size: 0.85rem;
  text-transform: uppercase;
  letter-spacing: 0.5px;
}

/* Cellules du tableau des modules */
.modules-row .table-bordered td {
  padding: 0.5rem 0.75rem;
  vertical-align: middle;
  border-color: #e9ecef;
}

/* Message quand il n'y a pas de modules */
.modules-row .text-muted {
  font-style: italic;
  font-size: 0.9rem;
  padding: 0.75rem;
  background-color: #f8f9fa;
  border-radius: 0.25rem;
}

/* Animation d'expansion */
.modules-row {
  transition: all 0.3s ease;
}

/* Style pour l'icône d'expansion */
svg.expanded {
  transform: rotate(90deg);
  transition: transform 0.3s ease;
}

/* Amélioration de la flèche d'expansion */
.expand-container {
  transition: background-color 0.2s ease;
  border-radius: 50%;
  padding: 2px;
}

.expand-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

/* Ajustement de la bordure du tableau principal */
tr.selected-row + .modules-row td {
  border-top: none;
}

/* Surlignage de la rangée sélectionnée */
tr.selected-row {
  background-color: #e2e8f0; /* Darker gray for better contrast */
  color: #1a202c; /* Darker text color for readability */
  border-left: 4px solid #0c2d57; /* Add a left border for emphasis */
  transition:
    background-color 0.3s ease,
    color 0.3s ease;
}

tr:not(.add-row):hover {
  background-color: #f8f9fa;
  transition: background-color 0.3s ease;
}

/* Ensure add-row has distinct styling */
.add-row {
  background-color: rgba(0, 123, 255, 0.03);
}

/* Ajustements pour la cohérence visuelle */
.modules-row .table-bordered {
  border: 1px solid #dee2e6;
}

/* Style pour les cellules avec des données */
.modules-row .table tbody td {
  color: #212529;
}
/* Style pour la ligne des modules */
.modules-row {
  background-color: #f8fafc;
}

.modules-row td {
  padding: 0 !important;
}

.modules-row .table {
  margin-bottom: 0;
}

.modules-row .table th {
  font-size: 0.75rem;
  background-color: #f1f5f9;
}

.modules-row .table td {
  font-size: 0.875rem;
  padding: 0.5rem !important;
}
.new-module-form {
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 1rem;
  background-color: #f8fafc;
}

.new-module-form input,
.new-module-form textarea {
  border: 1px solid #cbd5e1;
  border-radius: 6px;
  padding: 0.5rem;
}

.new-module-form input:focus,
.new-module-form textarea:focus {
  outline: none;
  border-color: #0c2d57;
  box-shadow: 0 0 0 2px rgba(12, 45, 87, 0.1);
}
tr:not(.add-row):hover {
  background-color: #f8f9fa;
}
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
  max-width: 900px;
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
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
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
  padding: 1.5rem;
  overflow-y: auto;
}

.grid {
  display: grid;
  grid-template-columns: 1fr;
  gap: 0.7rem;
}

@media (min-width: 768px) {
  .grid {
    grid-template-columns: repeat(2, 1fr);
  }
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

.card-header {
  padding: 1rem;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f4f5f6;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #0f172a;
}

.card-title-s {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 500;
  color: #131f3a;
}
.card-body-m {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
}

.card-body {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  max-height: 900px;
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

.button-success {
  background-color: #10b981;
  color: white;
  border-color: #10b981;
}

.button-success:hover {
  background-color: #059669;
}

.button-success:disabled {
  background-color: #d1d5db;
  border-color: #d1d5db;
  cursor: not-allowed;
  opacity: 0.7;
}

.button-icon {
  display: flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.375rem;
  border-radius: 6px;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.button-icon:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.button-info {
  color: #0c2d57;
}

.button-info:hover {
  background-color: rgba(12, 45, 87, 0.1);
}

.selector-container {
  display: flex;
  gap: 0.75rem;
  margin-bottom: 1rem;
  padding-bottom: 1rem;
  border-bottom: 1px solid #f1f5f9;
}

.select-wrapper {
  position: relative;
  flex: 1;
}

.select {
  width: 100%;
  padding: 0.5rem 0.75rem;
  border-radius: 6px;
  border: 1px solid #e2e8f0;
  background-color: white;
  color: #0f172a;
  font-size: 0.875rem;
  appearance: none;
  background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='24' height='24' viewBox='0 0 24 24' fill='none' stroke='%2364748b' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpolyline points='6 9 12 15 18 9'%3E%3C/polyline%3E%3C/svg%3E");
  background-repeat: no-repeat;
  background-position: right 0.5rem center;
  background-size: 1rem;
  padding-right: 2rem;
}

.select:focus {
  outline: none;
  border-color: #0c2d57;
  box-shadow: 0 0 0 2px rgba(12, 45, 87, 0.2);
}

.component-list {
  list-style: none;
  padding: 0;
  margin: 0;
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
}

.component-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.75rem;
  border-radius: 6px;
  background-color: #f8fafc;
  border: 1px solid #e2e8f0;
  transition: all 0.2s;
}

.component-item:hover {
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.component-info {
  display: flex;
  flex-direction: column;
  gap: 0.25rem;
}

.component-name {
  font-weight: 500;
  color: #0f172a;
}

.component-version {
  font-size: 0.75rem;
  color: #64748b;
}

.action-buttons {
  display: flex;
  gap: 0.5rem;
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

.modal-footer {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.icon {
  flex-shrink: 0;
}

.product-details {
  overflow: hidden;
}

.placeholder-logo {
  background-color: #f8f9fa;
}

@media (max-width: 991.98px) {
  .col-lg-8 {
    border-right: none !important;
    border-bottom: 1px solid #dee2e6;
  }
}
.stat-icon {
  width: 42px;
  height: 42px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.stat-card {
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.stat-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
}

@media (max-width: 991.98px) {
  .col-lg-8 {
    border-right: none !important;
    border-bottom: 1px solid #dee2e6;
  }
}
.product-container {
  padding: 1.5rem;
}

.navigation-bar {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.search-container {
  width: 40%;
  max-width: 500pblox;
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

.form-control {
  font-size: 0.9rem;
}

.add-row {
  background-color: rgba(0, 123, 255, 0.03);
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
}

.tab-item.active {
  color: #000;
  font-weight: 500;
}

.tab-item:not(.active) {
  color: #6c757d;
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
  background-color: #000;
}

/* Badge styles */
.badge {
  padding: 0.25em 0.6em;
  font-size: 75%;
  font-weight: 700;
  border-radius: 0.25rem;
}

.badge-success {
  color: #fff;
  background-color: #28a745;
}

.badge-warning {
  color: #212529;
  background-color: #ffc107;
}

.badge-danger {
  color: #fff;
  background-color: #dc3545;
}

.badge-secondary {
  color: #fff;
  background-color: #6c757d;
}

/* Modal overlay */
.modal {
  background-color: rgba(0, 0, 0, 0.5);
}

.modal-content {
  border-radius: 0.5rem;
  border: none;
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
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

/* Breadcrumb navigation */
.breadcrumb-navigation {
  padding: 0.5rem 0;
}

.breadcrumb-item {
  font-size: 0.9rem;
}

.breadcrumb-item.active {
  font-weight: 600;
  color: #0f172a;
}

.breadcrumb-item.clickable {
  color: #0c2d57;
  cursor: pointer;
}

.breadcrumb-item.clickable:hover {
  text-decoration: underline;
}

/* Product detail view transitions */
.product-detail-view {
  transition: all 2s ease;
}

/* Content transitions */
.tab-content > div {
  transition: all 2s ease;
}
</style>
