<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="feature">
        <h2 class="jh-entity-heading" data-cy="featureDetailsHeading">
          <span v-text="t$('sdiFrontendApp.feature.detail.title')"></span> {{ feature.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.feature.name')"></span>
          </dt>
          <dd>
            <span>{{ feature.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.feature.apiVersion')"></span>
          </dt>
          <dd>
            <span>{{ feature.apiVersion }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.feature.description')"></span>
          </dt>
          <dd>
            <span>{{ feature.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.feature.createDate')"></span>
          </dt>
          <dd>
            <span>{{ feature.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.feature.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ feature.updateDate }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="feature.id" :to="{ name: 'FeatureEdit', params: { featureId: feature.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./feature-details.component.ts"></script>
