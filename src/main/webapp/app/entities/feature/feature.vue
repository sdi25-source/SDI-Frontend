<template>
  <div>
    <h2 id="page-heading" data-cy="FeatureHeading">
      <span v-text="t$('sdiFrontendApp.feature.home.title')" id="feature-heading"></span>
      <div class="d-flex justify-content-end">
        <button class="btn btn-info mr-2" @click="handleSyncList" :disabled="isFetching">
          <font-awesome-icon icon="sync" :spin="isFetching"></font-awesome-icon>
          <span v-text="t$('sdiFrontendApp.feature.home.refreshListLabel')"></span>
        </button>
        <router-link :to="{ name: 'FeatureCreate' }" custom v-slot="{ navigate }">
          <button
            @click="navigate"
            id="jh-create-entity"
            data-cy="entityCreateButton"
            class="btn btn-primary jh-create-entity create-feature"
          >
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('sdiFrontendApp.feature.home.createLabel')"></span>
          </button>
        </router-link>
      </div>
    </h2>
    <br />
    <div class="alert alert-warning" v-if="!isFetching && features && features.length === 0">
      <span v-text="t$('sdiFrontendApp.feature.home.notFound')"></span>
    </div>
    <div class="table-responsive" v-if="features && features.length > 0">
      <table class="table table-striped" aria-describedby="features">
        <thead>
          <tr>
            <th scope="row"><span v-text="t$('global.field.id')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.feature.name')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.feature.apiVersion')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.feature.description')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.feature.createDate')"></span></th>
            <th scope="row"><span v-text="t$('sdiFrontendApp.feature.updateDate')"></span></th>
            <th scope="row"></th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="feature in features" :key="feature.id" data-cy="entityTable">
            <td>
              <router-link :to="{ name: 'FeatureView', params: { featureId: feature.id } }">{{ feature.id }}</router-link>
            </td>
            <td>{{ feature.name }}</td>
            <td>{{ feature.apiVersion }}</td>
            <td>{{ feature.description }}</td>
            <td>{{ feature.createDate }}</td>
            <td>{{ feature.updateDate }}</td>
            <td class="text-right">
              <div class="btn-group">
                <router-link :to="{ name: 'FeatureView', params: { featureId: feature.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-info btn-sm details" data-cy="entityDetailsButton">
                    <font-awesome-icon icon="eye"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.view')"></span>
                  </button>
                </router-link>
                <router-link :to="{ name: 'FeatureEdit', params: { featureId: feature.id } }" custom v-slot="{ navigate }">
                  <button @click="navigate" class="btn btn-primary btn-sm edit" data-cy="entityEditButton">
                    <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                    <span class="d-none d-md-inline" v-text="t$('entity.action.edit')"></span>
                  </button>
                </router-link>
                <b-button
                  @click="prepareRemove(feature)"
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
        <span id="sdiFrontendApp.feature.delete.question" data-cy="featureDeleteDialogHeading" v-text="t$('entity.delete.title')"></span>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-feature-heading" v-text="t$('sdiFrontendApp.feature.delete.question', { id: removeId })"></p>
      </div>
      <template #modal-footer>
        <div>
          <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
          <button
            type="button"
            class="btn btn-primary"
            id="jhi-confirm-delete-feature"
            data-cy="entityConfirmDeleteButton"
            v-text="t$('entity.action.delete')"
            @click="removeFeature()"
          ></button>
        </div>
      </template>
    </b-modal>
  </div>
</template>

<script lang="ts" src="./feature.component.ts"></script>
