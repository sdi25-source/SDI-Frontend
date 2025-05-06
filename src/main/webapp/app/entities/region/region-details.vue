<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="region">
        <h2 class="jh-entity-heading" data-cy="regionDetailsHeading">
          <span v-text="t$('sdiFrontendApp.region.detail.title')"></span> {{ region.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.region.name')"></span>
          </dt>
          <dd>
            <span>{{ region.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.region.createDate')"></span>
          </dt>
          <dd>
            <span>{{ region.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.region.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ region.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.region.notes')"></span>
          </dt>
          <dd>
            <span>{{ region.notes }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="region.id" :to="{ name: 'RegionEdit', params: { regionId: region.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./region-details.component.ts"></script>
