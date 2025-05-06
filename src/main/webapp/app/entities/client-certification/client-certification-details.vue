<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="clientCertification">
        <h2 class="jh-entity-heading" data-cy="clientCertificationDetailsHeading">
          <span v-text="t$('sdiFrontendApp.clientCertification.detail.title')"></span> {{ clientCertification.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.clientCertification.certification')"></span>
          </dt>
          <dd>
            <span>{{ clientCertification.certification }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientCertification.certificationDate')"></span>
          </dt>
          <dd>
            <span>{{ clientCertification.certificationDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientCertification.createDate')"></span>
          </dt>
          <dd>
            <span>{{ clientCertification.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientCertification.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ clientCertification.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientCertification.notes')"></span>
          </dt>
          <dd>
            <span>{{ clientCertification.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientCertification.client')"></span>
          </dt>
          <dd>
            <div v-if="clientCertification.client">
              <router-link :to="{ name: 'ClientView', params: { clientId: clientCertification.client.id } }">{{
                clientCertification.client.code
              }}</router-link>
            </div>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.clientCertification.certif')"></span>
          </dt>
          <dd>
            <div v-if="clientCertification.certif">
              <router-link :to="{ name: 'CertificationView', params: { certificationId: clientCertification.certif.id } }">{{
                clientCertification.certif.name
              }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link
          v-if="clientCertification.id"
          :to="{ name: 'ClientCertificationEdit', params: { clientCertificationId: clientCertification.id } }"
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

<script lang="ts" src="./client-certification-details.component.ts"></script>
