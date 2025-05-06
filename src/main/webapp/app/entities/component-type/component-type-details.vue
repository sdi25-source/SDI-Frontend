<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="componentType">
        <h2 class="jh-entity-heading" data-cy="componentTypeDetailsHeading">
          <span v-text="t$('sdiFrontendApp.componentType.detail.title')"></span> {{ componentType.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.componentType.type')"></span>
          </dt>
          <dd>
            <span>{{ componentType.type }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="componentType.id"
          :to="{ name: 'ComponentTypeEdit', params: { componentTypeId: componentType.id } }"
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

<script lang="ts" src="./component-type-details.component.ts"></script>
