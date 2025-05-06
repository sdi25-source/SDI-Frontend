<template>
  <div class="client-type-container">
    <div class="d-flex justify-content-between align-items-center mb-4">
      <h2 id="page-heading" class="m-0 text-primary font-weight-bold" data-cy="ClientTypeHeading">
        <span v-text="t$('sdiFrontendApp.clientType.home.title')" id="client-type-heading"></span>
      </h2>
      <div class="d-flex">
        <button class="btn btn-outline-primary mr-2 d-flex align-items-center" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching" class="mr-2"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.clientType.home.refreshListLabel')"></span>
        </button>
        <button
          @click="showAddRow = true"
          id="jh-create-entity"
          data-cy="entityCreateButton"
          class="btn btn-primary jh-create-entity create-client-type"
          :disabled="showAddRow"
        >
          <font-awesome-icon icon="plus" class="mr-2" />
          <span v-text="t$('sdiFrontendApp.clientType.home.createLabel')"></span>
        </button>
      </div>
    </div>

    <!-- Empty state -->
    <div class="alert alert-warning" v-if="!isFetching && clientTypes && clientTypes.length === 0">
      <span v-text="t$('sdiFrontendApp.clientType.home.notFound')"></span>
    </div>

    <!-- Data table -->
    <div class="card shadow-sm" v-if="clientTypes && clientTypes.length > 0">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="clientTypes">
          <thead class="thead-light">
            <tr>
              <th scope="col" width="80"><span v-text="t$('global.field.id')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.clientType.type')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.clientType.createDate')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.clientType.updateDate')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.clientType.notes')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="clientType in clientTypes" :key="clientType.id" data-cy="entityTable" class="align-middle">
              <td>
                <router-link
                  class="font-weight-bold text-primary"
                  :to="{ name: 'ClientTypeView', params: { clientTypeId: clientType.id } }"
                >
                  {{ clientType.id }}
                </router-link>
              </td>
              <td>{{ clientType.type }}</td>
              <td>{{ clientType.createDate }}</td>
              <td>{{ clientType.updateDate }}</td>
              <td class="text-truncate" style="max-width: 250px" :title="clientType.notes">{{ clientType.notes }}</td>
              <td class="text-center">
                <div class="btn-group">
                  <router-link :to="{ name: 'ClientTypeView', params: { clientTypeId: clientType.id } }" custom v-slot="{ navigate }">
                    <button @click="navigate" class="btn btn-sm btn-outline-secondary" data-cy="entityDetailsButton" title="Voir">
                      <font-awesome-icon icon="eye"></font-awesome-icon>
                      <span class="d-none d-lg-inline ml-1" v-text="t$('entity.action.view')"></span>
                    </button>
                  </router-link>
                  <router-link :to="{ name: 'ClientTypeEdit', params: { clientTypeId: clientType.id } }" custom v-slot="{ navigate }">
                    <button @click="navigate" class="btn btn-sm btn-outline-primary mx-1" data-cy="entityEditButton" title="Modifier">
                      <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                      <span class="d-none d-lg-inline ml-1" v-text="t$('entity.action.edit')"></span>
                    </button>
                  </router-link>
                  <b-button
                    @click="prepareRemove(clientType)"
                    variant="outline-danger"
                    size="sm"
                    data-cy="entityDeleteButton"
                    v-b-modal.removeEntity
                    title="Supprimer"
                  >
                    <font-awesome-icon icon="trash"></font-awesome-icon>
                    <span class="d-none d-lg-inline ml-1" v-text="t$('entity.action.delete')"></span>
                  </b-button>
                </div>
              </td>
            </tr>
            <!-- Ligne d'ajout -->
            <tr v-if="showAddRow">
              <td>—</td>
              <td><input type="text" class="form-control" v-model="newClientType.type" placeholder="Type" /></td>
              <td><input type="date" class="form-control" v-model="newClientType.createDate" placeholder="Date de création" /></td>
              <td><input type="date" class="form-control" v-model="newClientType.updateDate" placeholder="Date de mise à jour" /></td>
              <td><input type="text" class="form-control" v-model="newClientType.notes" placeholder="Notes" /></td>
              <td class="text-center">
                <button class="btn btn-sm btn-success" @click="saveNewClientType">
                  <font-awesome-icon icon="check" />
                  <span class="d-none d-lg-inline ml-1">Enregistrer</span>
                </button>
                <button class="btn btn-sm btn-secondary ml-1" @click="cancelNewClientType">
                  <font-awesome-icon icon="times" />
                  <span class="d-none d-lg-inline ml-1">Annuler</span>
                </button>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal suppression -->
    <b-modal ref="removeEntity" id="removeEntity" centered title-class="text-danger">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <font-awesome-icon icon="exclamation-triangle" class="text-danger mr-2"></font-awesome-icon>
          <span
            id="sdiFrontendApp.clientType.delete.question"
            data-cy="clientTypeDeleteDialogHeading"
            v-text="t$('entity.delete.title')"
            class="font-weight-bold"
          ></span>
        </div>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-clientType-heading" class="mb-0" v-text="t$('sdiFrontendApp.clientType.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-clientType"
              data-cy="entityConfirmDeleteButton"
              v-text="t$('entity.action.delete')"
              @click="removeClientType()"
            ></button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./client-type.component.ts"></script>

<style scoped>
.client-type-container {
  padding: 1.5rem;
}
.card {
  border-radius: 0.5rem;
  overflow: hidden;
  border: none;
}
.table th {
  border-top: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #6c757d;
}
.table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}
.btn-group .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
</style>
