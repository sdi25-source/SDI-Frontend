<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="customisationLevel">
        <h2 class="jh-entity-heading" data-cy="customisationLevelDetailsHeading">
          <span v-text="t$('sdiFrontendApp.customisationLevel.detail.title')"></span> {{ customisationLevel.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.customisationLevel.level')"></span>
          </dt>
          <dd>
            <span>{{ customisationLevel.level }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.customisationLevel.createDate')"></span>
          </dt>
          <dd>
            <span>{{ customisationLevel.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.customisationLevel.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ customisationLevel.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.customisationLevel.notes')"></span>
          </dt>
          <dd>
            <span>{{ customisationLevel.notes }}</span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="customisationLevel.id"
          :to="{ name: 'CustomisationLevelEdit', params: { customisationLevelId: customisationLevel.id } }"
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

<script lang="ts" src="./customisation-level-details.component.ts"></script>
