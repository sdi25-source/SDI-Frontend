<template>
  <div>
    <h2 id="page-heading" data-cy="DeployementTypeHeading">
      <span v-text="t$('sdiFrontendApp.deployementType.home.title')" id="deployement-type-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.deployementType.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'DeployementTypeCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-deployement-type"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.deployementType.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && deployementTypes && deployementTypes.length === 0">
      <span v-text="t$('sdiFrontendApp.deployementType.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="deployementTypes && deployementTypes.length > 0">
      <table class="table table-striped" aria-describedby="deployementTypes">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.deployementType.type')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.deployementType.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.deployementType.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.deployementType.notes')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="deployementType in deployementTypes" :key="deployementType.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'DeployementTypeView', params: { deployementTypeId: deployementType.id } }">{{
                deployementType.id
              }}</router-link>
            </td>
            <td>{{ deployementType.type }}</td>
            <td>{{ deployementType.createDate }}</td>
            <td>{{ deployementType.updateDate }}</td>
            <td>{{ deployementType.notes }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'DeployementTypeView', params: { deployementTypeId: deployementType.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'DeployementTypeEdit', params: { deployementTypeId: deployementType.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(deployementType)"
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
          id="sdiFrontendApp.deployementType.delete.question"
          data-cy="deployementTypeDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-deployementType-heading" v-text="t$('sdiFrontendApp.deployementType.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-deployementType"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeDeployementType()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./deployement-type.component.ts"></script>
