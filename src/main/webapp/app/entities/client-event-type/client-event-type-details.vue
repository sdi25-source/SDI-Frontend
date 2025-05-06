<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="clientEventType">
        <h2 class="jh-entity-heading" data-cy="clientEventTypeDetailsHeading">
          <span v-text="t$('sdiFrontendApp.clientEventType.detail.title')"></span> {{ clientEventType.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEventType.type')"></span>
          </dt>
          <dd>
            <span>{{ clientEventType.type }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEventType.description')"></span>
          </dt>
          <dd>
            <span>{{ clientEventType.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEventType.createDate')"></span>
          </dt>
          <dd>
            <span>{{ clientEventType.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEventType.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ clientEventType.updateDate }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="clientEventType.id"
          :to="{ name: 'ClientEventTypeEdit', params: { clientEventTypeId: clientEventType.id } }"
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

<script lang="ts" src="./client-event-type-details.component.ts"></script>
