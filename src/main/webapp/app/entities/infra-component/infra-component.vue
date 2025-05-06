<template>
  <div>
    <h2 id="page-heading" data-cy="InfraComponentHeading">
      <span v-text="t$('sdiFrontendApp.infraComponent.home.title')" id="infra-component-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.infraComponent.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'InfraComponentCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-infra-component"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.infraComponent.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && infraComponents && infraComponents.length === 0">
      <span v-text="t$('sdiFrontendApp.infraComponent.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="infraComponents && infraComponents.length > 0">
      <table class="table table-striped" aria-describedby="infraComponents">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponent.name')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponent.vendor')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponent.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponent.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.infraComponent.componentType')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="infraComponent in infraComponents" :key="infraComponent.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'InfraComponentView', params: { infraComponentId: infraComponent.id } }">{{
                infraComponent.id
              }}</router-link>
            </td>
            <td>{{ infraComponent.name }}</td>
            <td>{{ infraComponent.vendor }}</td>
            <td>{{ infraComponent.notes }}</td>
            <td>{{ infraComponent.createDate }}</td>
            <td>
              <div v-if="infraComponent.componentType">
                <router-link :to="{ name: 'ComponentTypeView', params: { componentTypeId: infraComponent.componentType.id } }">{{
                  infraComponent.componentType.type
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'InfraComponentView', params: { infraComponentId: infraComponent.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'InfraComponentEdit', params: { infraComponentId: infraComponent.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(infraComponent)"
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
          id="sdiFrontendApp.infraComponent.delete.question"
          data-cy="infraComponentDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-infraComponent-heading" v-text="t$('sdiFrontendApp.infraComponent.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-infraComponent"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeInfraComponent()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./infra-component.component.ts"></script>
