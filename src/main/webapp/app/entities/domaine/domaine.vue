<template>
  <div>
    <h2 id="page-heading" data-cy="DomaineHeading">
      <span v-text="t$('sdiFrontendApp.domaine.home.title')" id="domaine-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.domaine.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'DomaineCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-domaine"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.domaine.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && domaines && domaines.length === 0">
      <span v-text="t$('sdiFrontendApp.domaine.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="domaines && domaines.length > 0">
      <table class="table table-striped" aria-describedby="domaines">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.domaine.name')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.domaine.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.domaine.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.domaine.notes')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="domaine in domaines" :key="domaine.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'DomaineView', params: { domaineId: domaine.id } }">{{ domaine.id }}</router-link>
            </td>
            <td>{{ domaine.name }}</td>
            <td>{{ domaine.createDate }}</td>
            <td>{{ domaine.updateDate }}</td>
            <td>{{ domaine.notes }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'DomaineView', params: { domaineId: domaine.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'DomaineEdit', params: { domaineId: domaine.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(domaine)"
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
        <span id="sdiFrontendApp.domaine.delete.question" data-cy="domaineDeleteDialogHeading" v-text="t$('entity.delete.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-domaine-heading" v-text="t$('sdiFrontendApp.domaine.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-domaine"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeDomaine()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./domaine.component.ts"></script>
