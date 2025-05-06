<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="clientType">
        <h2 class="jh-entity-heading" data-cy="clientTypeDetailsHeading">
          <span v-text="t$('sdiFrontendApp.clientType.detail.title')"></span> {{ clientType.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.clientType.type')"></span>
          </dt>
          <dd>
            <span>{{ clientType.type }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientType.createDate')"></span>
          </dt>
          <dd>
            <span>{{ clientType.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientType.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ clientType.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientType.notes')"></span>
          </dt>
          <dd>
            <span>{{ clientType.notes }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="clientType.id"
          :to="{ name: 'ClientTypeEdit', params: { clientTypeId: clientType.id } }"
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

<script lang="ts" src="./client-type-details.component.ts"></script>
