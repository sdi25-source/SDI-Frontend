<template>
  <div class="row justify-content-center p-lg-5">
    <div class="col-12 p-5">
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-message">Client Report in Progress...</p>
      </div>

      <div v-if="client" class="card border-0">
        <div class="card-body p-0">
          <!-- Header avec bouton retour, nom client et logo -->
          <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div class="d-flex align-items-center">
              <h2 class="client-name mb-0">{{ client.name }}</h2>
            </div>
            <img v-if="client.clientLogo" :src="client.clientLogo" :alt="client.name + ' logo'" class="client-logo" />
            <span v-else class="text-muted">-</span>
          </div>

          <!-- User details in a modern grid -->
          <div class="row mb-4">
            <div class="col-md-3 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.mainContactName')"></label>
                <p class="mb-0 fw-medium">{{ client.mainContactName }}</p>
              </div>
            </div>
            <div class="col-md-3 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.mainContactEmail')"></label>
                <p class="mb-0 fw-medium">{{ client.mainContactEmail }}</p>
              </div>
            </div>
            <div class="col-md-3 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.mainContactPhoneNumber')"></label>
                <p class="mb-0 fw-medium">{{ client.mainContactPhoneNumber }}</p>
              </div>
            </div>
            <div class="col-md-3 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.createDate')"></label>
                <p class="mb-0 fw-medium">{{ client.createDate }}</p>
              </div>
            </div>
            <div class="col-md-3 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.currentCardHolderNumber')"></label>
                <p class="mb-0 fw-medium">{{ client.currentCardHolderNumber }}</p>
              </div>
            </div>
            <div class="col-md-3 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.currentBruncheNumber')"></label>
                <p class="mb-0 fw-medium">{{ client.currentBruncheNumber }}</p>
              </div>
            </div>
            <div class="col-md-3 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.currentCustomersNumber')"></label>
                <p class="mb-0 fw-medium">{{ client.currentCustomersNumber }}</p>
              </div>
            </div>
            <div class="col-md-3 mb-3 pb-2">
              <div class="detail-group">
                <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.url')"></label>
                <p>
                  <a :href="client.url" target="_blank" class="mb-0 fw-medium text-decoration-none text-break">
                    {{ client.url }}
                    <i class="ms-1 fas fa-external-link-alt"></i>
                  </a>
                </p>
              </div>
            </div>
          </div>

          <div class="border-bottom">
            <div class="row mb-5">
              <div class="col-md-3 mb-3 pb-2">
                <div class="detail-group">
                  <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.size')"></label>
                  <p class="mb-0 fw-medium">
                    {{ client.size?.sizeName }}
                  </p>
                </div>
              </div>
              <div class="col-md-3 mb-3 pb-2">
                <div class="detail-group">
                  <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.clientType')"></label>
                  <p class="mb-0 fw-medium">
                    {{ client.clientType?.type }}
                  </p>
                </div>
              </div>
              <div class="col-md-3 mb-3 pb-2">
                <div class="detail-group">
                  <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.country')"></label>
                  <p class="mb-0 fw-medium">
                    {{ client.country?.countryFlag }} {{ client.country?.countryname }}
                  </p>
                </div>
              </div>
              <div class="col-md-3 mb-3 pb-2">
                <div class="detail-group">
                  <label class="text-muted small mb-1" v-text="t$('sdiFrontendApp.client.address')"></label>
                  <p class="mb-0 fw-medium">{{ client.address }}</p>
                </div>
              </div>
            </div>
          </div>

          <!-- Notes section - SECTION MODIFIÉE POUR AFFICHER LE HTML FORMATÉ -->
          <div class="mb-4 pb-3 mt-4">
            <label class="fw-bold mb-2" v-text="t$('sdiFrontendApp.client.notes')"></label>
            <div class="notes-content" v-html="client.notes || 'Aucune note disponible'"></div>
          </div>

          <!-- Modal Footer with Buttons -->
          <div class="modal-footer">
            <button type="submit" @click.prevent="previousState()" class="button button-secondary" data-cy="entityDetailsBackButton">
              <font-awesome-icon icon="arrow-left"></font-awesome-icon> <span v-text="t$('entity.action.back')"></span>
            </button>
            <router-link
              v-if="client.id && hasAnyAuthority('ROLE_COMMERCIAL')"
              :to="{ name: 'ClientEdit', params: { clientId: client.id } }"
              custom
              v-slot="{ navigate }"
            >
              <button @click="navigate" class="button button-primary">
                <font-awesome-icon icon="pencil-alt"></font-awesome-icon> <span v-text="t$('entity.action.edit')"></span>
              </button>
            </router-link>
            <button v-if="client.id" @click="generateReport" class="button button-primary" :disabled="isLoading">
              <i class="bi bi-file-pdf"></i> <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF Modal -->
    <div v-if="showPdfModal" class="pdf-modal">
      <div class="pdf-modal-content">
        <div class="pdf-modal-header">
          <h5>Customer Report</h5>
          <button @click="closePdfModal" class="close-button">×</button>
        </div>
        <div class="pdf-modal-body">
          <iframe v-if="pdfUrl" :src="pdfUrl" class="pdf-iframe"></iframe>
          <p v-else>Loading PDF...</p>
        </div>
        <div class="pdf-modal-footer">
          <button @click="downloadPdf" class="button button-primary">
            <font-awesome-icon icon="download"></font-awesome-icon> Download PDF
          </button>
          <button @click="closePdfModal" class="button button-secondary">Close</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./client-details.component.ts"></script>

