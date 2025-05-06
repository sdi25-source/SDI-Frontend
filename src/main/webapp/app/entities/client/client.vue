<template>
  <div>
    <h2 id="page-heading" data-cy="ClientHeading">
      <span v-text="t$('sdiFrontendApp.client.home.title')" id="client-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.client.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ClientCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-client"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.client.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && clients && clients.length === 0">
      <span v-text="t$('sdiFrontendApp.client.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="clients && clients.length > 0">
      <table class="table table-striped" aria-describedby="clients">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.clientLogo')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.name')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.code')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.mainContactName')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.mainContactEmail')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.currentCardHolderNumber')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.currentBruncheNumber')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.currentCustomersNumber')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.mainContactPhoneNumber')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.url')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.address')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.country')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.size')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.client.clientType')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="client in clients" :key="client.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ClientView', params: { clientId: client.id } }">{{ client.id }}</router-link>
            </td>
            <td>{{ client.clientLogo }}</td>
            <td>{{ client.name }}</td>
            <td>{{ client.code }}</td>
            <td>{{ client.mainContactName }}</td>
            <td>{{ client.mainContactEmail }}</td>
            <td>{{ client.currentCardHolderNumber }}</td>
            <td>{{ client.currentBruncheNumber }}</td>
            <td>{{ client.currentCustomersNumber }}</td>
            <td>{{ client.mainContactPhoneNumber }}</td>
            <td>{{ client.url }}</td>
            <td>{{ client.address }}</td>
            <td>{{ client.createDate }}</td>
            <td>{{ client.updateDate }}</td>
            <td>{{ client.notes }}</td>
            <td>
              <div v-if="client.country">
                <router-link :to="{ name: 'CountryView', params: { countryId: client.country.id } }">{{
                  client.country.countryname
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="client.size">
                <router-link :to="{ name: 'ClientSizeView', params: { clientSizeId: client.size.id } }">{{
                  client.size.sizeCode
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="client.clientType">
                <router-link :to="{ name: 'ClientTypeView', params: { clientTypeId: client.clientType.id } }">{{
                  client.clientType.type
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'ClientView', params: { clientId: client.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'ClientEdit', params: { clientId: client.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(client)"
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
        <span id="sdiFrontendApp.client.delete.question" data-cy="clientDeleteDialogHeading" v-text="t$('entity.delete.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-client-heading" v-text="t$('sdiFrontendApp.client.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-client"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeClient()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./client.component.ts"></script>
