<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="moduleVersion">
        <h2 class="jh-entity-heading" data-cy="moduleVersionDetailsHeading">
          <span v-text="t$('sdiFrontendApp.moduleVersion.detail.title')"></span> {{ moduleVersion.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleVersion.version')"></span>
          </dt>
          <dd>
            <span>{{ moduleVersion.version }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleVersion.createDate')"></span>
          </dt>
          <dd>
            <span>{{ moduleVersion.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleVersion.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ moduleVersion.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleVersion.notes')"></span>
          </dt>
          <dd>
            <span>{{ moduleVersion.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleVersion.module')"></span>
          </dt>
          <dd>
            <div v-if="moduleVersion.module">
              <router-link :to="{ name: 'ModuleView', params: { moduleId: moduleVersion.module.id } }">{{
                moduleVersion.module.name
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleVersion.feature')"></span>
          </dt>
          <dd>
            <span v-for="(feature, i) in moduleVersion.features" :key="feature.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'FeatureView', params: { featureId: feature.id } }">{{ feature.id }}</router-link>
            </span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleVersion.domaine')"></span>
          </dt>
          <dd>
            <div v-if="moduleVersion.domaine">
              <router-link :to="{ name: 'DomaineView', params: { domaineId: moduleVersion.domaine.id } }">{{
                moduleVersion.domaine.name
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleVersion.root')"></span>
          </dt>
          <dd>
            <div v-if="moduleVersion.root">
              <router-link :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleVersion.root.id } }">{{
                moduleVersion.root.id
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="moduleVersion.id"
          :to="{ name: 'ModuleVersionEdit', params: { moduleVersionId: moduleVersion.id } }"
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

<script lang="ts" src="./module-version-details.component.ts"></script>
