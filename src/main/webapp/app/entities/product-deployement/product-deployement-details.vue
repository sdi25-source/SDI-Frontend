<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="productDeployement">
        <h2 class="jh-entity-heading" data-cy="productDeployementDetailsHeading">
          <span v-text="t$('sdiFrontendApp.productDeployement.detail.title')"></span> {{ productDeployement.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployement.refContract')"></span>
          </dt>
          <dd>
            <span>{{ productDeployement.refContract }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployement.createDate')"></span>
          </dt>
          <dd>
            <span>{{ productDeployement.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployement.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ productDeployement.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployement.notes')"></span>
          </dt>
          <dd>
            <span>{{ productDeployement.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployement.client')"></span>
          </dt>
          <dd>
            <div v-if="productDeployement.client">
              <router-link :to="{ name: 'ClientView', params: { clientId: productDeployement.client.id } }">{{
                productDeployement.client.code
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="productDeployement.id"
          :to="{ name: 'ProductDeployementEdit', params: { productDeployementId: productDeployement.id } }"
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

<script lang="ts" src="./product-deployement-details.component.ts"></script>
