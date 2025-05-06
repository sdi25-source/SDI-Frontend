<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="deployementType">
        <h2 class="jh-entity-heading" data-cy="deployementTypeDetailsHeading">
          <span v-text="t$('sdiFrontendApp.deployementType.detail.title')"></span> {{ deployementType.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.deployementType.type')"></span>
          </dt>
          <dd>
            <span>{{ deployementType.type }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.deployementType.createDate')"></span>
          </dt>
          <dd>
            <span>{{ deployementType.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.deployementType.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ deployementType.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.deployementType.notes')"></span>
          </dt>
          <dd>
            <span>{{ deployementType.notes }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="deployementType.id"
          :to="{ name: 'DeployementTypeEdit', params: { deployementTypeId: deployementType.id } }"
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

<script lang="ts" src="./deployement-type-details.component.ts"></script>
