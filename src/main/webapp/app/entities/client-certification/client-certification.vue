<template>
  <div>
    <h2 id="page-heading" data-cy="ClientCertificationHeading">
      <span v-text="t$('sdiFrontendApp.clientCertification.home.title')" id="client-certification-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.clientCertification.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'ClientCertificationCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-client-certification"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.clientCertification.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && clientCertifications && clientCertifications.length === 0">
      <span v-text="t$('sdiFrontendApp.clientCertification.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="clientCertifications && clientCertifications.length > 0">
      <table class="table table-striped" aria-describedby="clientCertifications">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientCertification.certification')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientCertification.certificationDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientCertification.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientCertification.updateDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientCertification.notes')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientCertification.client')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.clientCertification.certif')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="clientCertification in clientCertifications" :key="clientCertification.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'ClientCertificationView', params: { clientCertificationId: clientCertification.id } }">{{
                clientCertification.id
              }}</router-link>
            </td>
            <td>{{ clientCertification.certification }}</td>
            <td>{{ clientCertification.certificationDate }}</td>
            <td>{{ clientCertification.createDate }}</td>
            <td>{{ clientCertification.updateDate }}</td>
            <td>{{ clientCertification.notes }}</td>
            <td>
              <div v-if="clientCertification.client">
                <router-link :to="{ name: 'ClientView', params: { clientId: clientCertification.client.id } }">{{
                  clientCertification.client.code
                }}</router-link>
              </div>
            </td>
            <td>
              <div v-if="clientCertification.certif">
                <router-link :to="{ name: 'CertificationView', params: { certificationId: clientCertification.certif.id } }">{{
                  clientCertification.certif.name
                }}</router-link>
              </div>
            </td>
            <td class="text-right">
              <div class="btn-group">
                <router-link
                  :to="{ name: 'ClientCertificationView', params: { clientCertificationId: clientCertification.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link
                  :to="{ name: 'ClientCertificationEdit', params: { clientCertificationId: clientCertification.id } }"
                  custom
                  v-slot="{ navigate }"
                >
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(clientCertification)"
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
          id="sdiFrontendApp.clientCertification.delete.question"
          data-cy="clientCertificationDeleteDialogHeading"
          v-text="t$('entity.delete.title')"
        ></span>
      </template>
      <div class="modal-body">
        <p
          id="jhi-delete-clientCertification-heading"
          v-text="t$('sdiFrontendApp.clientCertification.delete.question', { id: removeId })"
        ></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-clientCertification"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeClientCertification()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./client-certification.component.ts"></script>
