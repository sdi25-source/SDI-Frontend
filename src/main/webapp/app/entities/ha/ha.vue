<template>
  <div>
    <h2 id="page-heading" data-cy="HAHeading">
      <span v-text="t$('sdiFrontendApp.hA.home.title')" id="ha-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.hA.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'HACreate' }" custom v-slot="{ navigate }">
          <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn btn-primary jh-create-entity create-ha">
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.hA.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && hAS && hAS.length === 0">
      <span v-text="t$('sdiFrontendApp.hA.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="hAS && hAS.length > 0">
      <table class="table table-striped" aria-describedby="hAS">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.hA.name')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.hA.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.hA.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.hA.notes')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="hA in hAS" :key="hA.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'HAView', params: { hAId: hA.id } }">{{ hA.id }}</router-link>
            </td>
            <td>{{ hA.name }}</td>
            <td>{{ hA.createDate }}</td>
            <td>{{ hA.updateDate }}</td>
            <td>{{ hA.notes }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'HAView', params: { hAId: hA.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'HAEdit', params: { hAId: hA.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(hA)"
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
        <span id="sdiFrontendApp.hA.delete.question" data-cy="hADeleteDialogHeading" v-text="t$('entity.delete.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-hA-heading" v-text="t$('sdiFrontendApp.hA.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-hA"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeHA()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./ha.component.ts"></script>
