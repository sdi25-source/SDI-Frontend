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
              @click="toggleProductSelection(product)"
              style="cursor: pointer"
            >
              <td class="text-center" @click.stop>
                <div class="form-check">
                  <input
                    class="form-check-input"
                    type="radio"
                    :id="`product-${product.id}`"
                    :checked="selectedProduct && selectedProduct.id === product.id"
                    @change="toggleProductSelection(product)"
                  />
                </div>
              </td>
              <td>
                <template v-if="product.isEditing">
                  <input type="text" class="form-control-borderless" v-model="product.logo" placeholder="Logo URL" @click.stop />
                </template>
                <template v-else>
                  <img v-if="product.logo" :src="product.logo" :alt="product.name + ' logo'" class="product-logo" width="40" height="40" />
                  <span v-else>-</span>
                </template>
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
              <td><input type="text" class="form-control-borderless" v-model="newProduct.logo" placeholder="Logo" /></td>
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
            <!-- Versions Tab -->
            <div v-if="activeTabIndex === 0" class="versions-tab">
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
                    <th scope="row" class="pl-5 ml-5"></th>
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
                    @click="toggleVersionSelection(version)"
                    style="cursor: pointer"
                  >
                    <td class="text-center" @click.stop>
                      <div class="form-check">
                        <input
                          class="form-check-input"
                          type="radio"
                          :id="`version-${index}`"
                          :checked="selectedVersion && selectedVersion.id === version.id"
                          @change="toggleVersionSelection(version)"
                        />
                      </div>
                    </td>
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
                    <td>
                      <template v-if="isEditingVersion && editingVersionData && editingVersionData.id === version.id">
                        <select v-model="editingVersionData.root" class="form-control-borderless" @click.stop>
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
                          {{ version.notes || '-' }}
                        </span>
                      </template>
                    </td>
                    <td @click.stop>
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
                      </div>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>

            <!-- Modules Tab -->
            <div v-if="activeTabIndex === 1" class="modules-tab">
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
                <h6 class="mb-0">{{ selectedVersion.product?.name }}{{ '-' }}{{ selectedVersion.version }} {{ '  Modules Versions' }}</h6>
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
            <div v-if="activeTabIndex === 2" class="configuration-tab">
              <div class="d-flex justify-content-between mb-3">
                <h6 class="mb-0">{{ selectedVersion.product?.name }}{{ '-' }}{{ selectedVersion.version }} {{ '  Configuration' }}</h6>
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
                        {{ component.infraComponent.name }} ({{ component.version }})
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
                        {{ component.infraComponent.name }} ({{ component.version }})
                      </option>
                    </select>
                  </div>
                  <button class="button button-success" @click="addInfraToVersion" :disabled="!selectedVersionInfraComponentId">Add</button>
                </div>

                <ul class="component-list">
                  <li v-for="(component, index) in versionInfraComponents" :key="index" class="component-item">
                    <div class="component-info">
                      <span class="component-name">{{ component.infraComponent?.name }}</span>
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

