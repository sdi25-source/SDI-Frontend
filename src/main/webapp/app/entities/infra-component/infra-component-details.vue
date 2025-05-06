<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="infraComponent">
        <h2 class="jh-entity-heading" data-cy="infraComponentDetailsHeading">
          <span v-text="t$('sdiFrontendApp.infraComponent.detail.title')"></span> {{ infraComponent.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponent.name')"></span>
          </dt>
          <dd>
            <span>{{ infraComponent.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponent.vendor')"></span>
          </dt>
          <dd>
            <span>{{ infraComponent.vendor }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponent.notes')"></span>
          </dt>
          <dd>
            <span>{{ infraComponent.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponent.createDate')"></span>
          </dt>
          <dd>
            <span>{{ infraComponent.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.infraComponent.componentType')"></span>
          </dt>
          <dd>
            <div v-if="infraComponent.componentType">
              <router-link :to="{ name: 'ComponentTypeView', params: { componentTypeId: infraComponent.componentType.id } }">{{
                infraComponent.componentType.type
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="infraComponent.id"
          :to="{ name: 'InfraComponentEdit', params: { infraComponentId: infraComponent.id } }"
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

<script lang="ts" src="./infra-component-details.component.ts"></script>
