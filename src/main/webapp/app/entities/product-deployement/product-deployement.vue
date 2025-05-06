<template>
  <div>
    <h2 id="page-heading" data-cy="ProductDeployementHeading">
      <span v-text="t$('sdiFrontendApp.productDeployement.home.title')" id="product-deployement-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.productDeployement.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ProductDeployementCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-product-deployement"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.productDeployement.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && productDeployements && productDeployements.length === 0">
      <span v-text="t$('sdiFrontendApp.productDeployement.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="productDeployements && productDeployements.length > 0">
      <table class="table table-striped" aria-describedby="productDeployements">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployement.refContract')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployement.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployement.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployement.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployement.client')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="productDeployement in productDeployements" :key="productDeployement.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ProductDeployementView', params: { productDeployementId: productDeployement.id } }">{{
                productDeployement.id
              }}</router-link>
            </td>
            <td>{{ productDeployement.refContract }}</td>
            <td>{{ productDeployement.createDate }}</td>
            <td>{{ productDeployement.updateDate }}</td>
            <td>{{ productDeployement.notes }}</td>
            <td>
              <div v-if="productDeployement.client">
                <router-link :to="{ name: 'ClientView', params: { clientId: productDeployement.client.id } }">{{
                  productDeployement.client.code
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ProductDeployementView', params: { productDeployementId: productDeployement.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ProductDeployementEdit', params: { productDeployementId: productDeployement.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(productDeployement)"
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
          id="sdiFrontendApp.productDeployement.delete.question"
          data-cy="productDeployementDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-productDeployement-heading"
          v-text="t$('sdiFrontendApp.productDeployement.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-productDeployement"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeProductDeployement()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./product-deployement.component.ts"></script>
