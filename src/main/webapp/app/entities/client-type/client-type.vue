<template>
  <div>
    <h2 id="page-heading" data-cy="ClientTypeHeading">
      <span v-text="t$('sdiFrontendApp.clientType.home.title')" id="client-type-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.clientType.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ClientTypeCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-client-type"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.clientType.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && clientTypes && clientTypes.length === 0">
      <span v-text="t$('sdiFrontendApp.clientType.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="clientTypes && clientTypes.length > 0">
      <table class="table table-striped" aria-describedby="clientTypes">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientType.type')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientType.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientType.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientType.notes')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="clientType in clientTypes" :key="clientType.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ClientTypeView', params: { clientTypeId: clientType.id } }">{{ clientType.id }}</router-link>
            </td>
            <td>{{ clientType.type }}</td>
            <td>{{ clientType.createDate }}</td>
            <td>{{ clientType.updateDate }}</td>
            <td>{{ clientType.notes }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'ClientTypeView', params: { clientTypeId: clientType.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'ClientTypeEdit', params: { clientTypeId: clientType.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(clientType)"
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
          id="sdiFrontendApp.clientType.delete.question"
          data-cy="clientTypeDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-clientType-heading" v-text="t$('sdiFrontendApp.clientType.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-clientType"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeClientType()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./client-type.component.ts"></script>
