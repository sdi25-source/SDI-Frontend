<template>
  <div>
    <h2 id="page-heading" data-cy="ModuleDeployementHeading">
      <span v-text="t$('sdiFrontendApp.moduleDeployement.home.title')" id="module-deployement-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.moduleDeployement.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ModuleDeployementCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-module-deployement"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.moduleDeployement.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && moduleDeployements && moduleDeployements.length === 0">
      <span v-text="t$('sdiFrontendApp.moduleDeployement.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="moduleDeployements && moduleDeployements.length > 0">
      <table class="table table-striped" aria-describedby="moduleDeployements">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleDeployement.code')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleDeployement.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleDeployement.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleDeployement.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleDeployement.moduleVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleDeployement.productDeployementDetail')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="moduleDeployement in moduleDeployements" :key="moduleDeployement.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ModuleDeployementView', params: { moduleDeployementId: moduleDeployement.id } }">{{
                moduleDeployement.id
              }}</router-link>
            </td>
            <td>{{ moduleDeployement.code }}</td>
            <td>{{ moduleDeployement.notes }}</td>
            <td>{{ moduleDeployement.createDate }}</td>
            <td>{{ moduleDeployement.updateDate }}</td>
            <td>
              <div v-if="moduleDeployement.moduleVersion">
                <router-link :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleDeployement.moduleVersion.id } }">{{
                  moduleDeployement.moduleVersion.version
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="moduleDeployement.productDeployementDetail">
                <router-link
                  :to="{
                    name: 'ProductDeployementDetailView',
                    params: { productDeployementDetailId: moduleDeployement.productDeployementDetail.id },
                  }"
                  >{{ moduleDeployement.productDeployementDetail.id }}</router-link
                >
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ModuleDeployementView', params: { moduleDeployementId: moduleDeployement.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ModuleDeployementEdit', params: { moduleDeployementId: moduleDeployement.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(moduleDeployement)"
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
          id="sdiFrontendApp.moduleDeployement.delete.question"
          data-cy="moduleDeployementDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-moduleDeployement-heading" v-text="t$('sdiFrontendApp.moduleDeployement.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-moduleDeployement"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeModuleDeployement()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./module-deployement.component.ts"></script>
