<template>
  <div>
    <h2 id="page-heading" data-cy="ProductVersionHeading">
      <span v-text="t$('sdiFrontendApp.productVersion.home.title')" id="product-version-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.productVersion.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ProductVersionCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-product-version"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.productVersion.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && productVersions && productVersions.length === 0">
      <span v-text="t$('sdiFrontendApp.productVersion.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="productVersions && productVersions.length > 0">
      <table class="table table-striped" aria-describedby="productVersions">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.version')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.product')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.moduleVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.infraComponentVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productVersion.root')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="productVersion in productVersions" :key="productVersion.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ProductVersionView', params: { productVersionId: productVersion.id } }">{{
                productVersion.id
              }}</router-link>
            </td>
            <td>{{ productVersion.version }}</td>
            <td>{{ productVersion.createDate }}</td>
            <td>{{ productVersion.updateDate }}</td>
            <td>{{ productVersion.notes }}</td>
            <td>
              <div v-if="productVersion.product">
                <router-link :to="{ name: 'ProductView', params: { productId: productVersion.product.id } }">{{
                  productVersion.product.name
                }}</router-link>
              </div>
            </td>
            <td>
              <span v-for="(moduleVersion, i) in productVersion.moduleVersions" :key="moduleVersion.id"
                >{{ i > 0 ? ', ' : '' }}
                <router-link
                  class="form-control-static"
                  :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleVersion.id } }"
                  >{{ moduleVersion.id }}</router-link
                >
              </span>
            </td>
            <td>
              <span v-for="(infraComponentVersion, i) in productVersion.infraComponentVersions" :key="infraComponentVersion.id"
                >{{ i > 0 ? ', ' : '' }}
                <router-link
                  class="form-control-static"
                  :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }"
                  >{{ infraComponentVersion.id }}</router-link
                >
              </span>
            </td>
            <td>
              <div v-if="productVersion.root">
                <router-link :to="{ name: 'ProductVersionView', params: { productVersionId: productVersion.root.id } }">{{
                  productVersion.root.id
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ProductVersionView', params: { productVersionId: productVersion.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ProductVersionEdit', params: { productVersionId: productVersion.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(productVersion)"
                  variant="danger"
                  class="btn btn-sm"
                  data-cy="entityDeleteButton"
                  v-b-modal.removeEntity
                >
                  <font-awesome-icon icon="times"></font-awesome-icon>
                  <span class="d-none d-md-inline" v-text="t$('entity.action.delete')"></span>
                </b-button>
              </div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>
    <b-modal ref="removeEntity" id="removeEntity">
      <template #modal-title>
        <span
          id="sdiFrontendApp.productVersion.delete.question"
          data-cy="productVersionDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-productVersion-heading" v-text="t$('sdiFrontendApp.productVersion.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-productVersion"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeProductVersion()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./product-version.component.ts"></script>
