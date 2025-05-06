<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="productDeployementDetail">
        <h2 class="jh-entity-heading" data-cy="productDeployementDetailDetailsHeading">
          <span v-text="t$('sdiFrontendApp.productDeployementDetail.detail.title')"></span> {{ productDeployementDetail.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.startDeployementDate')"></span>
          </dt>
          <dd>
            <span>{{ productDeployementDetail.startDeployementDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.endDeployementDate')"></span>
          </dt>
          <dd>
            <span>{{ productDeployementDetail.endDeployementDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.notes')"></span>
          </dt>
          <dd>
            <span>{{ productDeployementDetail.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.productDeployement')"></span>
          </dt>
          <dd>
            <div v-if="productDeployementDetail.productDeployement">
              <router-link
                :to="{ name: 'ProductDeployementView', params: { productDeployementId: productDeployementDetail.productDeployement.id } }"
                >{{ productDeployementDetail.productDeployement.refContract }}</router-link
              >
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.infraComponentVersion')"></span>
          </dt>
          <dd>
            <span v-for="(infraComponentVersion, i) in productDeployementDetail.infraComponentVersions" :key="infraComponentVersion.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'InfraComponentVersionView', params: { infraComponentVersionId: infraComponentVersion.id } }">{{
                infraComponentVersion.id
              }}</router-link>
            </span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.allowedModuleVersion')"></span>
          </dt>
          <dd>
            <span v-for="(allowedModuleVersion, i) in productDeployementDetail.allowedModuleVersions" :key="allowedModuleVersion.id"
              >{{ i > 0 ? ', ' : '' }}
              <router-link :to="{ name: 'ModuleVersionView', params: { moduleVersionId: allowedModuleVersion.id } }">{{
                allowedModuleVersion.id
              }}</router-link>
            </span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.productVersion')"></span>
          </dt>
          <dd>
            <div v-if="productDeployementDetail.productVersion">
              <router-link :to="{ name: 'ProductVersionView', params: { productVersionId: productDeployementDetail.productVersion.id } }">{{
                productDeployementDetail.productVersion.version
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.productDeployementDetail.deployementType')"></span>
          </dt>
          <dd>
            <div v-if="productDeployementDetail.deployementType">
              <router-link
                :to="{ name: 'DeployementTypeView', params: { deployementTypeId: productDeployementDetail.deployementType.id } }"
                >{{ productDeployementDetail.deployementType.type }}</router-link
              >
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="productDeployementDetail.id"
          :to="{ name: 'ProductDeployementDetailEdit', params: { productDeployementDetailId: productDeployementDetail.id } }"
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

<script lang="ts" src="./product-deployement-detail-details.component.ts"></script>
