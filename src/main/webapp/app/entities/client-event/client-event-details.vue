<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="clientEvent">
        <h2 class="jh-entity-heading" data-cy="clientEventDetailsHeading">
          <span v-text="t$('sdiFrontendApp.clientEvent.detail.title')"></span> {{ clientEvent.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEvent.event')"></span>
          </dt>
          <dd>
            <span>{{ clientEvent.event }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEvent.description')"></span>
          </dt>
          <dd>
            <span>{{ clientEvent.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEvent.eventDate')"></span>
          </dt>
          <dd>
            <span>{{ clientEvent.eventDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEvent.notes')"></span>
          </dt>
          <dd>
            <span>{{ clientEvent.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEvent.client')"></span>
          </dt>
          <dd>
            <div v-if="clientEvent.client">
              <router-link :to="{ name: 'ClientView', params: { clientId: clientEvent.client.id } }">{{
                clientEvent.client.code
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientEvent.clientEventType')"></span>
          </dt>
          <dd>
            <div v-if="clientEvent.clientEventType">
              <router-link :to="{ name: 'ClientEventTypeView', params: { clientEventTypeId: clientEvent.clientEventType.id } }">{{
                clientEvent.clientEventType.type
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="clientEvent.id"
          :to="{ name: 'ClientEventEdit', params: { clientEventId: clientEvent.id } }"
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

<script lang="ts" src="./client-event-details.component.ts"></script>
