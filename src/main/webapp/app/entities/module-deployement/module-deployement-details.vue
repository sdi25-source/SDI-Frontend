<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="moduleDeployement">
        <h2 class="jh-entity-heading" data-cy="moduleDeployementDetailsHeading">
          <span v-text="t$('sdiFrontendApp.moduleDeployement.detail.title')"></span> {{ moduleDeployement.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleDeployement.code')"></span>
          </dt>
          <dd>
            <span>{{ moduleDeployement.code }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleDeployement.notes')"></span>
          </dt>
          <dd>
            <span>{{ moduleDeployement.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleDeployement.createDate')"></span>
          </dt>
          <dd>
            <span>{{ moduleDeployement.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleDeployement.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ moduleDeployement.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleDeployement.moduleVersion')"></span>
          </dt>
          <dd>
            <div v-if="moduleDeployement.moduleVersion">
              <router-link :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleDeployement.moduleVersion.id } }">{{
                moduleDeployement.moduleVersion.version
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.moduleDeployement.productDeployementDetail')"></span>
          </dt>
          <dd>
            <div v-if="moduleDeployement.productDeployementDetail">
              <router-link
                :to="{
                  name: 'ProductDeployementDetailView',
                  params: { productDeployementDetailId: moduleDeployement.productDeployementDetail.id },
                }"
                >{{ moduleDeployement.productDeployementDetail.id }}</router-link
              >
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="moduleDeployement.id"
          :to="{ name: 'ModuleDeployementEdit', params: { moduleDeployementId: moduleDeployement.id } }"
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

<script lang="ts" src="./module-deployement-details.component.ts"></script>
