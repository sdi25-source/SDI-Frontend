<template>
  <div>
    <h2 id="page-heading" data-cy="CustomisationLevelHeading">
      <span v-text="t$('sdiFrontendApp.customisationLevel.home.title')" id="customisation-level-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.customisationLevel.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'CustomisationLevelCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-customisation-level"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.customisationLevel.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && customisationLevels && customisationLevels.length === 0">
      <span v-text="t$('sdiFrontendApp.customisationLevel.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="customisationLevels && customisationLevels.length > 0">
      <table class="table table-striped" aria-describedby="customisationLevels">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.customisationLevel.level')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.customisationLevel.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.customisationLevel.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.customisationLevel.notes')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="customisationLevel in customisationLevels" :key="customisationLevel.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'CustomisationLevelView', params: { customisationLevelId: customisationLevel.id } }">{{
                customisationLevel.id
              }}</router-link>
            </td>
            <td>{{ customisationLevel.level }}</td>
            <td>{{ customisationLevel.createDate }}</td>
            <td>{{ customisationLevel.updateDate }}</td>
            <td>{{ customisationLevel.notes }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'CustomisationLevelView', params: { customisationLevelId: customisationLevel.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'CustomisationLevelEdit', params: { customisationLevelId: customisationLevel.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(customisationLevel)"
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
          id="sdiFrontendApp.customisationLevel.delete.question"
          data-cy="customisationLevelDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-customisationLevel-heading"
          v-text="t$('sdiFrontendApp.customisationLevel.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-customisationLevel"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeCustomisationLevel()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./customisation-level.component.ts"></script>
