<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <div v-if="country">
        <h2 class="jh-entity-heading" data-cy="countryDetailsHeading">
          <span v-text="t$('sdiFrontendApp.country.detail.title')"></span> {{ country.id }}
        </h2>
        <dl class="row jh-entity-details">
          <dt>
            <span v-text="t$('sdiFrontendApp.country.countryname')"></span>
          </dt>
          <dd>
            <span>{{ country.countryname }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.country.countryCode')"></span>
          </dt>
          <dd>
            <span>{{ country.countryCode }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.country.countryFlag')"></span>
          </dt>
          <dd>
            <span>{{ country.countryFlag }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.country.notes')"></span>
          </dt>
          <dd>
            <span>{{ country.notes }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.country.createDate')"></span>
          </dt>
          <dd>
            <span>{{ country.createDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.country.updateDate')"></span>
          </dt>
          <dd>
            <span>{{ country.updateDate }}</span>
          </dd>
          <dt>
            <span v-text="t$('sdiFrontendApp.country.region')"></span>
          </dt>
          <dd>
            <div v-if="country.region">
              <router-link :to="{ name: 'RegionView', params: { regionId: country.region.id } }">{{ country.region.name }}</router-link>
            </div>
          </dd>
        </dl>
        <button type="submit" @click.prevent="previousState()" class="btn btn-info" data-cy="entityDetailsBackButton">
          <font-awesome-icon icon="arrow-left"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.back')"></span>
        </button>
        <router-link v-if="country.id" :to="{ name: 'CountryEdit', params: { countryId: country.id } }" custom v-slot="{ navigate }">
          <button @click="navigate" class="btn btn-primary">
            <font-awesome-icon icon="pencil-alt"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.edit')"></span>
          </button>
        </router-link>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./country-details.component.ts"></script>
