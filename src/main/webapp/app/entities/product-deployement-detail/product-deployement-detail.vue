<template>
  <div>
    <h2 id="page-heading" data-cy="ProductDeployementDetailHeading">
      <span v-text="t$('sdiFrontendApp.productDeployementDetail.home.title')" id="product-deployement-detail-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.productDeployementDetail.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ProductDeployementDetailCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-product-deployement-detail"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && productDeployementDetails && productDeployementDetails.length === 0">
      <span v-text="t$('sdiFrontendApp.productDeployementDetail.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="productDeployementDetails && productDeployementDetails.length > 0">
      <table class="table table-striped" aria-describedby="productDeployementDetails">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployementDetail.startDeployementDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployementDetail.endDeployementDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployementDetail.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployementDetail.productDeployement')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployementDetail.infraComponentVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployementDetail.allowedModuleVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployementDetail.productVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.productDeployementDetail.deployementType')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="productDeployementDetail in productDeployementDetails" :key="productDeployementDetail.id" data-cy="entityTable">
            <td>
              <router-link
                :to="{ name: 'ProductDeployementDetailView', params: { productDeployementDetailId: productDeployementDetail.id } }"
                >{{ productDeployementDetail.id }}</router-link
              >
            </td>
            <td>{{ productDeployementDetail.startDeployementDate }}</td>
            <td>{{ productDeployementDetail.endDeployementDate }}</td>
            <td>{{ productDeployementDetail.notes }}</td>
            <td>
              <div v-if="productDeployementDetail.productDeployement">
                <router-link
                  :to="{ name: 'ProductDeployementView', params: { productDeployementId: productDeployementDetail.productDeployement.id } }"
                  >{{ productDeployementDetail.productDeployement.refContract }}</router-link
                >
              </div>
            </td>
            <td>
              <span v-for="(infraComponentVersion, i) in productDeployementDetail.infraComponentVersions" :key="infraComponentVersion.id"
                >{{ i > 0 ? ', ' : '' }}
                <router-link
                  class="form-control-static"
                  :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }"
                  >{{ infraComponentVersion.id }}</router-link
                >
              </span>
            </td>
            <td>
              <span v-for="(allowedModuleVersion, i) in productDeployementDetail.allowedModuleVersions" :key="allowedModuleVersion.id"
                >{{ i > 0 ? ', ' : '' }}
                <router-link
                  class="form-control-static"
                  :to="{ name: 'ModuleVersionView', params: { moduleVersionId: allowedModuleVersion.id } }"
                  >{{ allowedModuleVersion.id }}</router-link
                >
              </span>
            </td>
            <td>
              <div v-if="productDeployementDetail.productVersion">
                <router-link
                  :to="{ name: 'ProductVersionView', params: { productVersionId: productDeployementDetail.productVersion.id } }"
                  >{{ productDeployementDetail.productVersion.version }}</router-link
                >
              </div>
            </td>
            <td>
              <div v-if="productDeployementDetail.deployementType">
                <router-link
                  :to="{ name: 'DeployementTypeView', params: { deployementTypeId: productDeployementDetail.deployementType.id } }"
                  >{{ productDeployementDetail.deployementType.type }}</router-link
                >
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ProductDeployementDetailView', params: { productDeployementDetailId: productDeployementDetail.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ProductDeployementDetailEdit', params: { productDeployementDetailId: productDeployementDetail.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(productDeployementDetail)"
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
          id="sdiFrontendApp.productDeployementDetail.delete.question"
          data-cy="productDeployementDetailDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-productDeployementDetail-heading"
          v-text="t$('sdiFrontendApp.productDeployementDetail.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-productDeployementDetail"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeProductDeployementDetail()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./product-deployement-detail.component.ts"></script>