<script lang="ts">
import { defineComponent, inject, onMounted, ref, reactive, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import ProductService from './product.service';
import ProductVersionService from '@/entities/product-version/product-version.service';
import ModuleService from '@/entities/module/module.service';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import FeatureService from '@/entities/feature/feature.service';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';
import ProductLineService from '@/entities/product-line/product-line.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Product',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const productService = inject('productService', () => new ProductService());
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const moduleService = inject('moduleService', () => new ModuleService());
    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());
    const featureService = inject('featureService', () => new FeatureService());
    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());
    const productLineService = inject('productLineService', () => new ProductLineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    // Data
    const products = ref([]);
    const allProducts = ref([]);
    const isFetching = ref(false);
    const removeId = ref(null);
    const removeEntity = ref(null);
    const searchTerm = ref('');
    const searchTimeout = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const totalItems = ref(0);
    const selectedProduct = ref(null);
    const selectedVersion = ref(null);
    const selectedModule = ref(null);
    const showModuleVersionsModal = ref(false);
    const activeTabIndex = ref(0);
    const tabs = ['Versions', 'Modules', 'Configuration'];
    const tabRefs = reactive([]);
    const hoveredIndex = ref(null);
    const hoverStyle = ref({ left: '0px', width: '0px' });
    const activeStyle = ref({ left: '0px', width: '0px' });
    const showAddVersionRow = ref(false);
    const showAddModuleVersionRow = ref(false);
    const showAddRow = ref(false);
    const showAddModuleRow = ref(false);

    // Variables pour l'édition de version
    const editingVersionData = ref(null);
    const isEditingVersion = ref(false);

    // Options pour les selects
    const productLineOptions = ref([]);
    const infraComponentVersionOptions = ref([]);
    const moduleOptions = ref([]);
    const moduleVersionOptions = ref([]);
    const selectedProductLineIds = ref([]);
    const editProductLineIds = ref([]);

    // Product settings modal
    const showSettingsModal = ref(false);
    const showModuleSelector = ref(false);
    const showInfraSelector = ref(false);
    const selectedModuleVersionId = ref('');
    const selectedInfraComponentId = ref('');
    const productInfraComponents = ref([]);
    const productModules = ref([]);

    // Version settings modal
    const showVersionSettingsModal = ref(false);
    const showVersionModuleSelector = ref(false);
    const showVersionInfraSelector = ref(false);
    const selectedVersionModuleId = ref('');
    const selectedVersionInfraComponentId = ref('');
    const versionInfraComponents = ref([]);
    const versionModuleVersions = ref([]);
    const editingVersion = ref(null);

    // Propriétés pour les versions de produit
    const productVersions = ref([]);
    const removeVersionId = ref(null);
    const removeVersionEntity = ref(null);

    // Pagination pour les versions
    const currentVersionPage = ref(1);
    const itemsPerVersionPage = ref(5);
    const totalVersionItems = ref(0);

    // Propriétés pour les versions de module
    const moduleVersions = ref([]);
    const selectedModuleVersion = ref(null);
    const removeModuleId = ref(null);
    const removeModuleEntity = ref(null);

    // Features
    const features = ref([]);
    const showFeaturesTable = ref(false);
    const showAddFeatureRow = ref(false);
    const showModuleFeaturesModal = ref(false);

    // New item templates
    const newProduct = ref({
      name: '',
      logo: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      productLines: [],
      infraComponentVersions: [],
      modules: [],
    });

    const newVersion = ref({
      version: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
      product: null,
      moduleVersions: [],
      infraComponentVersions: [],
      root: null,
    });

    const newModuleVersion = ref({
      version: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
      module: null,
      features: [],
    });

    const newModule = ref({
      name: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
    });

    const newFeature = ref({
      name: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      moduleVersion: null,
    });

    // Computed properties
    const filteredProducts = computed(() => {
      if (!searchTerm.value) return allProducts.value;
      const term = searchTerm.value.toLowerCase();
      return allProducts.value.filter(
        product => product.name?.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term),
      );
    });

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredProducts.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

    const isPrevDisabled = computed(() => currentPage.value <= 1);

    const isNextDisabled = computed(() => currentPage.value >= totalPages.value);

    const paginationInfo = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(start + itemsPerPage.value - 1, filteredProducts.value.length);
      return `${start}-${end} sur ${filteredProducts.value.length}`;
    });

    // Computed properties pour la pagination des versions
    const paginatedVersions = computed(() => {
      const start = (currentVersionPage.value - 1) * itemsPerVersionPage.value;
      const end = start + itemsPerVersionPage.value;
      return productVersions.value.slice(start, end);
    });

    const totalVersionPages = computed(() => {
      return Math.ceil(totalVersionItems.value / itemsPerVersionPage.value);
    });

    const isVersionPrevDisabled = computed(() => {
      return currentVersionPage.value <= 1;
    });

    const isVersionNextDisabled = computed(() => {
      return currentVersionPage.value >= totalVersionPages.value;
    });

    const versionPaginationInfo = computed(() => {
      if (totalVersionItems.value === 0) return '0-0 / 0';

      const start = (currentVersionPage.value - 1) * itemsPerVersionPage.value + 1;
      const end = Math.min(start + itemsPerVersionPage.value - 1, totalVersionItems.value);
      return `${start}-${end} / ${totalVersionItems.value}`;
    });

    // Get filtered components based on selected version
    const getFilteredInfraComponents = computed(() => {
      if (!selectedProduct.value) return [];
      if (selectedVersion.value) {
        console.log('id', selectedVersion.value.id);
        // Return components specific to the selected version
        return selectedVersion.value.infraComponentVersions || [];
      } else {
        // Return all components for the product
        return selectedProduct.value.infraComponentVersions || [];
      }
    });

    // Get filtered modules based on selected version
    const getFilteredModules = computed(() => {
      if (!selectedProduct.value) return [];
      if (selectedVersion.value) {
        // Return modules specific to the selected version (moduleVersions)
        return (
          selectedVersion.value.moduleVersions?.map(mv => ({
            id: mv.id,
            name: mv.module?.name,
            description: mv.module?.description,
            version: mv.version,
            module: mv.module,
            root: mv.root,
          })) || []
        );
      } else {
        // Return all modules for the product
        return selectedProduct.value.modules || [];
      }
    });

    // Methods
    const retrieveProducts = async () => {
      isFetching.value = true;
      try {
        const res = await productService().retrieve();
        products.value = res.data.map(product => {
          // Enrichir les modules de chaque produit
          const modulesWithExpansion = product.modules
            ? product.modules.map(mod => ({
                ...mod,
                isExpanded: false, // Nouvel état pour l'expansion
                versions: [], // Pour stocker les versions chargées du module
                isLoadingVersions: false, // Pour gérer l'état de chargement des versions
              }))
            : [];
          return {
            ...product,
            isEditing: false,
            showDropdown: false,
            originalData: { ...product },
            modules: modulesWithExpansion, // Utiliser les modules enrichis
          };
        });
        allProducts.value = [...products.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response); // Assurez-vous que alertService est bien injecté et disponible
      } finally {
        isFetching.value = false;
      }
    };

    const fetchProductLineOptions = async () => {
      try {
        const res = await productLineService().retrieve();
        productLineOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchInfraComponentVersionOptions = async () => {
      try {
        const res = await infraComponentVersionService().retrieve();
        infraComponentVersionOptions.value = res.data;
        console.log(infraComponentVersionOptions.value);
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchModuleOptions = async () => {
      try {
        const res = await moduleService().retrieve();
        moduleOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchModuleVersionOptions = async () => {
      try {
        const res = await moduleVersionService().retrieve();
        moduleVersionOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const handleSyncList = () => {
      retrieveProducts();
    };

    const prepareRemove = instance => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeProduct = async () => {
      try {
        isFetching.value = true;

        // Étape 1 : récupérer toutes les versions de ce produit
        const res = await productVersionService().retrieve();
        const versionsToDelete = res.data.filter(pv => pv.product?.id === removeId.value);

        // Étape 2 : supprimer chaque version une par une
        for (const version of versionsToDelete) {
          await productVersionService().delete(version.id);
        }

        // Étape 3 : supprimer le produit
        await productService().delete(removeId.value);

        const message = t$('sdiFrontendApp.product.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });

        removeId.value = null;
        retrieveProducts();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      searchTimeout.value = setTimeout(() => {
        products.value = filteredProducts.value;
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    const goToPrevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const goToNextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const updateTotalItems = () => {
      if (products.value) {
        totalItems.value = products.value.length;
      } else {
        totalItems.value = 0;
      }
    };

    // Format date
    const formatDate = date => {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleDateString();
    };

    // Toggle product selection with checkbox
    const toggleProductSelection = async product => {
      if (selectedProduct.value && selectedProduct.value.id === product.id) {
        selectedProduct.value = null;
        selectedVersion.value = null;
        productVersions.value = [];
      } else {
        selectedProduct.value = product;
        selectedVersion.value = null;

        // Fetch product versions
        await fetchProductVersions(product.id);
      }
    };

    // Toggle version selection with checkbox
    const toggleVersionSelection = version => {
      if (selectedVersion.value && selectedVersion.value.id === version.id) {
        selectedVersion.value = null;
      } else {
        selectedVersion.value = version;
        // Switch to Configuration tab to show related components
        setActiveTabIndex(0);
      }
    };

    // Fetch product versions
    const fetchProductVersions = async productId => {
      isFetching.value = true;
      try {
        const res = await productVersionService().retrieve();
        // Filtrer les versions de produit par ID du produit
        productVersions.value = res.data.filter(pv => pv.product?.id === productId);
        updateTotalVersionItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    // Fetch module versions
    const fetchModuleVersions = async moduleId => {
      isFetching.value = true;
      try {
        const res = await moduleVersionService().retrieve();
        moduleVersions.value = res.data.filter(pv => pv.module?.id === moduleId);
        console.log(res.data);
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    // Fetch features for a module version
    const fetchFeatures = async moduleVersionId => {
      isFetching.value = true;
      try {
        const res = await moduleVersionService().find(moduleVersionId);
        features.value = res.features;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    // Product settings methods
    const openSettingsModal = () => {
      productInfraComponents.value = newProduct.value.infraComponentVersions || [];
      productModules.value = newProduct.value.modules || [];
      showSettingsModal.value = true;
    };

    const openProductSettings = product => {
      selectedProduct.value = product;
      productInfraComponents.value = product.infraComponentVersions || [];
      productModules.value = product.modules || [];
      showSettingsModal.value = true;
    };

    const closeSettingsModal = () => {
      showSettingsModal.value = false;
      showModuleSelector.value = false;
      showInfraSelector.value = false;
      selectedModuleVersionId.value = '';
      selectedInfraComponentId.value = '';
    };

    const saveSettingsModal = async () => {
      try {
        if (selectedProduct.value) {
          // Update existing product
          selectedProduct.value.infraComponentVersions = productInfraComponents.value;
          //   selectedProduct.value.infraComponentVersions.value.infraComponent = productInfraComponents.value.infraComponent.value;

          selectedProduct.value.modules = productModules.value;
          await productService().update(selectedProduct.value);
          await retrieveProducts();
        } else {
          // For new product
          newProduct.value.infraComponentVersions = productInfraComponents.value;
          newProduct.value.modules = productModules.value;
        }
        closeSettingsModal();
        alertService.showInfo('Configuration sauvegardée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Version settings methods
    const openVersionSettings = version => {
      editingVersion.value = version;
      versionInfraComponents.value = version.infraComponentVersions || [];
      versionModuleVersions.value = version.moduleVersions || [];
      showVersionSettingsModal.value = true;
    };

    // Fonction pour ouvrir le modal de paramètres depuis l'édition en ligne
    const openVersionSettingsFromEdit = () => {
      if (!editingVersionData.value) return;

      // Ouvrir le modal de paramètres avec les données existantes
      editingVersion.value = editingVersionData.value;
      versionInfraComponents.value = editingVersionData.value.infraComponentVersions || [];
      versionModuleVersions.value = editingVersionData.value.moduleVersions || [];
      showVersionSettingsModal.value = true;
    };

    const openNewVersionSettings = () => {
      // Utiliser les composants d'infrastructure du produit par défaut
      versionInfraComponents.value = selectedProduct.value?.infraComponentVersions || [];
      versionModuleVersions.value = [];
      showVersionSettingsModal.value = true;
    };

    const closeVersionSettingsModal = () => {
      showVersionSettingsModal.value = false;
      showVersionModuleSelector.value = false;
      showVersionInfraSelector.value = false;
      selectedVersionModuleId.value = '';
      selectedVersionInfraComponentId.value = '';
      editingVersion.value = null;
    };

    const saveVersionSettingsModal = async () => {
      try {
        if (editingVersion.value) {
          // Update existing version
          const updatedVersion = {
            ...editingVersion.value,
            infraComponentVersions: versionInfraComponents.value,
            moduleVersions: versionModuleVersions.value,
          };

          // Si nous sommes en mode édition directe, mettre à jour les champs modifiables
          if (isEditingVersion.value && editingVersionData.value) {
            updatedVersion.version = editingVersionData.value.version;
            updatedVersion.notes = editingVersionData.value.notes;
            updatedVersion.updateDate = new Date().toISOString().split('T')[0];
          }

          await productVersionService().update(updatedVersion);
          await fetchProductVersions(selectedProduct.value.id);

          // Réinitialiser l'état d'édition
          isEditingVersion.value = false;
          editingVersionData.value = null;

          alertService.showInfo('Version mise à jour avec succès', { variant: 'success' });
        } else {
          // For new version
          newVersion.value.infraComponentVersions = versionInfraComponents.value;
          newVersion.value.moduleVersions = versionModuleVersions.value;
        }
        closeVersionSettingsModal();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const addModuleToProduct = () => {
      if (!selectedModuleVersionId.value) return;

      const module = getModuleById(selectedModuleVersionId.value);
      if (module) {
        const exists = productModules.value.some(m => m.id === module.id);
        if (!exists) {
          productModules.value.push(module);
        }
        selectedModuleVersionId.value = '';
      }
    };

    const removeModuleFromProduct = index => {
      productModules.value.splice(index, 1);
    };

    const addInfraToProduct = () => {
      if (!selectedInfraComponentId.value) return;

      const component = getInfraComponentById(selectedInfraComponentId.value);
      if (component) {
        const exists = productInfraComponents.value.some(c => c.id === component.id);
        if (!exists) {
          productInfraComponents.value.push(component);
        }
        selectedInfraComponentId.value = '';
      }
    };

    const removeInfraFromProduct = index => {
      productInfraComponents.value.splice(index, 1);
    };

    const addModuleToVersion = () => {
      if (!selectedVersionModuleId.value) return;

      const moduleVersion = getModuleVersionById(selectedVersionModuleId.value);
      if (moduleVersion) {
        const exists = versionModuleVersions.value.some(mv => mv.id === moduleVersion.id);
        if (!exists) {
          versionModuleVersions.value.push(moduleVersion);
        }
        selectedVersionModuleId.value = '';
      }
    };

    const removeModuleFromVersion = index => {
      versionModuleVersions.value.splice(index, 1);
    };

    const addInfraToVersion = () => {
      if (!selectedVersionInfraComponentId.value) return;
      console.log(versionInfraComponents.value);

      const component = getInfraComponentById(selectedVersionInfraComponentId.value);
      if (component) {
        const exists = versionInfraComponents.value.some(c => c.id === component.id);
        if (!exists) {
          versionInfraComponents.value.push(component);
        }
        selectedVersionInfraComponentId.value = '';
      }
    };

    const removeInfraFromVersion = index => {
      versionInfraComponents.value.splice(index, 1);
    };

    // Editions methods
    const editProduct = product => {
      product.isEditing = true;
      editProductLineIds.value = product.productLines?.map(pl => pl.id) || [];
    };

    const cancelEdit = product => {
      Object.assign(product, product.originalData);
      product.isEditing = false;
    };

    const saveEditProduct = async product => {
      try {
        await productService().update(product);
        product.isEditing = false;
        product.originalData = { ...product };
        alertService.showInfo('Produit mis à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const updateProductLines = () => {
      const selectedOptions = productLineOptions.value.filter(option => selectedProductLineIds.value.includes(option.id));
      newProduct.value.productLines = selectedOptions;
    };

    const updateEditProductLines = product => {
      const selectedOptions = productLineOptions.value.filter(option => editProductLineIds.value.includes(option.id));
      //product.productLines = selectedOptions;

      selectedOptions.forEach(option => {
        const alreadyExists = product.productLines.some(p => p.id === option.id);
        if (!alreadyExists) {
          product.productLines.push(option);
        }
      });
    };

    const removeProductLine = id => {
      newProduct.value.productLines = newProduct.value.productLines.filter(line => line.id !== id);
      selectedProductLineIds.value = selectedProductLineIds.value.filter(lineId => lineId !== id);
    };

    const removeEditProductLine = (product, id) => {
      product.productLines = product.productLines.filter(line => line.id !== id);
      editProductLineIds.value = editProductLineIds.value.filter(lineId => lineId !== id);
    };

    const saveNewProduct = async () => {
      if (!newProduct.value.name) {
        alertService.showInfo('Le nom du produit est requis', { variant: 'danger' });
        return;
      }

      try {
        // Create the product
        const result = await productService().create(newProduct.value);

        // Reset the form
        showAddRow.value = false;
        newProduct.value = {
          name: '',
          logo: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          productLines: [],
          infraComponentVersions: [],
          modules: [],
        };
        selectedProductLineIds.value = [];

        // Refresh the product list
        await retrieveProducts();

        alertService.showInfo('Produit créé avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewProduct = () => {
      showAddRow.value = false;
      newProduct.value = {
        name: '',
        logo: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        productLines: [],
        infraComponentVersions: [],
        modules: [],
      };
      selectedProductLineIds.value = [];
    };

    // Version management methods
    const editVersion = version => {
      // Créer une copie pour l'édition
      editingVersionData.value = { ...version };
      isEditingVersion.value = true;

      // Ne pas ouvrir le modal de paramètres automatiquement
      // Le modal sera ouvert uniquement via le bouton de paramètres
    };

    const saveEditVersion = async version => {
      if (!editingVersionData.value) return;

      try {
        // Mettre à jour les champs modifiables
        const updatedVersion = {
          ...version,
          version: editingVersionData.value.version,
          notes: editingVersionData.value.notes,
          updateDate: new Date().toISOString().split('T')[0],
          // Conserver les relations existantes
          infraComponentVersions: version.infraComponentVersions || [],
          moduleVersions: version.moduleVersions || [],
          root: editingVersionData.value.root,
        };

        await productVersionService().update(updatedVersion);

        // Rafraîchir les versions
        await fetchProductVersions(selectedProduct.value.id);

        // Réinitialiser l'état d'édition
        isEditingVersion.value = false;
        editingVersionData.value = null;

        alertService.showInfo('Version mise à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditVersion = () => {
      isEditingVersion.value = false;
      editingVersionData.value = null;
    };

    const prepareRemoveVersion = version => {
      if (!version || !version.id) {
        alertService.showInfo('Version invalide', { variant: 'danger' });
        return;
      }

      removeVersionId.value = version.id;

      // Vérifier si removeVersionEntity est disponible
      if (removeVersionEntity.value) {
        removeVersionEntity.value.show();
      } else {
        // Fallback si le modal n'est pas disponible
        if (confirm(`Êtes-vous sûr de vouloir supprimer la version ${version.version} ?`)) {
          removeProductVersion();
        }
      }
    };

    const closeVersionDialog = () => {
      if (removeVersionEntity.value) {
        removeVersionEntity.value.hide();
      }
    };

    const removeProductVersion = async () => {
      if (!removeVersionId.value) {
        alertService.showInfo('ID de version invalide', { variant: 'danger' });
        return;
      }

      try {
        isFetching.value = true;
        await productVersionService().delete(removeVersionId.value);

        const message = t$('sdiFrontendApp.productVersion.deleted', { param: removeVersionId.value }).toString();
        alertService.showInfo(message, { variant: 'success' });

        // Réinitialiser la sélection si la version supprimée était sélectionnée
        if (selectedVersion.value && selectedVersion.value.id === removeVersionId.value) {
          selectedVersion.value = null;
        }

        // Rafraîchir les versions
        if (selectedProduct.value) {
          await fetchProductVersions(selectedProduct.value.id);
        }

        removeVersionId.value = null;

        // Fermer le modal si disponible
        closeVersionDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isFetching.value = false;
      }
    };

    const updateTotalVersionItems = () => {
      if (productVersions.value) {
        totalVersionItems.value = productVersions.value.length;
      } else {
        totalVersionItems.value = 0;
      }
    };

    const saveNewVersion = async () => {
      if (!newVersion.value.version || !selectedProduct.value) {
        alertService.showInfo('La version et le produit sont requis', { variant: 'danger' });
        return;
      }

      try {
        // Préparer les données pour l'API
        const versionData = {
          ...newVersion.value,
          product: { id: selectedProduct.value.id },
          infraComponentVersions: versionInfraComponents.value,
          moduleVersions: versionModuleVersions.value,
        };

        console.log(versionData);

        // Créer la version
        await productVersionService().create(versionData);

        // Réinitialiser le formulaire
        showAddVersionRow.value = false;
        newVersion.value = {
          version: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
          product: null,
          moduleVersions: [],
          infraComponentVersions: [],
          root: null,
        };

        // Rafraîchir les versions
        await fetchProductVersions(selectedProduct.value.id);

        alertService.showInfo('Version créée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewVersion = () => {
      showAddVersionRow.value = false;

      // Reset form
      newVersion.value = {
        version: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
        product: null,
        moduleVersions: [],
        infraComponentVersions: [],
        root: null,
      };
    };

    // Module methods
    const getModuleById = id => {
      return moduleOptions.value.find(module => module.id === Number.parseInt(id));
    };

    const getInfraComponentById = id => {
      return infraComponentVersionOptions.value.find(component => component.id === Number.parseInt(id));
    };

    const getModuleVersionById = id => {
      return moduleVersionOptions.value.find(moduleVersion => moduleVersion.id === Number.parseInt(id));
    };

    // Module versions modal methods
    const openModuleVersionsModal = async module => {
      // Si nous sommes dans le contexte d'une version de produit, nous devons obtenir le module complet
      if (selectedVersion.value) {
        // Trouver le module complet à partir de l'ID
        const fullModule = moduleOptions.value.find(m => m.id === module.id);
        if (fullModule) {
          selectedModule.value = fullModule;
        } else {
          selectedModule.value = module;
        }
      } else {
        selectedModule.value = module;
      }

      await fetchModuleVersions(selectedModule.value.id);
      showModuleVersionsModal.value = true;
    };

    const closeModuleVersionsModal = () => {
      showModuleVersionsModal.value = false;
      selectedModule.value = null;
      showAddModuleVersionRow.value = false;
      moduleVersions.value = [];
      showFeaturesTable.value = false;
      selectedModuleVersion.value = null;
    };

    const closeFeatureModule = () => {
      showFeaturesTable.value = false;
    };

    // Module version methods
    const editModuleVersion = version => {
      // Implement module version editing
      version.isEditing = true;
      version.originalData = { ...version };
    };

    const saveEditModuleVersion = async version => {
      try {
        await moduleVersionService().update(version);
        version.isEditing = false;
        version.originalData = { ...version };

        // Refresh versions
        if (selectedModule.value) {
          await fetchModuleVersions(selectedModule.value.id);
        }

        alertService.showInfo('Version du module mise à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditModuleVersion = version => {
      Object.assign(version, version.originalData);
      version.isEditing = false;
    };

    const saveNewModuleVersion = async () => {
      if (!newModuleVersion.value.version || !selectedModule.value) {
        alertService.showInfo('La version et le module sont requis', { variant: 'danger' });
        return;
      }

      try {
        // Prepare data for API
        const versionData = {
          ...newModuleVersion.value,
          module: { id: selectedModule.value.id },
        };

        // Create the version
        await moduleVersionService().create(versionData);

        // Reset the form
        showAddModuleVersionRow.value = false;
        newModuleVersion.value = {
          version: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
          module: null,
          features: [],
        };

        // Refresh versions
        await fetchModuleVersions(selectedModule.value.id);

        alertService.showInfo('Version du module créée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewModuleVersion = () => {
      showAddModuleVersionRow.value = false;

      // Reset form
      newModuleVersion.value = {
        version: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
        module: null,
        features: [],
      };
    };

    const removeModuleVersion = async index => {
      try {
        const versionToRemove = moduleVersions.value[index];

        // Delete the version
        await moduleVersionService().delete(versionToRemove.id);

        // Refresh versions
        if (selectedModule.value) {
          await fetchModuleVersions(selectedModule.value.id);
        }

        alertService.showInfo('Version du module supprimée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Module management methods
    const saveNewModule = async () => {
      if (!newModule.value.name) {
        alertService.showInfo('Le nom du module est requis', { variant: 'danger' });
        return;
      }

      try {
        // Create the module
        const moduleData = {
          ...newModule.value,
        };
        const result = await moduleService().create(moduleData);

        // Add the module to the product
        if (selectedProduct.value) {
          const updatedProduct = { ...selectedProduct.value };
          if (!updatedProduct.modules) {
            updatedProduct.modules = [];
          }
          updatedProduct.modules.push(result);
          await productService().update(updatedProduct);

          // Refresh product data
          await retrieveProducts();
          if (selectedProduct.value) {
            const refreshedProduct = products.value.find(p => p.id === selectedProduct.value.id);
            if (refreshedProduct) {
              selectedProduct.value = refreshedProduct;
            }
          }
        }

        // Reset the form
        showAddModuleRow.value = false;
        newModule.value = {
          name: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
        };

        // Refresh module options
        await fetchModuleOptions();

        alertService.showInfo('Module créé avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewModule = () => {
      showAddModuleRow.value = false;
      newModule.value = {
        name: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
      };
    };

    const editModule = module => {
      module.isEditing = true;
      module.originalData = { ...module };
    };

    const saveEditModule = async module => {
      try {
        await moduleService().update(module);
        module.isEditing = false;
        module.originalData = { ...module };

        // Refresh product data to update the module list
        if (selectedProduct.value) {
          await retrieveProducts();
          const refreshedProduct = products.value.find(p => p.id === selectedProduct.value.id);
          if (refreshedProduct) {
            selectedProduct.value = refreshedProduct;
          }
        }

        alertService.showInfo('Module mis à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditModule = module => {
      Object.assign(module, module.originalData);
      module.isEditing = false;
    };

    const prepareRemoveModule = module => {
      removeModuleId.value = module.id;
      if (removeModuleEntity.value) {
        removeModuleEntity.value.show();
      } else {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le module ${module.name} ?`)) {
          removeModuleConfirm();
        }
      }
    };

    const closeModuleDialog = () => {
      if (removeModuleEntity.value) {
        removeModuleEntity.value.hide();
      }
    };

    const removeModuleConfirm = async () => {
      if (!removeModuleId.value) {
        alertService.showInfo('ID de module invalide', { variant: 'danger' });
        return;
      }

      try {
        isFetching.value = true;

        // Remove the module from the product first
        if (selectedProduct.value) {
          const updatedProduct = { ...selectedProduct.value };
          updatedProduct.modules = updatedProduct.modules.filter(m => m.id !== removeModuleId.value);
          await productService().update(updatedProduct);
        }

        // Then delete the module
        await moduleService().delete(removeModuleId.value);

        // Refresh product data
        await retrieveProducts();
        if (selectedProduct.value) {
          const refreshedProduct = products.value.find(p => p.id === selectedProduct.value.id);
          if (refreshedProduct) {
            selectedProduct.value = refreshedProduct;
          }
        }

        removeModuleId.value = null;
        closeModuleDialog();

        alertService.showInfo('Module supprimé avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isFetching.value = false;
      }
    };

    const openModuleSettings = module => {
      // Implement module settings
      alertService.showInfo('Fonctionnalité à implémenter', { variant: 'info' });
    };

    // Feature management methods
    const openModuleVersionFeaturesTable = async version => {
      selectedModuleVersion.value = version;
      await fetchFeatures(version.id);
      showFeaturesTable.value = true;
    };

    // Modifiez la fonction openModuleFeaturesModal pour stocker correctement le moduleVersion sélectionné
    const openModuleFeaturesModal = async moduleVersion => {
      selectedModuleVersion.value = moduleVersion;
      // Assurez-vous que moduleVersion a un ID avant de l'utiliser
      if (moduleVersion && moduleVersion.id) {
        await fetchFeatures(moduleVersion.id);
      } else {
        features.value = []; // Réinitialiser les features si aucun ID valide
      }
      showModuleFeaturesModal.value = true;
    };

    const closeModuleFeaturesModal = () => {
      showModuleFeaturesModal.value = false;
      selectedModuleVersion.value = null;
      features.value = [];
      showAddFeatureRow.value = false;
    };

    const editFeature = feature => {
      feature.isEditing = true;
      feature.originalData = { ...feature };
    };

    const saveEditFeature = async feature => {
      try {
        await featureService().update(feature);
        feature.isEditing = false;
        feature.originalData = { ...feature };

        // Refresh features
        if (selectedModuleVersion.value) {
          await fetchFeatures(selectedModuleVersion.value.id);
        }

        alertService.showInfo('Fonctionnalité mise à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditFeature = feature => {
      Object.assign(feature, feature.originalData);
      feature.isEditing = false;
    };

    const saveNewFeature = async () => {
      if (!newFeature.value.name || !selectedModuleVersion.value) {
        alertService.showInfo('Le nom et le module version sont requis', { variant: 'danger' });
        return;
      }

      try {
        // Déterminer l'ID correct du moduleVersion
        let moduleVersionId;
        if (selectedModuleVersion.value.id) {
          moduleVersionId = selectedModuleVersion.value.id;
        } else if (selectedModuleVersion.value.module && selectedModuleVersion.value.module.id) {
          moduleVersionId = selectedModuleVersion.value.module.id;
        } else {
          alertService.showInfo('ID de module version invalide', { variant: 'danger' });
          return;
        }

        // Prepare data for API
        const featureData = {
          ...newFeature.value,
          moduleVersion: { id: moduleVersionId },
        };

        // Create the feature
        const createdFeature = await featureService().create(featureData);

        // Récupérer la version actuelle du module pour avoir tous les champs nécessaires
        const currentModuleVersion = await moduleVersionService().find(moduleVersionId);

        // Préparer les données pour la mise à jour du moduleVersion
        const updatedFeatures = currentModuleVersion.features ? [...currentModuleVersion.features, createdFeature] : [createdFeature];

        const updateModuleVersionData = {
          ...currentModuleVersion,
          features: updatedFeatures,
        };

        // Mettre à jour le moduleVersion avec la nouvelle liste de features
        await moduleVersionService().update(updateModuleVersionData);

        // Reset the form
        showAddFeatureRow.value = false;
        newFeature.value = {
          name: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          moduleVersion: null,
        };

        // Refresh features with the correct moduleVersionId
        await fetchFeatures(moduleVersionId);

        alertService.showInfo('Fonctionnalité créée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewFeature = () => {
      showAddFeatureRow.value = false;
      newFeature.value = {
        name: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        moduleVersion: null,
      };
    };

    const removeFeature = async index => {
      try {
        const featureToRemove = features.value[index];

        if (!selectedModuleVersion.value || !selectedModuleVersion.value.id) {
          alertService.showInfo('Module version non valide', { variant: 'danger' });
          return;
        }

        // Étape 1: Récupérer la version actuelle du module
        const moduleVersionId = selectedModuleVersion.value.id;
        const currentModuleVersion = await moduleVersionService().find(moduleVersionId);

        // Étape 2: Mettre à jour la liste des features en retirant le feature à supprimer
        const updatedFeatures = currentModuleVersion.features.filter(f => f.id !== featureToRemove.id);

        // Étape 3: Mettre à jour le moduleVersion avec la nouvelle liste de features
        const updateModuleVersionData = {
          ...currentModuleVersion,
          features: updatedFeatures,
        };

        // Étape 4: Sauvegarder la version du module mise à jour
        await moduleVersionService().update(updateModuleVersionData);

        // Étape 5: Supprimer le feature
        await featureService().delete(featureToRemove.id);

        // Étape 6: Rafraîchir la liste des features
        await fetchFeatures(moduleVersionId);

        alertService.showInfo('Fonctionnalité supprimée avec succès', { variant: 'success' });
      } catch (error) {
        console.error('Erreur lors de la suppression du feature:', error);
        // Gestion améliorée des erreurs
        if (error.response) {
          alertService.showHttpError(error.response);
        } else {
          alertService.showInfo('Une erreur est survenue lors de la suppression de la fonctionnalité', {
            variant: 'danger',
          });
        }
      }
    };

    const returnToProductList = () => {
      selectedProduct.value = null;
      selectedVersion.value = null;
      productVersions.value = [];
    };

    // Vercel Tabs functionality
    const setHoveredIndex = index => {
      hoveredIndex.value = index;
      if (index !== null && tabRefs[index]) {
        const hoveredElement = tabRefs[index];
        const { offsetLeft, offsetWidth } = hoveredElement;
        hoverStyle.value = {
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        };
      }
    };

    const setActiveTabIndex = index => {
      activeTabIndex.value = index;
      if (tabRefs[index]) {
        const activeElement = tabRefs[index];
        const { offsetLeft, offsetWidth } = activeElement;
        activeStyle.value = {
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        };
      }
    };

    // Initialize
    onMounted(async () => {
      await retrieveProducts();
      await fetchProductLineOptions();
      await fetchInfraComponentVersionOptions();
      await fetchModuleOptions();
      await fetchModuleVersionOptions();

      // Initialize tabs
      nextTick(() => {
        if (tabRefs[activeTabIndex.value]) {
          setActiveTabIndex(activeTabIndex.value);
        }
      });
    });

    // Watch for tab refs changes
    watch(
      () => tabRefs,
      () => {
        if (tabRefs[activeTabIndex.value]) {
          nextTick(() => {
            setActiveTabIndex(activeTabIndex.value);
          });
        }
      },
      { deep: true },
    );

    watch(selectedVersion, newVersion => {
      if (newVersion) {
        // Mettre à jour les configurations et modules en fonction de la version sélectionnée
        versionInfraComponents.value = newVersion.infraComponentVersions || [];
        versionModuleVersions.value = newVersion.moduleVersions || [];

        // Passer à l'onglet Configuration
        setActiveTabIndex(1);
      }
    });

    return {
      t$,
      products,
      isFetching,
      removeId,
      removeEntity,
      searchTerm,
      currentPage,
      itemsPerPage,
      totalItems,
      selectedProduct,
      selectedVersion,
      selectedModule,
      showModuleVersionsModal,
      activeTabIndex,
      tabs,
      tabRefs,
      hoveredIndex,
      hoverStyle,
      activeStyle,
      showAddVersionRow,
      showAddModuleVersionRow,
      showAddRow,
      showAddModuleRow,
      editingVersionData,
      isEditingVersion,
      productLineOptions,
      infraComponentVersionOptions,
      moduleOptions,
      moduleVersionOptions,
      selectedProductLineIds,
      editProductLineIds,
      showSettingsModal,
      showModuleSelector,
      showInfraSelector,
      selectedModuleVersionId,
      selectedInfraComponentId,
      productInfraComponents,
      productModules,
      showVersionSettingsModal,
      showVersionModuleSelector,
      showVersionInfraSelector,
      selectedVersionModuleId,
      selectedVersionInfraComponentId,
      versionInfraComponents,
      versionModuleVersions,
      editingVersion,
      productVersions,
      removeVersionId,
      removeVersionEntity,
      currentVersionPage,
      itemsPerVersionPage,
      totalVersionItems,
      moduleVersions,
      selectedModuleVersion,
      removeModuleId,
      removeModuleEntity,
      features,
      showFeaturesTable,
      showAddFeatureRow,
      showModuleFeaturesModal,
      newProduct,
      newVersion,
      newModuleVersion,
      newModule,
      newFeature,
      filteredProducts,
      paginatedProducts,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      paginatedVersions,
      totalVersionPages,
      isVersionPrevDisabled,
      isVersionNextDisabled,
      versionPaginationInfo,
      getFilteredInfraComponents,
      getFilteredModules,
      retrieveProducts,
      fetchProductLineOptions,
      fetchInfraComponentVersionOptions,
      fetchModuleOptions,
      fetchModuleVersionOptions,
      handleSyncList,
      prepareRemove,
      closeDialog,
      removeProduct,
      handleSearch,
      goToPrevPage,
      goToNextPage,
      updateTotalItems,
      formatDate,
      toggleProductSelection,
      toggleVersionSelection,
      fetchProductVersions,
      fetchModuleVersions,
      fetchFeatures,
      openSettingsModal,
      openProductSettings,
      closeSettingsModal,
      saveSettingsModal,
      openVersionSettings,
      openVersionSettingsFromEdit,
      openNewVersionSettings,
      closeVersionSettingsModal,
      saveVersionSettingsModal,
      addModuleToProduct,
      removeModuleFromProduct,
      addInfraToProduct,
      removeInfraFromProduct,
      addModuleToVersion,
      removeModuleFromVersion,
      addInfraToVersion,
      removeInfraFromVersion,
      editProduct,
      cancelEdit,
      saveEditProduct,
      updateProductLines,
      updateEditProductLines,
      removeProductLine,
      removeEditProductLine,
      saveNewProduct,
      cancelNewProduct,
      editVersion,
      saveEditVersion,
      cancelEditVersion,
      prepareRemoveVersion,
      closeVersionDialog,
      removeProductVersion,
      updateTotalVersionItems,
      saveNewVersion,
      cancelNewVersion,
      getModuleById,
      getInfraComponentById,
      getModuleVersionById,
      openModuleVersionsModal,
      closeModuleVersionsModal,
      editModuleVersion,
      saveEditModuleVersion,
      cancelEditModuleVersion,
      saveNewModuleVersion,
      cancelNewModuleVersion,
      removeModuleVersion,
      saveNewModule,
      cancelNewModule,
      editModule,
      saveEditModule,
      cancelEditModule,
      prepareRemoveModule,
      closeModuleDialog,
      removeModuleConfirm,
      openModuleSettings,
      openModuleVersionFeaturesTable,
      openModuleFeaturesModal,
      closeModuleFeaturesModal,
      closeFeatureModule,
      editFeature,
      saveEditFeature,
      cancelEditFeature,
      saveNewFeature,
      cancelNewFeature,
      removeFeature,
      returnToProductList,
      setHoveredIndex,
      setActiveTabIndex,
      dataUtils,
    };
  },
});
</script>

<style scoped>
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
