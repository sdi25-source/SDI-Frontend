<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="featureDeployement">
        <h2 class="jh-entity-heading" data-cy="featureDeployementDetailsHeading">
          <span v-text="t$('sdiFrontendApp.featureDeployement.detail.title')"></span> {{ featureDeployement.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.featureDeployement.code')"></span>
          </dt>
          <dd>
            <span>{{ featureDeployement.code }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.featureDeployement.createDate')"></span>
          </dt>
          <dd>
            <span>{{ featureDeployement.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.featureDeployement.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ featureDeployement.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.featureDeployement.notes')"></span>
          </dt>
          <dd>
            <span>{{ featureDeployement.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.featureDeployement.feature')"></span>
          </dt>
          <dd>
            <div v-if="featureDeployement.feature">
              <router-link :to="{ name: 'FeatureView', params: { featureId: featureDeployement.feature.id } }">{{
                featureDeployement.feature.id
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.featureDeployement.moduleDeployement')"></span>
          </dt>
          <dd>
            <div v-if="featureDeployement.moduleDeployement">
              <router-link
                :to="{ name: 'ModuleDeployementView', params: { moduleDeployementId: featureDeployement.moduleDeployement.id } }"
                >{{ featureDeployement.moduleDeployement.code }}</router-link
              >
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="featureDeployement.id"
          :to="{ name: 'FeatureDeployementEdit', params: { featureDeployementId: featureDeployement.id } }"
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

<script lang="ts" src="./feature-deployement-details.component.ts"></script>
