<template>
  <div>
    <h2 id="page-heading" data-cy="InfraComponentVersionHeading">
      <span v-text="t$('sdiFrontendApp.infraComponentVersion.home.title')" id="infra-component-version-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.infraComponentVersion.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'InfraComponentVersionCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-infra-component-version"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.infraComponentVersion.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && infraComponentVersions && infraComponentVersions.length === 0">
      <span v-text="t$('sdiFrontendApp.infraComponentVersion.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="infraComponentVersions && infraComponentVersions.length > 0">
      <table class="table table-striped" aria-describedby="infraComponentVersions">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponentVersion.version')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponentVersion.description')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponentVersion.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponentVersion.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponentVersion.infraComponent')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="infraComponentVersion in infraComponentVersions" :key="infraComponentVersion.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }">{{
                infraComponentVersion.id
              }}</router-link>
            </td>
            <td>{{ infraComponentVersion.version }}</td>
            <td>{{ infraComponentVersion.description }}</td>
            <td>{{ infraComponentVersion.createDate }}</td>
            <td>{{ infraComponentVersion.updateDate }}</td>
            <td>
              <div v-if="infraComponentVersion.infraComponent">
                <router-link :to="{ name: 'InfraComponentView', params: { infraComponentId: infraComponentVersion.infraComponent.id } }">{{
                  infraComponentVersion.infraComponent.name
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'InfraComponentVersionEdit', params: { infraComponentVersionId: infraComponentVersion.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(infraComponentVersion)"
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
          id="sdiFrontendApp.infraComponentVersion.delete.question"
          data-cy="infraComponentVersionDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-infraComponentVersion-heading"
          v-text="t$('sdiFrontendApp.infraComponentVersion.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-infraComponentVersion"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeInfraComponentVersion()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./infra-component-version.component.ts"></script>
