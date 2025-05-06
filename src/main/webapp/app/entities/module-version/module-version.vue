<template>
  <div>
    <h2 id="page-heading" data-cy="ModuleVersionHeading">
      <span v-text="t$('sdiFrontendApp.moduleVersion.home.title')" id="module-version-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.moduleVersion.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ModuleVersionCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-module-version"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.moduleVersion.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && moduleVersions && moduleVersions.length === 0">
      <span v-text="t$('sdiFrontendApp.moduleVersion.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="moduleVersions && moduleVersions.length > 0">
      <table class="table table-striped" aria-describedby="moduleVersions">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleVersion.version')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleVersion.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleVersion.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleVersion.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleVersion.module')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleVersion.feature')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleVersion.domaine')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.moduleVersion.root')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="moduleVersion in moduleVersions" :key="moduleVersion.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleVersion.id } }">{{
                moduleVersion.id
              }}</router-link>
            </td>
            <td>{{ moduleVersion.version }}</td>
            <td>{{ moduleVersion.createDate }}</td>
            <td>{{ moduleVersion.updateDate }}</td>
            <td>{{ moduleVersion.notes }}</td>
            <td>
              <div v-if="moduleVersion.module">
                <router-link :to="{ name: 'ModuleView', params: { moduleId: moduleVersion.module.id } }">{{
                  moduleVersion.module.name
                }}</router-link>
              </div>
            </td>
            <td>
              <span v-for="(feature, i) in moduleVersion.features" :key="feature.id"
                >{{ i > 0 ? ', ' : '' }}
                <router-link class="form-control-static" :to="{ name: 'FeatureView', params: { featureId: feature.id } }">{{
                  feature.id
                }}</router-link>
              </span>
            </td>
            <td>
              <div v-if="moduleVersion.domaine">
                <router-link :to="{ name: 'DomaineView', params: { domaineId: moduleVersion.domaine.id } }">{{
                  moduleVersion.domaine.name
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="moduleVersion.root">
                <router-link :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleVersion.root.id } }">{{
                  moduleVersion.root.id
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleVersion.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ModuleVersionEdit', params: { moduleVersionId: moduleVersion.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(moduleVersion)"
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
          id="sdiFrontendApp.moduleVersion.delete.question"
          data-cy="moduleVersionDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-moduleVersion-heading" v-text="t$('sdiFrontendApp.moduleVersion.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-moduleVersion"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeModuleVersion()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./module-version.component.ts"></script>