<style scoped>
/* Loading Indicator Styles */
.loading-overlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(255, 255, 255, 0.8);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.loading-spinner {
  border: 4px solid #f3f3f3;
  border-top: 4px solid #0c2d57;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: spin 1s linear infinite;
}

.loading-message {
  margin-top: 1rem;
  font-size: 1rem;
  font-weight: 500;
  color: #0c2d57;
}

@keyframes spin {
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
}

/* Existing styles (unchanged) */
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

/* PDF Modal Styles */
.pdf-modal {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.pdf-modal-content {
  background-color: #fff;
  border-radius: 8px;
  width: 90%;
  max-width: 1200px;
  max-height: 700vh;
  display: flex;
  flex-direction: column;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.pdf-modal-header {
  padding: 1rem;
  border-bottom: 1px solid #e2e8f0;
  display: flex;
  justify-content: space-between;
  align-items: center;
}

.pdf-modal-header h5 {
  margin: 0;
  font-size: 1.25rem;
  font-weight: 600;
}

.close-button {
  background: none;
  border: none;
  font-size: 1.5rem;
  cursor: pointer;
}

.pdf-modal-body {
  flex: 1;
  padding: 1rem;
  overflow: auto;
}

.pdf-iframe {
  width: 100%;
  height: 600px;
  border: none;
}

.pdf-modal-footer {
  padding: 1rem;
  border-top: 1px solid #e2e8f0;
  display: flex;
  justify-content: flex-end;
  gap: 1rem;
}

/* Bouton retour */
.back-button {
  position: absolute;
  left: 0;
  top: 0;
  padding: 12px;
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  z-index: 10;
}

.back-button:hover {
  background-color: #e9ecef;
  transform: translateX(-2px);
}

/* Header avec nom client et logo */
.client-header {
  position: relative;
  padding-top: 60px; /* Espace pour le bouton retour */
}

.client-name-section {
  flex: 1;
}

.client-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #012970;
  margin-bottom: 8px;
  line-height: 1.2;
}

.client-subtitle {
  font-size: 1.1rem;
  font-weight: 400;
}

.client-logo-section {
  flex-shrink: 0;
  margin-left: 2rem;
}

.client-logo {
  width: 120px;
  height: 120px;
  object-fit: contain;
  border-radius: 12px;
  border: 2px solid #e2e8f0;
  background-color: #fff;
  padding: 8px;
}

.logo-placeholder {
  width: 120px;
  height: 120px;
  border: 2px dashed #e2e8f0;
  border-radius: 12px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #f8f9fa;
}

/* Sections d'informations */
.info-section {
  margin-bottom: 2.5rem;
}

.section-title {
  font-size: 1.4rem;
  font-weight: 600;
  color: #012970;
  margin-bottom: 1.5rem;
  padding-bottom: 0.5rem;
  border-bottom: 2px solid #e2e8f0;
}

/* Cartes d'informations */
.info-card {
  background-color: #f8f9fa;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 1.5rem;
  height: 100%;
  transition: all 0.3s ease;
}

.info-card:hover {
  background-color: #fff;
  border-color: #012970;
  transform: translateY(-2px);
  box-shadow: 0 4px 12px rgba(1, 41, 112, 0.1);
}

.stats-card {
  background: linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%);
}

