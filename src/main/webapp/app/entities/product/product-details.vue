<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="product">
        <h2 class="jh-entity-heading" data-cy="productDetailsHeading">
          <span v-text="t$('sdiFrontendApp.product.detail.title')"></span> {{ product.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.product.name')"></span>
          </dt>
          <dd>
            <span>{{ product.name }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.product.logo')"></span>
          </dt>
          <dd>
            <span>{{ product.logo }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.product.description')"></span>
          </dt>
          <dd>
            <span>{{ product.description }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.product.createDate')"></span>
          </dt>
          <dd>
            <span>{{ product.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.product.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ product.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.product.productLine')"></span>
          </dt>
          <dd>
            <span v-for="(productLine, i) in product.productLines" :key="productLine.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'ProductLineView', params: { productLineId: productLine.id } }">{{ productLine.id }}</router-link>
            </span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.product.module')"></span>
          </dt>
          <dd>
            <span v-for="(module, i) in product.modules" :key="module.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'ModuleView', params: { moduleId: module.id } }">{{ module.id }}</router-link>
            </span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.product.infraComponentVersion')"></span>
          </dt>
          <dd>
            <span v-for="(infraComponentVersion, i) in product.infraComponentVersions" :key="infraComponentVersion.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }">{{
                infraComponentVersion.id
              }}</router-link>
            </span>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="product.id" :to="{ name: 'ProductEdit', params: { productId: product.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./product-details.component.ts"></script>
