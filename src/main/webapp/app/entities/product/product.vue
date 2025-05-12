<template>
  <div class="product-container section pt-5">
    <!-- Navigation Bar -->
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <button
          @click="showAddRow = true"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn btn-primary btn-sm mr-3 rounded-1"
          :disabled="showAddRow"
        >
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
        <button class="btn btn-light btn-sm ml-3" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.product.home.refreshListLabel')"></span>
        </button>
      </div>
    </div>

    <!-- Data table -->
    <div class="card">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="products">
          <thead class="thead-light">
            <tr>
              <th scope="col" width="50"></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.product.logo')"></span></th>
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
            >
              <td class="text-center">
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="checkbox"
                    :id="`product-${product.id}`"
                    :checked="selectedProduct && selectedProduct.id === product.id"
                    @change="toggleProductSelection(product)"
                  />
                </div>
              </td>
              <td>
                <template v-if="product.isEditing">
                  <input type="text" class="form-control-borderless" v-model="product.logo" placeholder="Logo URL" />
                </template>
                <template v-else>
                  <img v-if="product.logo" :src="product.logo" :alt="product.name + ' logo'" class="product-logo" width="40" height="40" />
                  <span v-else>-</span>
                </template>
              </td>
              <td>
                <template v-if="product.isEditing">
                  <input type="text" class="form-control-borderless" v-model="product.name" placeholder="Nom" />
                </template>
                <template v-else>
                  {{ product.name }}
                </template>
              </td>
              <td class="text-truncate" style="max-width: 200px">
                <template v-if="product.isEditing">
                  <input type="text" class="form-control-borderless" v-model="product.description" placeholder="Description" />
                </template>
                <template v-else>
                  <span :title="product.description">{{ product.description }}</span>
                </template>
              </td>
              <td>
                <template v-if="product.isEditing">
                  <select v-model="editProductLineIds" multiple class="form-control-borderless" @change="updateEditProductLines(product)">
                    <option v-for="productLine in productLineOptions" :key="productLine.id" :value="productLine.id">
                      {{ productLine.name }}
                    </option>
                  </select>
                  <div v-if="product.productLines && product.productLines.length > 0" class="selected-items mt-2">
                    <span v-for="line in product.productLines" :key="line.id" class="badge badge-primary mr-1">
                      {{ line.name }}
                      <button type="button" class="close ml-1" @click="removeEditProductLine(product, line.id)">&times;</button>
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
              <td class="text-center">
                <div class="action-icons">
                  <template v-if="product.isEditing">
                    <div class="icon-container save-container" @click="saveEditProduct(product)" title="Enregistrer">
                      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save" height="16" width="16">
                        <path
                          d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                          fill="currentColor"
                        />
                      </svg>
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
                    <div class="icon-container edit-container" @click="editProduct(product)" title="Modifier">
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
                    <div class="icon-container delete-container" @click="prepareRemove(product)" title="Supprimer">
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
                        width="14"
                        height="14"
                        fill="currentColor"
                        class="bi bi-gear"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M8 4.754a3.246 3.246 0 1 0 0 6.492 3.246 3.246 0 0 0 0-6.492zM5.754 8a2.246 2.246 0 1 1 4.492 0 2.246 2.246 0 0 1-4.492 0z"
                        />
                        <path
                          d="M9.796 1.343c-.527-1.79-3.065-1.79-3.592 0l-.094.319a.873.873 0 0 1-1.255.52l-.292-.16c-1.64-.892-3.433.902-2.54 2.541l.159.292a.873.873 0 0 1-.52 1.255l-.319.094c-1.79.527-1.79 3.065 0 3.592l.319.094a.873.873 0 0 1 .52 1.255l-.16.292c-.892 1.64.901 3.434 2.541 2.54l.292-.159a.873.873 0 0 1 1.255.52l.094.319c.527 1.79 3.065 1.79 3.592 0l.094-.319a.873.873 0 0 1 1.255-.52l.292.16c1.64.893 3.434-.902 2.54-2.541l-.159-.292a.873.873 0 0 1 .52-1.255l.319-.094c1.79-.527 1.79-3.065 0-3.592l-.319-.094a.873.873 0 0 1-.52-1.255l.16-.292c.893-1.64-.902-3.433-2.541-2.54l-.292.159a.873.873 0 0 1-1.255-.52l-.094-.319zm-2.633.283c.246-.835 1.428-.835 1.674 0l.094.319a1.873 1.873 0 0 0 2.693 1.115l.291-.16c.764-.415 1.6.42 1.184 1.185l-.159.292a1.873 1.873 0 0 0 1.116 2.692l.318.094c.835.246.835 1.428 0 1.674l-.319.094a1.873 1.873 0 0 0-1.115 2.693l.16.291c.415.764-.42 1.6-1.185 1.184l-.291-.159a1.873 1.873 0 0 0-2.693 1.116l-.094.318c-.246.835-1.428.835-1.674 0l-.094-.319a1.873 1.873 0 0 0-2.692-1.115l-.292.16c-.764.415-1.6-.42-1.184-1.185l.159-.291a1.873 1.873 0 0 0-1.116-2.693l-.318-.094c-.835-.246-.835-1.428 0-1.674l.319-.094a1.873 1.873 0 0 0 1.115-2.692l-.16-.292c-.415-.764.42-1.6 1.185-1.184l.292.159a1.873 1.873 0 0 0 2.692-1.115l.094-.319z"
                        />
                      </svg>
                    </div>
                  </template>
                </div>
              </td>
            </tr>

            <!-- Row to add a new product -->
            <tr v-if="showAddRow" class="add-row">
              <td></td>
              <td><input type="text" class="form-control-borderless" v-model="newProduct.logo" placeholder="Logo URL" /></td>
              <td><input type="text" class="form-control-borderless" v-model="newProduct.name" placeholder="Nom" /></td>
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
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save" height="16" width="16">
                      <path
                        d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                        fill="currentColor"
                      />
                    </svg>
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
    </div>

    <!-- Detailed View Section (appears when a product is selected) -->
    <div v-if="selectedProduct" class="mt-4">
      <div class="card-header d-flex justify-content-between align-items-center">
        <h6 class="m-0">{{ selectedProduct.name }}</h6>
        <button class="btn btn-sm btn-outline-secondary rounded-1" @click="returnToProductList">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-arrow-left" viewBox="0 0 16 16">
            <path
              fillRule="evenodd"
              d="M15 8a.5.5 0 0 0-.5-.5H2.707l3.147-3.146a.5.5 0 1 0-.708-.708l-4 4a.5.5 0 0 0 0 .708l4 4a.5.5 0 0 0 .708-.708L2.707 8.5H14.5A.5.5 0 0 0 15 8z"
            />
          </svg>
          Back to list
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

          <!-- Tab Content -->
          <div class="tab-content mt-4">
            <!-- Details -->
            <div v-if="activeTabIndex === 0" class="product-details border rounded bg-white">
              <div class="row g-0 p-3">
                <div class="col-lg-12">
                  <div class="p-3">
                    <div class="mb-4 d-flex justify-content-between align-items-start">
                      <div class="flex-grow-1">
                        <h6 class="text-muted mb-2 small">Description</h6>
                        <p class="mb-0">{{ selectedProduct.description || 'No description available' }}</p>
                      </div>
                      <div class="ms-4 text-end">
                        <h6 class="text-muted mb-2 small">Created</h6>
                        <div
                          class="alert alert-secondary d-inline-flex align-items-center py-1 px-2 btn-sm"
                          style="font-size: 0.9rem; line-height: 1; gap: 0.25rem; margin-top: 0px; margin-bottom: 0px"
                        >
                          {{ formatDate(selectedProduct.createDate) }}
                        </div>
                      </div>
                    </div>

                    <!-- Product Lines -->
                    <div>
                      <h6 class="text-muted mb-2 small">Product Lines</h6>
                      <div v-if="selectedProduct.productLines && selectedProduct.productLines.length > 0" class="d-flex flex-wrap">
                        <span
                          v-for="productLine in selectedProduct.productLines"
                          :key="productLine.id"
                          class="badge bg-light text-dark me-2 mb-2 px-2 py-1 border"
                        >
                          {{ productLine.name }}
                        </span>
                      </div>
                      <p v-else class="text-muted mb-0">No product lines assigned</p>
                    </div>
                  </div>
                </div>
                <div class="row pt-lg-3">
                  <!-- Versions -->
                  <div class="col-md-4 mb-4 pl-5">
                    <div class="mb-3 pb-3 pl-2 border-left">
                      <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-layers text-secondary"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M8.235 1.559a.5.5 0 0 0-.47 0l-7.5 4a.5.5 0 0 0 0 .882L3.188 8 .264 9.559a.5.5 0 0 0 0 .882l7.5 4a.5.5 0 0 0 .47 0l7.5-4a.5.5 0 0 0 0-.882L12.813 8l2.922-1.559a.5.5 0 0 0 0-.882l-7.5-4zm3.515 7.008L14.438 10 8 13.433 1.562 10 4.25 8.567l3.515 1.874a.5.5 0 0 0 .47 0l3.515-1.874zM8 9.433 1.562 6 8 2.567 14.438 6 8 9.433z"
                            />
                          </svg>
                        </div>
                        <div class="flex-grow-1">
                          <div class="d-flex align-items-baseline">
                            <span class="h5 mb-0 me-2">{{ productVersions.length }}</span>
                            <span class="text-muted small">Versions</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Modules -->
                  <div class="col-md-4 mb-4">
                    <div class="mb-3 pb-3 border-left">
                      <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-puzzle text-secondary"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M3.112 3.645A1.5 1.5 0 0 1 4.605 2H7a.5.5 0 0 1 .5.5v.382c0 .696-.497 1.182-.872 1.469a.459.459 0 0 0-.115.118.113.113 0 0 0-.012.025L6.5 4.5v.003l.003.01c.004.01.014.028.036.053a.86.86 0 0 0 .27.194C7.09 4.9 7.51 5 8 5c.492 0 .912-.1 1.19-.24a.86.86 0 0 0 .271-.194.213.213 0 0 0 .039-.063v-.009a.112.112 0 0 0-.012-.025.459.459 0 0 0-.115-.118c-.375-.287-.872-.773-.872-1.469V2.5A.5.5 0 0 1 9 2h2.395a1.5 1.5 0 0 1 1.493 1.645L12.645 6.5h.237c.195 0 .42-.147.675-.48.21-.274.528-.52.943-.52.568 0 .947.447 1.154.862C15.877 6.807 16 7.387 16 8s-.123 1.193-.346 1.638c-.207.415-.586.862-1.154.862-.415 0-.733-.246-.943-.52-.255-.333-.48-.48-.675-.48h-.237l.243 2.855A1.5 1.5 0 0 1 11.395 14H9a.5.5 0 0 1-.5-.5v-.382c0-.696.497-1.182.872-1.469a.459.459 0 0 0 .115-.118.113.113 0 0 0 .012-.025L9.5 11.5v-.003a.214.214 0 0 0-.039-.064.859.859 0 0 0-.27-.193C8.91 11.1 8.49 11 8 11c-.491 0-.912.1-1.19.24a.859.859 0 0 0-.271.194.214.214 0 0 0-.039.063v.003l.001.006a.113.113 0 0 0 .012.025c.016.027.05.068.115.118.375.287.872.773.872 1.469v.382a.5.5 0 0 1-.5.5H4.605a1.5 1.5 0 0 1-1.493-1.645L3.356 9.5h-.238c-.195 0-.42.147-.675.48-.21.274-.528.52-.943.52-.568 0-.947-.447-1.154-.862C.123 9.193 0 8.613 0 8s.123-1.193.346-1.638C.553 5.947.932 5.5 1.5 5.5c.415 0 .733.246.943.52.255.333.48.48.675.48h.238l-.244-2.855z"
                            />
                          </svg>
                        </div>
                        <div class="flex-grow-1">
                          <div class="d-flex align-items-baseline">
                            <span class="h5 mb-0 me-2">{{ selectedProduct.modules ? selectedProduct.modules.length : 0 }}</span>
                            <span class="text-muted small">Modules</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  <!-- Product Lines -->
                  <div class="col-md-4 mb-4">
                    <div class="mb-3 pb-3 border-left">
                      <div class="d-flex align-items-center">
                        <div class="stat-icon me-3">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="16"
                            height="16"
                            fill="currentColor"
                            class="bi bi-tag text-secondary"
                            viewBox="0 0 16 16"
                          >
                            <path d="M6 4.5a1.5 1.5 0 1 1-3 0 1.5 1.5 0 0 1 3 0zm-1 0a.5.5 0 1 0-1 0 .5.5 0 0 0 1 0z" />
                            <path
                              d="M2 1h4.586a1 1 0 0 1 .707.293l7 7a1 1 0 0 1 0 1.414l-4.586 4.586a1 1 0 0 1-1.414 0l-7-7A1 1 0 0 1 1 6.586V2a1 1 0 0 1 1-1zm0 5.586 7 7L13.586 9l-7-7H2v4.586z"
                            />
                          </svg>
                        </div>
                        <div class="flex-grow-1">
                          <div class="d-flex align-items-baseline">
                            <span class="h5 mb-0 me-2">{{ selectedProduct.productLines ? selectedProduct.productLines.length : 0 }}</span>
                            <span class="text-muted small">Product Lines</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Versions Tab -->
            <div v-if="activeTabIndex === 1" class="versions-tab">
              <div class="d-flex justify-content-between mb-3">
                <h6 class="mb-0">Product versions</h6>
                <button class="btn btn-sm btn-primary rounded-1" @click="showAddVersionRow = true" :disabled="showAddVersionRow">
                  New Version
                </button>
              </div>
              <table class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th width="50"></th>
                    <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.version')"></span></th>
                    <th scope="col"><span v-text="t$('sdiFrontendApp.productVersion.root')"></span></th>
                    <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.notes')"></span></th>
                    <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.createDate')"></span></th>
                    <th scope="row" class="pl-lg-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="productVersions.length === 0 && !showAddVersionRow">
                    <td colspan="6" class="text-center">
                      <span>No version available</span>
                    </td>
                  </tr>
                  <tr
                    v-for="(version, index) in paginatedVersions"
                    :key="index"
                    :class="{ 'selected-row': selectedVersion && selectedVersion.id === version.id }"
                  >
                    <td class="text-center">
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="checkbox"
                          :id="`version-${index}`"
                          :checked="selectedVersion && selectedVersion.id === version.id"
                          @change="toggleVersionSelection(version)"
                        />
                      </div>
                    </td>
                    <td>
                      <template v-if="isEditingVersion && editingVersionData && editingVersionData.id === version.id">
                        <input type="text" class="form-control-borderless" v-model="editingVersionData.version" placeholder="Version" />
                      </template>
                      <template v-else>
                        {{ version.version }}
                      </template>
                    </td>
                    <td>
                      <template v-if="isEditingVersion && editingVersionData && editingVersionData.id === version.id">
                        <select v-model="editingVersionData.root" class="form-control-borderless">
                          <option v-for="option in productVersions" :key="option.id" :value="option">
                            {{ editingVersionData.product.name }} {{ ' - ' }} {{ option.version }}
                          </option>
                        </select>
                      </template>
                      <template v-else>
                        <div v-if="version.root">{{ version.product.name }} {{ ' - ' }} {{ version.root?.version }}</div>
                        <div v-else>-</div>
                      </template>
                    </td>
                    <td>
                      <template v-if="isEditingVersion && editingVersionData && editingVersionData.id === version.id">
                        <input type="text" class="form-control-borderless" v-model="editingVersionData.notes" placeholder="Notes" />
                      </template>
                      <template v-else>
                        <span class="text-truncate" style="max-width: 200px" :title="version.notes">
                          {{ version.notes || '-' }}
                        </span>
                      </template>
                    </td>
                    <td>{{ formatDate(version.createDate) }}</td>
                    <td>
                      <div class="action-icons">
                        <template v-if="isEditingVersion && editingVersionData && editingVersionData.id === version.id">
                          <div class="icon-container save-container" @click="saveEditVersion(version)" title="Enregistrer">
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
                          <div class="icon-container edit-container" @click="editVersion(version)" title="Modifier">
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
                          <div class="icon-container delete-container" @click="prepareRemoveVersion(version)" title="Supprimer">
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
                        </template>
                      </div>
                    </td>
                  </tr>
                  <!-- Add new version row -->
                  <tr v-if="showAddVersionRow" class="add-row">
                    <td></td>
                    <td><input type="text" class="form-control-borderless" v-model="newVersion.version" placeholder="Version" /></td>
                    <td>
                      <select class="form-control-borderless" v-model="newVersion.root">
                        <option v-for="option in productVersions" :key="option.id" :value="option">
                          {{ option.product.name }} {{ ' - ' }} {{ option.version }}
                        </option>
                      </select>
                    </td>
                    <td>
                      <input type="date" class="form-control-borderless" v-model="newVersion.createDate" placeholder="Date de création" />
                    </td>
                    <td><input type="text" class="form-control-borderless" v-model="newVersion.notes" placeholder="Notes" /></td>
                    <td>
                      <div class="action-icons">
                        <div class="icon-container save-container" @click="saveNewVersion" title="Enregistrer">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save" height="16" width="16">
                            <path
                              d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                              fill="currentColor"
                            />
                          </svg>
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

            <!-- Modules Tab -->
            <div v-if="activeTabIndex === 2" class="modules-tab">
              <div v-if="!selectedVersion" class="d-flex justify-content-between mb-3">
                <h6 class="mb-0">Modules</h6>
                <button class="btn btn-sm btn-primary rounded-1" @click="showAddModuleRow = true" :disabled="showAddModuleRow">
                  New Module
                </button>
              </div>
              <table v-if="!selectedVersion" class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th scope="col">Nom</th>
                    <th scope="col">Description</th>
                    <th scope="col">Versions</th>
                    <th scope="col" class="pl-lg-5">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="getFilteredModules.length === 0 && !showAddModuleRow">
                    <td colspan="5" class="text-center">
                      <span>No module available</span>
                    </td>
                  </tr>
                  <tr v-for="(module, index) in getFilteredModules" :key="index">
                    <td>{{ module.name }}</td>
                    <td class="text-truncate" style="max-width: 250px" :title="module.description">
                      {{ module.description }}
                    </td>
                    <td v-if="selectedVersion">{{ module.version }}</td>
                    <td>
                      <div
                        class="alert alert-primary d-inline-flex align-items-center py-1 px-2 btn-sm"
                        style="font-size: 0.9rem; line-height: 1; gap: 0.25rem; margin-top: 0px; margin-bottom: 0px"
                        @click="openModuleVersionsModal(module)"
                        title="Voir les versions"
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
                      </div>
                    </td>
                    <td>
                      <div class="action-icons">
                        <div class="icon-container edit-container" @click="editModule(module)" title="Modifier">
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
                        <div class="icon-container delete-container" @click="prepareRemoveModule(module)" title="Supprimer">
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
                  <!-- Row to add a new module -->
                  <tr v-if="showAddModuleRow" class="add-row">
                    <td><input type="text" class="form-control-borderless" v-model="newModule.name" placeholder="Nom du module" /></td>
                    <td><input type="text" class="form-control-borderless" v-model="newModule.description" placeholder="Description" /></td>
                    <td>-</td>
                    <td>
                      <div class="action-icons">
                        <div class="icon-container save-container" @click="saveNewModule" title="Enregistrer">
                          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 512" class="icon-save" height="16" width="16">
                            <path
                              d="M144 480C64.5 480 0 415.5 0 336c0-62.8 40.2-116.2 96.2-135.9c-.1-2.7-.2-5.4-.2-8.1c0-88.4 71.6-160 160-160c59.3 0 111 32.2 138.7 80.2C409.9 102 428.3 96 448 96c53 0 96 43 96 96c0 12.2-2.3 23.8-6.4 34.6C596 238.4 640 290.1 640 352c0 70.7-57.3 128-128 128l-368 0zm79-217c-9.4 9.4-9.4 24.6 0 33.9s24.6 9.4 33.9 0l39-39L296 392c0 13.3 10.7 24 24 24s24-10.7 24-24l0-134.1 39 39c9.4 9.4 24.6 9.4 33.9 0s9.4-24.6 0-33.9l-80-80c-9.4-9.4-24.6-9.4-33.9 0l-80 80z"
                              fill="currentColor"
                            />
                          </svg>
                        </div>
                        <div class="icon-container cancel-container" @click="cancelNewModule" title="Annuler">
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
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>

              <div v-if="selectedVersion" class="d-flex justify-content-between mb-3">
                <h6 class="mb-0">Modules Versions</h6>
              </div>
              <table v-if="selectedVersion" class="table table-hover">
                <thead class="thead-light">
                  <tr>
                    <th>Module</th>
                    <th>Version</th>
                    <th>Root</th>
                    <th>Features</th>
                    <th>Description</th>
                    <th>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  <tr v-if="getFilteredModules.length === 0 && !showAddModuleVersionRow">
                    <td colspan="6" class="text-center">
                      <span v-if="selectedVersion">No module available for this version</span>
                    </td>
                  </tr>
                  <tr v-for="(module, index) in getFilteredModules" :key="index">
                    <td>{{ module.module?.name }}</td>
                    <td>{{ module.version }}</td>
                    <td>{{ module.module?.name }} {{ ' - ' }} {{ module.root?.version }}</td>
                    <td>
                      <div
                        class="alert alert-primary d-inline-flex align-items-center py-1 px-2 btn-sm"
                        style="font-size: 0.9rem; line-height: 1; gap: 0.25rem; margin-top: 0px; margin-bottom: 0px"
                        @click="openModuleFeaturesModal(module)"
                        title="Voir les features du module version"
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
                        Features
                      </div>
                    </td>
                    <td class="text-truncate" style="max-width: 250px" :title="module.description">
                      {{ module.description }}
                    </td>
                    <td>
                      <div class="action-icons">
                        <div class="icon-container edit-container" @click="editModuleVersion(module)" title="Modifier">
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
                        <div class="icon-container delete-container" @click="removeModuleVersion(module)" title="Supprimer">
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
                </tbody>
              </table>
            </div>

            <!-- Configuration Tab -->
            <div v-if="activeTabIndex === 3" class="configuration-tab">
              <div class="d-flex justify-content-between mb-3">
                <h6 class="mb-0">Configuration</h6>
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
                    <td colspan="4" class="text-center">
                      <span v-if="selectedVersion">No component available for this version</span>
                      <span v-else>No infrastructure component available</span>
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

    <!-- Product Settings Modal -->
    <div class="modal-backdrop" v-if="showSettingsModal" @click="closeSettingsModal"></div>
    <div class="modal-container" v-if="showSettingsModal" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title">Product parameters</h5>
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
          <div class="grid">
            <!-- Infrastructure Components Section -->
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
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                    <line x1="6" y1="6" x2="6.01" y2="6"></line>
                    <line x1="6" y1="18" x2="6.01" y2="18"></line>
                  </svg>
                  <span>Infrastructure components</span>
                </div>
                <button
                  class="button"
                  :class="{ 'button-primary': !showInfraSelector, 'button-secondary': showInfraSelector }"
                  @click="showInfraSelector = !showInfraSelector"
                >
                  {{ showInfraSelector ? 'Close' : 'Add' }}
                </button>
              </div>

              <div class="card-body">
                <div v-if="showInfraSelector" class="selector-container">
                  <div class="select-wrapper">
                    <select class="select" v-model="selectedInfraComponentId">
                      <option value="">Select a component</option>
                      <option v-for="component in infraComponentVersionOptions" :key="component.id" :value="component.id">
                        {{ component.name }} ({{ component.version }})
                      </option>
                    </select>
                  </div>
                  <button class="button button-success" @click="addInfraToProduct" :disabled="!selectedInfraComponentId">Add</button>
                </div>

                <ul class="component-list">
                  <li v-for="(component, index) in productInfraComponents" :key="index" class="component-item">
                    <div class="component-info">
                      <span class="component-name">{{ component.name }}</span>
                      <span class="component-version">{{ component.version }}</span>
                    </div>
                    <button class="button-icon" @click="removeInfraFromProduct(index)" aria-label="Supprimer">
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
                  </li>
                  <li v-if="productInfraComponents.length === 0" class="empty-message">No selected component</li>
                </ul>
              </div>
            </div>

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
                </div>

                <ul class="component-list">
                  <li v-for="(module, index) in productModules" :key="index" class="component-item">
                    <div class="component-info">
                      <span class="component-name">{{ module.name }}</span>
                    </div>
                    <div class="action-buttons">
                      <button class="button-icon button-info" @click="openModuleVersionsModal(module)" aria-label="Versions">
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
                      </button>
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
                    </div>
                  </li>
                  <li v-if="productModules.length === 0" class="empty-message">No selected module</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="button button-secondary" @click="closeSettingsModal">Cancel</button>
          <button type="button" class="button button-primary" @click="saveSettingsModal">Save</button>
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

        <div class="modal-body">
          <div class="grid">
            <!-- Infrastructure Components Section -->
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
                    <rect x="2" y="2" width="20" height="8" rx="2" ry="2"></rect>
                    <rect x="2" y="14" width="20" height="8" rx="2" ry="2"></rect>
                    <line x1="6" y1="6" x2="6.01" y2="6"></line>
                    <line x1="6" y1="18" x2="6.01" y2="18"></line>
                  </svg>
                  <span>Infrastructure components</span>
                </div>
                <button
                  class="button"
                  :class="{ 'button-primary': !showVersionInfraSelector, 'button-secondary': showVersionInfraSelector }"
                  @click="showVersionInfraSelector = !showVersionInfraSelector"
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
                        {{ component.name }} ({{ component.version }})
                      </option>
                    </select>
                  </div>
                  <button class="button button-success" @click="addInfraToVersion" :disabled="!selectedVersionInfraComponentId">Add</button>
                </div>

                <ul class="component-list">
                  <li v-for="(component, index) in versionInfraComponents" :key="index" class="component-item">
                    <div class="component-info">
                      <span class="component-name">{{ component.name }}</span>
                      <span class="component-version">{{ component.version }}</span>
                    </div>
                    <button class="button-icon" @click="removeInfraFromVersion(index)" aria-label="Supprimer">
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
                  </li>
                  <li v-if="versionInfraComponents.length === 0" class="empty-message">No selected component</li>
                </ul>
              </div>
            </div>

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
                  :class="{ 'button-primary': !showVersionModuleSelector, 'button-secondary': showVersionModuleSelector }"
                  @click="showVersionModuleSelector = !showVersionModuleSelector"
                >
                  {{ showModuleSelector ? 'Close' : 'Add' }}
                </button>
              </div>

              <div class="card-body">
                <div v-if="showVersionModuleSelector" class="selector-container">
                  <div class="select-wrapper">
                    <select class="select" v-model="selectedVersionModuleId">
                      <option value="">Select a module</option>
                      <option v-for="moduleVersion in moduleVersionOptions" :key="moduleVersion.id" :value="moduleVersion.id">
                        {{ moduleVersion.module?.name }} ({{ moduleVersion.version }})
                      </option>
                    </select>
                  </div>
                  <button class="button button-success" @click="addModuleToVersion" :disabled="!selectedVersionModuleId">Add</button>
                </div>

                <ul class="component-list">
                  <li v-for="(moduleVersion, index) in versionModuleVersions" :key="index" class="component-item">
                    <div class="component-info">
                      <span class="component-name">{{ moduleVersion.module?.name }} ({{ moduleVersion.version }})</span>
                    </div>
                    <div class="action-buttons">
                      <button class="button-icon" @click="removeModuleFromVersion(index)" aria-label="Supprimer">
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
                    </div>
                  </li>
                  <li v-if="versionModuleVersions.length === 0" class="empty-message">No selected module</li>
                </ul>
              </div>
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="button button-secondary" @click="closeVersionSettingsModal">Cancel</button>
          <button type="button" class="button button-primary" @click="saveVersionSettingsModal">Save</button>
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
                  <th>Date of creation</th>
                  <th>Notes</th>
                  <th>Features</th>
                  <th class="pl-5">Actions</th>
                </tr>
              </thead>
              <tbody>
                <tr v-if="moduleVersions.length === 0 && !showAddModuleVersionRow">
                  <td colspan="5" class="text-center">No version available for this module</td>
                </tr>
                <tr v-for="(version, index) in moduleVersions" :key="index">
                  <td>{{ version.version }}</td>
                  <td>{{ formatDate(version.createDate) }}</td>
                  <td class="text-truncate" style="max-width: 200px" :title="version.notes">
                    {{ version.notes || '-' }}
                  </td>
                  <td>
                    <div
                      class="alert alert-primary d-inline-flex align-items-center py-1 px-2 btn-sm"
                      style="font-size: 0.9rem; line-height: 1; gap: 0.25rem; margin-top: 0px; margin-bottom: 0px"
                      @click="openModuleVersionFeaturesTable(version)"
                      title="Voir les features du module version"
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
                      Features
                    </div>
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
                  <td><input type="date" class="form-control-borderless" v-model="newModuleVersion.createDate" placeholder="Date" /></td>
                  <td><input type="text" class="form-control-borderless" v-model="newModuleVersion.notes" placeholder="Notes" /></td>
                  <td></td>
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
                <h6 class="mb-0">Features</h6>
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
              <h6 class="mb-0">Features List</h6>
              <button class="button button-primary" @click="showAddFeatureRow = true" :disabled="showAddFeatureRow">Add Feature</button>
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
                  <td><input type="text" class="form-control-borderless" v-model="newFeature.description" placeholder="Description" /></td>
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
        <p id="jhi-delete-product-heading" class="mb-0" v-text="t$('sdiFrontendApp.product.delete.question', { id: removeId })"></p>
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
</template>

<script lang="ts" src="./product.component.ts"></script>

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
  gap: 1.5rem;
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
  background-color: #f8fafc;
}

.card-title {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-weight: 600;
  color: #0f172a;
}

.card-body {
  padding: 1rem;
  flex: 1;
  overflow-y: auto;
  max-height: 500px;
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
  background-color: #0a2547;
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
</style>
