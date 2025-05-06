<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="hA">
        <h2 class="jh-entity-heading" data-cy="hADetailsHeading">
          <span v-text="t$('sdiFrontendApp.hA.detail.title')"></span> {{ hA.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.hA.name')"></span>
          </dt>
          <dd>
            <span>{{ hA.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.hA.createDate')"></span>
          </dt>
          <dd>
            <span>{{ hA.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.hA.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ hA.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.hA.notes')"></span>
          </dt>
          <dd>
            <span>{{ hA.notes }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="hA.id" :to="{ name: 'HAEdit', params: { hAId: hA.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./ha-details.component.ts"></script>
