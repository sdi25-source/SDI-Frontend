<template>
  <div>
    <h2 id="page-heading" data-cy="RequestOfChangeHeading">
      <span v-text="t$('sdiFrontendApp.requestOfChange.home.title')" id="request-of-change-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.requestOfChange.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'RequestOfChangeCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-request-of-change"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.requestOfChange.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && requestOfChanges && requestOfChanges.length === 0">
      <span v-text="t$('sdiFrontendApp.requestOfChange.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="requestOfChanges && requestOfChanges.length > 0">
      <table class="table table-striped" aria-describedby="requestOfChanges">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.title')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.keywords')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.status')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.description')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.productVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.client')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.moduleVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.requestOfChange.customisationLevel')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="requestOfChange in requestOfChanges" :key="requestOfChange.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'RequestOfChangeView', params: { requestOfChangeId: requestOfChange.id } }">{{
                requestOfChange.id
              }}</router-link>
            </td>
            <td>{{ requestOfChange.title }}</td>
            <td>{{ requestOfChange.keywords }}</td>
            <td v-text="t$('sdiFrontendApp.RequestStatus.' + requestOfChange.status)"></td>
            <td>{{ requestOfChange.createDate }}</td>
            <td>{{ requestOfChange.description }}</td>
            <td>
              <div v-if="requestOfChange.productVersion">
                <router-link :to="{ name: 'ProductVersionView', params: { productVersionId: requestOfChange.productVersion.id } }">{{
                  requestOfChange.productVersion.version
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="requestOfChange.client">
                <router-link :to="{ name: 'ClientView', params: { clientId: requestOfChange.client.id } }">{{
                  requestOfChange.client.code
                }}</router-link>
              </div>
            </td>
            <td>
              <span v-for="(moduleVersion, i) in requestOfChange.moduleVersions" :key="moduleVersion.id"
                >{{ i > 0 ? ', ' : '' }}
                <router-link
                  class="form-control-static"
                  :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleVersion.id } }"
                  >{{ moduleVersion.id }}</router-link
                >
              </span>
            </td>
            <td>
              <div v-if="requestOfChange.customisationLevel">
                <router-link
                  :to="{ name: 'CustomisationLevelView', params: { customisationLevelId: requestOfChange.customisationLevel.id } }"
                  >{{ requestOfChange.customisationLevel.id }}</router-link
                >
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'RequestOfChangeView', params: { requestOfChangeId: requestOfChange.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'RequestOfChangeEdit', params: { requestOfChangeId: requestOfChange.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(requestOfChange)"
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
          id="sdiFrontendApp.requestOfChange.delete.question"
          data-cy="requestOfChangeDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-requestOfChange-heading" v-text="t$('sdiFrontendApp.requestOfChange.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-requestOfChange"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeRequestOfChange()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./request-of-change.component.ts"></script>
