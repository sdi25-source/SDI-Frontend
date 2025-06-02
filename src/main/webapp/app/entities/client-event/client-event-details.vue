```vue
<template>
  <div class="row justify-content-center p-lg-5">
    <div class="col-12 p-5">
      <div v-if="clientEvent" class="">
        <div class="card-body p-0">
          <!-- Header avec bouton retour et nom de l'événement -->
          <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div class="d-flex align-items-center">
              <h2 class="client-name mb-0" data-cy="clientEventDetailsHeading">
                {{ clientEvent.event }}
              </h2>
            </div>
          </div>

          <!-- Event details in a modern grid -->
          <div class="row mb-4 p-lg-5">
            <div class="col-md-4 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.clientEvent.event')"></label>
                <p class="mb-0 fw-medium">{{ clientEvent.event }}</p>
              </div>
            </div>
            <div class="col-md-4 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.clientEvent.client')"></label>
                <p class="mb-0 fw-medium">
                  <router-link
                    v-if="clientEvent.client"
                    :to="{ name: 'ClientView', params: { clientId: clientEvent.client.id } }"
                    class="info-link"
                  >
                    {{ clientEvent.client.name }}
                  </router-link>
                  <span v-else>-</span>
                </p>
              </div>
            </div>
            <div class="col-md-4 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.clientEvent.clientEventType')"></label>
                <p class="mb-0 fw-medium">
                  <router-link
                    v-if="clientEvent.clientEventType"
                    :to="{ name: 'ClientEventTypeView', params: { clientEventTypeId: clientEvent.clientEventType.id } }"
                    class="info-link"
                  >
                    {{ clientEvent.clientEventType.type }}
                  </router-link>
                  <span v-else>-</span>
                </p>
              </div>
            </div>
            <div class="col-md-4 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.clientEvent.eventDate')"></label>
                <p class="mb-0 fw-medium">{{ clientEvent.eventDate }}</p>
              </div>
            </div>
            <div class="col-md-4 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.clientEvent.notes')"></label>
                <p class="mb-0 fw-medium">{{ clientEvent.notes || '-' }}</p>
              </div>
            </div>
          </div>

          <div class="mb-4 pb-3 pl-5">
            <label class="fw-bold mb-2" v-text="t$('sdiFrontendApp.clientEvent.description')"></label>
            <p class="mb-0 text-muted notes-content">{{ clientEvent.description }}</p>
          </div>

          <!-- Footer with action buttons -->
          <div class="modal-footer">
            <button type="button" class="button button-secondary" data-cy="entityDetailsBackButton" @click.prevent="previousState()">
              <font-awesome-icon icon="arrow-left"></font-awesome-icon>
              <span v-text="t$('entity.action.back')"></span>
            </button>
            <router-link
              v-if="clientEvent.id"
              :to="{ name: 'ClientEventEdit', params: { clientEventId: clientEvent.id } }"
              custom
              v-slot="{ navigate }"
            >
              <button @click="navigate" class="button button-primary" v-if="hasAnyAuthority('ROLE_COMMERCIAL')">
                <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                <span v-text="t$('entity.action.edit')"></span>
              </button>
            </router-link>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./client-event-details.component.ts"></script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.875rem;
}

.button-secondary {
  background-color: #6c757d;
  color: #fff;
}

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.button-primary:hover {
  background-color: #26538a;
}

/* Bouton retour */
.back-button {
  position: relative;
  padding: 12px;
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  margin-right: 1rem;
}

.back-button:hover {
  background-color: #e9ecef;
  transform: translateX(-2px);
}

/* Header avec nom de l'événement */
.client-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #012970;
  margin-bottom: 8px;
  line-height: 1.2;
}

/* Sections d'informations */
.detail-group {
  display: flex;
  flex-direction: column;
}

.text-muted {
  color: #6c757d !important;
}

.fw-medium {
  font-weight: 500;
}

/* Liens */
.info-link {
  color: #012970;
  text-decoration: none;
  font-weight: 500;
  transition: color 0.3s ease;
}

.info-link:hover {
  color: #4154f1;
  text-decoration: underline;
}

/* Section notes */
.notes-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 0;
}

/* Card styling */
.card {
  background-color: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
}

/* Modal footer */
.modal-footer {
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
  padding-top: 1rem;
  border-top: 1px solid #e2e8f0;
}

/* Responsive */
@media (max-width: 768px) {
  .client-name {
    font-size: 2rem;
  }

  .back-button {
    margin-right: 0.5rem;
  }

  .modal-footer {
    flex-direction: column;
    align-items: stretch;
  }

  .button-primary,
  .button-secondary {
    width: 100%;
  }
}

@media (max-width: 576px) {
  .client-name {
    font-size: 1.8rem;
  }

  .p-5 {
    padding: 1.5rem !important;
  }
}
</style>
```