.info-label {
  font-size: 0.85rem;
  font-weight: 600;
  color: #6c757d;
  text-transform: uppercase;
  letter-spacing: 0.5px;
  margin-bottom: 0.5rem;
  display: block;
}

.info-value {
  font-size: 1.1rem;
  font-weight: 500;
  color: #333;
  margin-bottom: 0;
  word-break: break-word;
}

.stats-number {
  font-size: 1.8rem;
  font-weight: 700;
  color: #012970;
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

.url-link {
  color: #0d83fd;
  text-decoration: none;
  font-weight: 500;
}

.url-link:hover {
  text-decoration: underline;
}

/* Section notes - STYLES AMÉLIORÉS POUR LE CONTENU FORMATÉ */
.notes-card {
  background-color: #fff;
  border: 1px solid #e2e8f0;
  border-radius: 10px;
  padding: 2rem;
  border-left: 4px solid #012970;
}

.notes-content {
  font-size: 1rem;
  line-height: 1.6;
  color: #555;
  margin-bottom: 0;
  min-height: 1.5rem;
}

/* Styles pour le contenu HTML formaté dans les notes */
.notes-content h1,
.notes-content h2,
.notes-content h3 {
  color: #012970;
  margin-top: 1rem;
  margin-bottom: 0.5rem;
}

.notes-content h1 {
  font-size: 1.5rem;
  font-weight: 700;
}

.notes-content h2 {
  font-size: 1.3rem;
  font-weight: 600;
}

.notes-content h3 {
  font-size: 1.1rem;
  font-weight: 600;
}

.notes-content p {
  margin-bottom: 0.75rem;
}

.notes-content strong,
.notes-content b {
  font-weight: 600;
  color: #333;
}

.notes-content em,
.notes-content i {
  font-style: italic;
}

.notes-content u {
  text-decoration: underline;
}

.notes-content ul,
.notes-content ol {
  margin-left: 1.5rem;
  margin-bottom: 0.75rem;
}

.notes-content li {
  margin-bottom: 0.25rem;
}

.notes-content a {
  color: #0d83fd;
  text-decoration: none;
}

.notes-content a:hover {
  text-decoration: underline;
}

.notes-content code {
  background-color: #f1f5f9;
  padding: 2px 4px;
  border-radius: 3px;
  font-family: 'Courier New', monospace;
  font-size: 0.9rem;
}

.notes-content img {
  max-width: 100%;
  height: auto;
  border-radius: 4px;
  margin: 0.5rem 0;
}

/* Responsive */
@media (max-width: 768px) {
  .client-header {
    flex-direction: column;
    align-items: center;
    text-align: center;
    gap: 1.5rem;
  }

  .client-name {
    font-size: 2rem;
  }

  .client-logo-section {
    margin-left: 0;
  }

  .client-logo,
  .logo-placeholder {
    width: 200px;
    height: 200px;
  }

  .back-button {
    left: 15px;
    top: 15px;
  }

  .client-header {
    padding-top: 70px;
  }
}

@media (max-width: 576px) {
  .client-name {
    font-size: 1.8rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .info-card {
    padding: 1rem;
  }

  .stats-number {
    font-size: 1.5rem;
  }
}
</style>
