<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="productVersion">
        <h2 class="jh-entity-heading" data-cy="productVersionDetailsHeading">
          <span v-text="t$('sdiFrontendApp.productVersion.detail.title')"></span> {{ productVersion.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.version')"></span>
          </dt>
          <dd>
            <span>{{ productVersion.version }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.createDate')"></span>
          </dt>
          <dd>
            <span>{{ productVersion.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ productVersion.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.notes')"></span>
          </dt>
          <dd>
            <span>{{ productVersion.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.product')"></span>
          </dt>
          <dd>
            <div v-if="productVersion.product">
              <router-link :to="{ name: 'ProductView', params: { productId: productVersion.product.id } }">{{
                productVersion.product.name
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.moduleVersion')"></span>
          </dt>
          <dd>
            <span v-for="(moduleVersion, i) in productVersion.moduleVersions" :key="moduleVersion.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'ModuleVersionView', params: { moduleVersionId: moduleVersion.id } }">{{
                moduleVersion.id
              }}</router-link>
            </span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.infraComponentVersion')"></span>
          </dt>
          <dd>
            <span v-for="(infraComponentVersion, i) in productVersion.infraComponentVersions" :key="infraComponentVersion.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }">{{
                infraComponentVersion.id
              }}</router-link>
            </span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.ha')"></span>
          </dt>
          <dd>
            <div v-if="productVersion.ha">
              <router-link :to="{ name: 'HAView', params: { hAId: productVersion.ha.id } }">{{ productVersion.ha.name }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productVersion.root')"></span>
          </dt>
          <dd>
            <div v-if="productVersion.root">
              <router-link :to="{ name: 'ProductVersionView', params: { productVersionId: productVersion.root.id } }">{{
                productVersion.root.id
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="productVersion.id"
          :to="{ name: 'ProductVersionEdit', params: { productVersionId: productVersion.id } }"
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

<script lang="ts" src="./product-version-details.component.ts"></script>
