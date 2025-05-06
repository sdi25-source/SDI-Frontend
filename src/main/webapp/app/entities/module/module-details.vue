<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="module">
        <h2 class="jh-entity-heading" data-cy="moduleDetailsHeading">
          <span v-text="t$('sdiFrontendApp.module.detail.title')"></span> {{ module.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.module.name')"></span>
          </dt>
          <dd>
            <span>{{ module.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.module.description')"></span>
          </dt>
          <dd>
            <span>{{ module.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.module.createDate')"></span>
          </dt>
          <dd>
            <span>{{ module.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.module.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ module.updateDate }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="module.id" :to="{ name: 'ModuleEdit', params: { moduleId: module.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./module-details.component.ts"></script>
