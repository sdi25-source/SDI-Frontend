<template>
  <div>
    <h2 id="page-heading" data-cy="ClientEventHeading">
      <span v-text="t$('sdiFrontendApp.clientEvent.home.title')" id="client-event-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.clientEvent.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ClientEventCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-client-event"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.clientEvent.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && clientEvents && clientEvents.length === 0">
      <span v-text="t$('sdiFrontendApp.clientEvent.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="clientEvents && clientEvents.length > 0">
      <table class="table table-striped" aria-describedby="clientEvents">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEvent.event')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEvent.description')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEvent.eventDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEvent.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEvent.client')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientEvent.clientEventType')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="clientEvent in clientEvents" :key="clientEvent.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ClientEventView', params: { clientEventId: clientEvent.id } }">{{ clientEvent.id }}</router-link>
            </td>
            <td>{{ clientEvent.event }}</td>
            <td>{{ clientEvent.description }}</td>
            <td>{{ clientEvent.eventDate }}</td>
            <td>{{ clientEvent.notes }}</td>
            <td>
              <div v-if="clientEvent.client">
                <router-link :to="{ name: 'ClientView', params: { clientId: clientEvent.client.id } }">{{
                  clientEvent.client.code
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="clientEvent.clientEventType">
                <router-link :to="{ name: 'ClientEventTypeView', params: { clientEventTypeId: clientEvent.clientEventType.id } }">{{
                  clientEvent.clientEventType.type
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'ClientEventView', params: { clientEventId: clientEvent.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'ClientEventEdit', params: { clientEventId: clientEvent.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(clientEvent)"
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
          id="sdiFrontendApp.clientEvent.delete.question"
          data-cy="clientEventDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-clientEvent-heading" v-text="t$('sdiFrontendApp.clientEvent.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-clientEvent"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeClientEvent()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./client-event.component.ts"></script>
