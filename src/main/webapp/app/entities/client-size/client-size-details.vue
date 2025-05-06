<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="clientSize">
        <h2 class="jh-entity-heading" data-cy="clientSizeDetailsHeading">
          <span v-text="t$('sdiFrontendApp.clientSize.detail.title')"></span> {{ clientSize.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.clientSize.sizeName')"></span>
          </dt>
          <dd>
            <span>{{ clientSize.sizeName }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientSize.sizeCode')"></span>
          </dt>
          <dd>
            <span>{{ clientSize.sizeCode }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientSize.sizeDescription')"></span>
          </dt>
          <dd>
            <span>{{ clientSize.sizeDescription }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientSize.createDate')"></span>
          </dt>
          <dd>
            <span>{{ clientSize.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientSize.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ clientSize.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientSize.notes')"></span>
          </dt>
          <dd>
            <span>{{ clientSize.notes }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="clientSize.id"
          :to="{ name: 'ClientSizeEdit', params: { clientSizeId: clientSize.id } }"
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

<script lang="ts" src="./client-size-details.component.ts"></script>
