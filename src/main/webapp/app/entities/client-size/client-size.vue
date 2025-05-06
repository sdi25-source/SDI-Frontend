<template>
  <div>
    <h2 id="page-heading" data-cy="ClientSizeHeading">
      <span v-text="t$('sdiFrontendApp.clientSize.home.title')" id="client-size-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.clientSize.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ClientSizeCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-client-size"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.clientSize.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && clientSizes && clientSizes.length === 0">
      <span v-text="t$('sdiFrontendApp.clientSize.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="clientSizes && clientSizes.length > 0">
      <table class="table table-striped" aria-describedby="clientSizes">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientSize.sizeName')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientSize.sizeCode')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientSize.sizeDescription')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientSize.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientSize.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientSize.notes')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="clientSize in clientSizes" :key="clientSize.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ClientSizeView', params: { clientSizeId: clientSize.id } }">{{ clientSize.id }}</router-link>
            </td>
            <td>{{ clientSize.sizeName }}</td>
            <td>{{ clientSize.sizeCode }}</td>
            <td>{{ clientSize.sizeDescription }}</td>
            <td>{{ clientSize.createDate }}</td>
            <td>{{ clientSize.updateDate }}</td>
            <td>{{ clientSize.notes }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'ClientSizeView', params: { clientSizeId: clientSize.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'ClientSizeEdit', params: { clientSizeId: clientSize.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(clientSize)"
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
          id="sdiFrontendApp.clientSize.delete.question"
          data-cy="clientSizeDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-clientSize-heading" v-text="t$('sdiFrontendApp.clientSize.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-clientSize"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeClientSize()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./client-size.component.ts"></script>
