<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="infraComponentVersion">
        <h2 class="jh-entity-heading" data-cy="infraComponentVersionDetailsHeading">
          <span v-text="t$('sdiFrontendApp.infraComponentVersion.detail.title')"></span> {{ infraComponentVersion.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponentVersion.version')"></span>
          </dt>
          <dd>
            <span>{{ infraComponentVersion.version }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponentVersion.description')"></span>
          </dt>
          <dd>
            <span>{{ infraComponentVersion.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponentVersion.createDate')"></span>
          </dt>
          <dd>
            <span>{{ infraComponentVersion.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponentVersion.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ infraComponentVersion.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponentVersion.infraComponent')"></span>
          </dt>
          <dd>
            <div v-if="infraComponentVersion.infraComponent">
              <router-link :to="{ name: 'InfraComponentView', params: { infraComponentId: infraComponentVersion.infraComponent.id } }">{{
                infraComponentVersion.infraComponent.name
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="infraComponentVersion.id"
          :to="{ name: 'InfraComponentVersionEdit', params: { infraComponentVersionId: infraComponentVersion.id } }"
          custom
          v-slot="{ navigate }"
        >
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./infra-component-version-details.component.ts"></script>
