<template>
  <div class="row justify-content-center">
    <div class="col-12 p-5">
      <div v-if="client" class="card border-0">
        <div class="card-body p-0">
          <!-- User header with login and status -->
          <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <img
              v-if="client.clientLogo"
              :src="client.clientLogo"
              :alt="client.name + ' logo'"
              class="client-logo"
              width="100"
              height="100"
            />
            <span v-else>-</span>
          </div>

          <!-- User details in a modern grid -->
          <div class="row mb-4">
            <div class="col-md-6 mb-3">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.name')"></label>
                <p class="mb-0 fw-medium">{{ client.name }}</p>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.mainContactName')"></label>
                <p class="mb-0 fw-medium">{{ client.mainContactName }}</p>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.mainContactEmail')"></label>
                <p class="mb-0 fw-medium">{{ client.mainContactEmail }}</p>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.mainContactPhoneNumber')"></label>
                <p class="mb-0 fw-medium">{{ client.mainContactPhoneNumber }}</p>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.currentCardHolderNumber')"></label>
                <p class="mb-0 fw-medium">{{ client.currentCardHolderNumber }}</p>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.currentBruncheNumber')"></label>
                <p class="mb-0 fw-medium">{{ client.currentBruncheNumber }}</p>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.currentCustomersNumber')"></label>
                <p class="mb-0 fw-medium">{{ client.currentCustomersNumber }}</p>
              </div>
            </div>
            <div class="col-md-6 mb-3">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.url')"></label>
                <p class="mb-0 fw-medium">{{ client.url }}</p>
              </div>
            </div>
          </div>

          <!-- Notes section -->
          <div class="mb-4 pb-3 border-bottom">
            <label class="fw-bold mb-2" v-text="t$('sdiFrontendApp.client.notes')"></label>
            <p class="mb-0 text-muted">{{ client.notes }}</p>
          </div>

          <div class="mb-4 pb-3">
            <label class="fw-bold mb-2" v-text="t$('sdiFrontendApp.client.relatedInformation')"></label>
            <div class="row">
              <div class="col-md-4 mb-3">
                <div class="detail-group">
                  <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.country')"></label>
                  <p class="mb-0 fw-medium">
                    <router-link v-if="client.country" :to="{ name: 'CountryView', params: { countryId: client.country.id } }">
                      {{ client.country.countryname }}
                    </router-link>
                  </p>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="detail-group">
                  <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.size')"></label>
                  <p class="mb-0 fw-medium">
                    <router-link v-if="client.size" :to="{ name: 'ClientSizeView', params: { clientSizeId: client.size.id } }">
                      {{ client.size.sizeName }}
                    </router-link>
                  </p>
                </div>
              </div>
              <div class="col-md-4 mb-3">
                <div class="detail-group">
                  <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.clientType')"></label>
                  <p class="mb-0 fw-medium">
                    <router-link v-if="client.clientType" :to="{ name: 'ClientTypeView', params: { clientTypeId: client.clientType.id } }">
                      {{ client.clientType.type }}
                    </router-link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./client-details.component.ts"></script>

<style scoped>
.client-logo {
  max-width: 100px;
  max-height: 100px;
  object-fit: contain;
  border-radius: 4px;
}
.btn-color {
  background-color: var(--accent-color);
  border-color: var(--accent-color);
  color: var(--contrast-color);
}
</style>
