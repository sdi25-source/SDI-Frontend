<template>
  <div>
    <h2 id="page-heading" data-cy="ClientEventTypeHeading">
      <span v-text="t$('sdiFrontendApp.clientEventType.home.title')" id="client-event-type-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.clientEventType.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ClientEventTypeCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-client-event-type"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.clientEventType.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && clientEventTypes && clientEventTypes.length === 0">
      <span v-text="t$('sdiFrontendApp.clientEventType.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="clientEventTypes && clientEventTypes.length > 0">
      <table class="table table-striped" aria-describedby="clientEventTypes">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEventType.type')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEventType.description')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEventType.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEventType.updateDate')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="clientEventType in clientEventTypes" :key="clientEventType.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ClientEventTypeView', params: { clientEventTypeId: clientEventType.id } }">{{
                clientEventType.id
              }}</router-link>
            </td>
            <td>{{ clientEventType.type }}</td>
            <td>{{ clientEventType.description }}</td>
            <td>{{ clientEventType.createDate }}</td>
            <td>{{ clientEventType.updateDate }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ClientEventTypeView', params: { clientEventTypeId: clientEventType.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ClientEventTypeEdit', params: { clientEventTypeId: clientEventType.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(clientEventType)"
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
          id="sdiFrontendApp.clientEventType.delete.question"
          data-cy="clientEventTypeDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-clientEventType-heading" v-text="t$('sdiFrontendApp.clientEventType.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-clientEventType"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeClientEventType()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./client-event-type.component.ts"></script>
