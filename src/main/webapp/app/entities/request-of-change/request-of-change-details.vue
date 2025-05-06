<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="requestOfChange">
        <h2 class="jh-entity-heading" data-cy="requestOfChangeDetailsHeading">
          <span v-text="t$('sdiFrontendApp.requestOfChange.detail.title')"></span> {{ requestOfChange.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.title')"></span>
          </dt>
          <dd>
            <span>{{ requestOfChange.title }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.keywords')"></span>
          </dt>
          <dd>
            <span>{{ requestOfChange.keywords }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.status')"></span>
          </dt>
          <dd>
            <span v-text="t$('sdiFrontendApp.RequestStatus.' + requestOfChange.status)"></span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.createDate')"></span>
          </dt>
          <dd>
            <span>{{ requestOfChange.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.description')"></span>
          </dt>
          <dd>
            <span>{{ requestOfChange.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.productVersion')"></span>
          </dt>
          <dd>
            <div v-if="requestOfChange.productVersion">
              <router-link :to="{ name: 'ProductVersionView', params: { productVersionId: requestOfChange.productVersion.id } }">{{
                requestOfChange.productVersion.version
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.client')"></span>
          </dt>
          <dd>
            <div v-if="requestOfChange.client">
              <router-link :to="{ name: 'ClientView', params: { clientId: requestOfChange.client.id } }">{{
                requestOfChange.client.code
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.moduleVersion')"></span>
          </dt>
          <dd>
            <span v-for="(moduleVersion, i) in requestOfChange.moduleVersions" :key="moduleVersion.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleVersion.id } }">{{
                moduleVersion.id
              }}</router-link>
            </span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.requestOfChange.customisationLevel')"></span>
          </dt>
          <dd>
            <div v-if="requestOfChange.customisationLevel">
              <router-link
                :to="{ name: 'CustomisationLevelView', params: { customisationLevelId: requestOfChange.customisationLevel.id } }"
                >{{ requestOfChange.customisationLevel.id }}</router-link
              >
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="requestOfChange.id"
          :to="{ name: 'RequestOfChangeEdit', params: { requestOfChangeId: requestOfChange.id } }"
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

<script lang="ts" src="./request-of-change-details.component.ts"></script>
