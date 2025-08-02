<template>
  <div class="row justify-content-center p-lg-5">
    <div class="col-12 p-5">
      <!-- Loading Indicator -->
      <div v-if="isLoading" class="loading-overlay">
        <div class="loading-spinner"></div>
        <p class="loading-message">Loading Deployment Detail...</p>
      </div>

      <div v-if="deploymentDetail" class="card border-0">
        <div class="card-body p-0">
          <!-- Header avec nom du déploiement et badges -->
          <div class="d-flex justify-content-between align-items-center mb-4 pb-3 border-bottom">
            <div class="d-flex align-items-center">
              <h2 class="deployment-name mb-0">{{ deploymentDetail.notes || 'Deployment Detail' }}</h2>
            </div>
            <div class="d-flex align-items-center gap-2">
              <span class="badge badge-primary" v-if="deploymentDetail.productVersion">
                v{{ deploymentDetail.productVersion.version }}
              </span>
              <span class="badge badge-dark" v-if="deploymentDetail.deployementType">
                {{ deploymentDetail.deployementType.type }}
              </span>
              <span :class="getStatusBadgeClass()">{{ getDeploymentStatus() }}</span>
            </div>
          </div>

          <!-- Informations principales dans une grille moderne -->
          <div class="info-section mb-4">
            <h3 class="section-title">Deployment Information</h3>
            <div class="row mb-4">
              <div class="col-md-3 mb-3">
                <div class="info-card">
                  <label class="info-label">Product Deployment</label>
                  <p class="info-value">{{ deploymentDetail.productDeployement?.refContract || 'N/A' }}</p>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="info-card">
                  <label class="info-label">Client</label>
                  <p class="info-value">{{ clientName || 'N/A' }}</p>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="info-card">
                  <label class="info-label">Product</label>
                  <p class="info-value">{{ productName || 'N/A' }}</p>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="info-card">
                  <label class="info-label">Deployment Type</label>
                  <p class="info-value">
                    <span class="badge badge-dark">{{ deploymentDetail.deployementType?.type || 'N/A' }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section des dates et version -->
          <div class="info-section mb-4">
            <h3 class="section-title">Timeline & Version</h3>
            <div class="row mb-4">
              <div class="col-md-3 mb-3">
                <div class="info-card">
                  <label class="info-label">Start Date</label>
                  <p class="info-value">{{ formatDate(deploymentDetail.startDeployementDate) }}</p>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="info-card">
                  <label class="info-label">End Date</label>
                  <p class="info-value">{{ formatDate(deploymentDetail.endDeployementDate) }}</p>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="info-card">
                  <label class="info-label">Product Version</label>
                  <p class="info-value">
                    <span class="badge badge-secondary">{{ deploymentDetail.productVersion?.version || 'N/A' }}</span>
                  </p>
                </div>
              </div>
              <div class="col-md-3 mb-3">
                <div class="info-card stats-card">
                  <label class="info-label">Status</label>
                  <p class="info-value">
                    <span :class="getStatusBadgeClass()">{{ getDeploymentStatus() }}</span>
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Section des modules autorisés -->
          <div class="info-section mb-4" v-if="deploymentDetail.allowedModuleVersions && deploymentDetail.allowedModuleVersions.length > 0">
            <h3 class="section-title">Authorized Modules</h3>
            <div class="row">
              <div class="col-md-4 mb-3" v-for="moduleVersion in deploymentDetail.allowedModuleVersions" :key="moduleVersion.id">
                <div class="module-card info-card">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="module-name mb-0">{{ getModuleName(moduleVersion) }}</h6>
                    <span class="badge badge-primary">{{ moduleVersion.version }}</span>
                  </div>
                  <div class="module-details" v-if="moduleVersion.module">
                    <small class="text-muted">{{ moduleVersion.module.description || 'No description available' }}</small>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section des composants d'infrastructure -->
          <div class="info-section mb-4" v-if="infraComponents && infraComponents.length > 0">
            <h3 class="section-title">Infrastructure Components</h3>
            <div class="row">
              <div class="col-md-4 mb-3" v-for="infraComponent in infraComponents" :key="infraComponent.id">
                <div class="infra-card info-card">
                  <div class="d-flex justify-content-between align-items-center mb-2">
                    <h6 class="infra-name mb-0">{{ infraComponent.infraComponent?.name || 'N/A' }}</h6>
                    <span class="badge badge-dark">{{ infraComponent.version }}</span>
                  </div>
                  <div class="infra-details">
                    <small class="text-muted d-block">{{ infraComponent.infraComponent?.type || 'Unknown type' }}</small>
                    <p class="small mt-1 mb-0">{{ infraComponent.infraComponent?.description || 'No description available' }}</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <!-- Section notes -->
          <div class="info-section mb-4" v-if="deploymentDetail.notes">
            <h3 class="section-title">Notes</h3>
            <div class="notes-card">
              <div class="notes-content" v-html="deploymentDetail.notes || 'No notes available'"></div>
            </div>
          </div>

          <!-- Footer avec boutons -->
          <div class="modal-footer">
            <button type="submit" @click.prevent="previousState()" class="button button-secondary" data-cy="entityDetailsBackButton">
              <font-awesome-icon icon="arrow-left"></font-awesome-icon>
              <span>Back</span>
            </button>
            <router-link
              v-if="deploymentDetail.id"
              :to="{ name: 'ProductDeployementDetailEdit', params: { productDeployementDetailId: deploymentDetail.id } }"
              custom
              v-slot="{ navigate }"
            >
              <button @click="navigate" class="button button-primary">
                <font-awesome-icon icon="pencil-alt"></font-awesome-icon>
                <span>Edit</span>
              </button>
            </router-link>
            <button v-if="deploymentDetail.id" @click="generateReport" class="button button-primary" :disabled="isLoading">
              <i class="bi bi-file-pdf"></i>
              <span>Generate Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- PDF Modal -->
    <div v-if="showPdfModal" class="pdf-modal">
      <div class="pdf-modal-content">
        <div class="pdf-modal-header">
          <h5>Deployment Detail Report</h5>
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

<script lang="ts" src="./product-deployement-detail-view.component.ts"></script>

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

/* Button styles */
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
  gap: 0.5rem;
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

/* Header styles */
.deployment-name {
  font-size: 2.5rem;
  font-weight: 700;
  color: #012970;
  margin-bottom: 8px;
  line-height: 1.2;
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

/* Badge styles */
.badge {
  padding: 0.25em 0.6em;
  font-size: 75%;
  font-weight: 700;
  border-radius: 0.25rem;
}

.badge-primary {
  background-color: #007bff;
  color: white;
}

.badge-secondary {
  background-color: #6c757d;
  color: white;
}

.badge-dark {
  background-color: #343a40;
  color: white;
}

.badge-success {
  background-color: #28a745;
  color: white;
}

.badge-warning {
  background-color: #ffc107;
  color: #212529;
}

.badge-danger {
  background-color: #dc3545;
  color: white;
}

/* Module cards */
.module-card {
  border-left: 4px solid #007bff;
}

.module-name {
  font-size: 1rem;
  font-weight: 600;
  color: #012970;
}

.module-details {
  margin-top: 0.5rem;
}

/* Infrastructure cards */
.infra-card {
  border-left: 4px solid #343a40;
}

.infra-name {
  font-size: 1rem;
  font-weight: 600;
  color: #012970;
}

.infra-details {
  margin-top: 0.5rem;
}

/* Section notes */
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
  max-height: 70vh;
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

/* Responsive */
@media (max-width: 768px) {
  .deployment-name {
    font-size: 2rem;
  }

  .section-title {
    font-size: 1.2rem;
  }

  .info-card {
    padding: 1rem;
  }
}

@media (max-width: 576px) {
  .deployment-name {
    font-size: 1.8rem;
  }

  .info-card {
    padding: 1rem;
  }

  .info-value {
    font-size: 1rem;
  }
}
</style>
