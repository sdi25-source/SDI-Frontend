<template>
  <div class="mt-5">
    <!-- Modal Backdrop -->
    <div class="modal-backdrop" v-if="isOpen" @click="closeModal"></div>

    <!-- Modal Container -->
    <div class="modal-container" v-if="isOpen" role="dialog" aria-modal="true">
      <div class="modal-content modal-body scrollable-form">
        <!-- Modal Header -->
        <div class="modal-header">
          <h5 class="modal-title">
            <span v-if="currentStep === 1">Product data verification</span>
            <span v-else-if="currentStep === 2">Product version configuration</span>
            <span v-else-if="currentStep === 3">Product modules version</span>
            <span v-else>Resume and confirmation</span>
          </h5>
          <button type="button" class="close-button" @click="closeModal" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <!-- Error Message if data is missing -->
        <div v-if="!isDataValid" class="alert alert-danger m-4">
          <p class="mb-0">
            <strong>Erreur :</strong> Unable to create a new version of the product. The necessary data is missing or incomplete.
          </p>
          <button class="btn btn-outline-danger mt-3" @click="closeModal">Close</button>
        </div>

        <!-- Content only shown if data is valid -->
        <div v-if="isDataValid">
          <!-- Progress Steps -->
          <div class="progress-steps">
            <div
              v-for="step in 4"
              :key="step"
              class="step"
              :class="{
                active: step === currentStep,
                completed: step < currentStep,
              }"
            >
              <div class="step-circle">
                <span v-if="step < currentStep">✓</span>
                <span v-else>{{ step }}</span>
              </div>
              <div class="step-label">
                {{ getStepLabel(step) }}
              </div>
            </div>
          </div>

          <!-- Modal Body -->
          <div class="modal-body">
            <!-- Step 1: Product Version Information -->
            <div v-if="currentStep === 1" class="step-content">
              <h6 class="section-title">Product information</h6>
              <div class="form-group">
                <label for="version">Version</label>
                <input type="text" id="version" class="form-control" v-model="newProductVersion.version" />
                <small class="form-text text-muted">Automatically generated version</small>
              </div>

              <div class="form-group">
                <label for="root">Basic product version</label>
                <select id="root" class="form-control" v-model="newProductVersion.root" disabled>
                  <option :value="null">None</option>
                  <option v-for="version in availableRootVersions" :key="version.id" :value="version">
                    {{ version.product?.name }} - {{ version.version }}
                  </option>
                </select>
              </div>

              <div class="form-group">
                <label for="notes">Notes</label>
                <textarea
                  id="notes"
                  class="form-control"
                  v-model="newProductVersion.notes"
                  rows="3"
                  placeholder="Notes sur cette version"
                ></textarea>
              </div>
            </div>

            <!-- Step 2: Configuration -->
            <div v-if="currentStep === 2" class="step-content">
              <h6 class="section-title">Configuration</h6>
              <div class="card mb-3">
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">Infrastructure components</h6>
                  <button class="btn btn-sm btn-primary" @click="showInfraSelector = !showInfraSelector">
                    {{ showInfraSelector ? 'Close' : 'Add' }}
                  </button>
                </div>
                <div class="card-body">
                  <div v-if="showInfraSelector" class="mb-3 p-3 border rounded">
                    <div class="form-group">
                      <label for="infraComponent">Select a component</label>
                      <div class="d-flex">
                        <select id="infraComponent" class="form-control mr-2" v-model="selectedInfraComponentId">
                          <option value="">Select a component</option>
                          <option v-for="component in availableInfraComponents" :key="component.id" :value="component.id">
                            {{ component.infraComponent?.name }} ({{ component.version }})
                          </option>
                        </select>
                        <button class="btn btn-success" @click="addInfraComponent" :disabled="!selectedInfraComponentId">Ajouter</button>
                      </div>
                    </div>
                  </div>

                  <div v-if="newProductVersion.infraComponentVersions && newProductVersion.infraComponentVersions.length > 0">
                    <ul class="list-group">
                      <li
                        v-for="(component, index) in newProductVersion.infraComponentVersions"
                        :key="index"
                        class="list-group-item d-flex justify-content-between align-items-center"
                      >
                        <div>
                          <span class="font-weight-bold">{{
                            getIfraComponentVersionWithInfraCached(component.id)?.infraComponent.name
                          }}</span>
                          <span class="text-muted ml-2">{{ component.version }}</span>
                        </div>
                        <button class="btn btn-sm btn-outline-danger" @click="removeInfraComponent(index)">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            width="20"
                            height="20"
                            fill="currentColor"
                            class="bi bi-x"
                            viewBox="0 0 16 16"
                          >
                            <path
                              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                              fill="currentColor"
                            />
                          </svg>
                        </button>
                      </li>
                    </ul>
                  </div>
                  <div v-else class="alert alert-info">No selected infrastructure component</div>
                </div>
              </div>
            </div>

            <!-- Step 3: Module Versions -->
            <div v-if="currentStep === 3" class="step-content">
              <h6 class="section-title">Modules Version</h6>
              <!-- Modules list -->
              <div
                v-for="(moduleVersion, index) in newProductVersion.moduleVersions"
                :key="index"
                class="card mb-3"
                :class="{ 'border-success': isNewlyCreatedModule(moduleVersion) }"
              >
                <div class="card-header d-flex justify-content-between align-items-center">
                  <h6 class="mb-0">
                    {{ moduleVersion.module?.name }}
                    <span v-if="isNewlyCreatedModule(moduleVersion)" class="badge badge-success ml-2" title="Nouvelle version du module">
                      New version
                    </span>
                  </h6>
                  <div>
                    <!-- Boutons pour les nouveaux modules -->
                    <button
                      v-if="isNewlyCreatedModule(moduleVersion)"
                      class="btn btn-sm btn-outline-info mr-2"
                      @click="toggleFeaturesVisibility(index)"
                    >
                      {{ moduleVersionsUIState[index]?.showFeatures ? 'Hide features' : 'View features' }}
                    </button>
                    <button v-if="isNewlyCreatedModule(moduleVersion)" class="btn btn-sm btn-primary mr-2" @click="toggleEditMode(index)">
                      {{ moduleVersionsUIState[index]?.isEditing ? 'To end' : 'Update' }}
                    </button>
                    <!-- Bouton Supprimer pour les modules non inclus dans request.moduleVersions -->
                    <button
                      v-if="!isNewlyCreatedModule(moduleVersion)"
                      class="btn btn-sm btn-outline-danger"
                      @click="removeModuleVersion(index)"
                      title=""
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="20"
                        height="20"
                        fill="currentColor"
                        class="bi bi-x"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                          fill="currentColor"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <div class="form-group">
                        <label>Version</label>
                        <input
                          type="text"
                          class="form-control"
                          v-model="moduleVersion.version"
                          :readonly="!isNewlyCreatedModule(moduleVersion) || !moduleVersionsUIState[index]?.isEditing"
                          :disabled="!isNewlyCreatedModule(moduleVersion) || !moduleVersionsUIState[index]?.isEditing"
                        />
                      </div>
                    </div>
                    <div class="col-md-6">
                      <div class="form-group">
                        <select
                          class="form-control"
                          v-model="moduleVersion.root"
                          :disabled="!isNewlyCreatedModule(moduleVersion) || !moduleVersionsUIState[index]?.isEditing"
                          hidden
                        >
                          <option :value="null">None</option>
                          <option
                            v-for="version in getAvailableModuleVersions(moduleVersion.module?.id)"
                            :key="version.id"
                            :value="version"
                          >
                            {{ version.version }}
                          </option>
                        </select>
                      </div>
                    </div>
                  </div>
                  <div class="form-group">
                    <label>Description</label>
                    <textarea
                      class="form-control"
                      v-model="moduleVersion.notes"
                      rows="2"
                      :readonly="!isNewlyCreatedModule(moduleVersion) || !moduleVersionsUIState[index]?.isEditing"
                      :disabled="!isNewlyCreatedModule(moduleVersion) || !moduleVersionsUIState[index]?.isEditing"
                    ></textarea>
                  </div>

                  <!-- Features Section -->
                  <div v-if="isNewlyCreatedModule(moduleVersion) && moduleVersionsUIState[index]?.showFeatures" class="mt-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="mb-0">Features</h6>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="showAddFeature(moduleVersion)"
                        :disabled="!moduleVersionsUIState[index]?.isEditing"
                      >
                        Add a feature
                      </button>
                    </div>

                    <div class="features-container border rounded p-3">
                      <div v-if="moduleVersion.features && moduleVersion.features.length > 0">
                        <div
                          v-for="(feature, featureIndex) in moduleVersion.features"
                          :key="featureIndex"
                          class="feature-item mb-2 p-2 border rounded"
                        >
                          <div class="d-flex justify-content-between align-items-center">
                            <div class="font-weight-bold">{{ feature.name }}</div>
                            <button
                              class="btn btn-sm btn-outline-danger"
                              @click="removeFeature(moduleVersion, featureIndex)"
                              :disabled="!moduleVersionsUIState[index]?.isEditing"
                            >
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="16"
                                height="16"
                                fill="currentColor"
                                class="bi bi-trash"
                                viewBox="0 0 16 16"
                              >
                                <path
                                  d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"
                                />
                                <path
                                  fill-rule="evenodd"
                                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                />
                              </svg>
                            </button>
                          </div>
                          <div class="text-muted small">{{ feature.description }}</div>
                        </div>
                      </div>
                      <div v-else class="text-muted">No Feature</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Summary and Confirmation -->
            <div v-if="currentStep === 4" class="step-content">
              <h6 class="section-title">Summary and confirmation</h6>
              <p class="mb-3">Please check the following information before creating the new product version.</p>

              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Product version information</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>Version:</strong> {{ newProductVersion.version }}</p>
                    </div>
                    <div class="col-md-6">
                      <p><strong>Date of creation:</strong> {{ formatDate(newProductVersion.createDate) }}</p>
                      <p><strong>Notes:</strong> {{ newProductVersion.notes || 'Aucune' }}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Configuration</h6>
                </div>
                <div class="card-body">
                  <div v-if="newProductVersion.infraComponentVersions && newProductVersion.infraComponentVersions.length > 0">
                    <ul class="list-group">
                      <li v-for="(component, index) in newProductVersion.infraComponentVersions" :key="index" class="list-group-item">
                        <span class="font-weight-bold">{{ getIfraComponentVersionWithInfraCached(component.id)?.infraComponent.name }}</span>
                        <span class="text-muted ml-2">{{ component.version }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-else class="alert alert-info">No selected infrastructure component</div>
                </div>
              </div>

              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Modules version</h6>
                </div>
                <div class="card-body">
                  <div v-if="newProductVersion.moduleVersions && newProductVersion.moduleVersions.length > 0">
                    <div v-for="(moduleVersion, index) in newProductVersion.moduleVersions" :key="index" class="mb-3 pb-3 border-bottom">
                      <h6>
                        {{ moduleVersion.module?.name }}
                        <span v-if="isNewlyCreatedModule(moduleVersion)" class="badge badge-success ml-2"> New version </span>
                      </h6>
                      <div class="row">
                        <div class="col-md-6">
                          <p><strong>Version:</strong> {{ moduleVersion.version }}</p>
                        </div>
                      </div>
                      <div v-if="isNewlyCreatedModule(moduleVersion) && moduleVersion.features && moduleVersion.features.length > 0">
                        <h6 class="mt-2">Features:</h6>
                        <ul>
                          <li v-for="(feature, featureIndex) in moduleVersion.features" :key="featureIndex">
                            {{ feature.name }} - {{ feature.description || 'No description' }}
                          </li>
                        </ul>
                      </div>
                    </div>
                  </div>
                  <div v-else class="alert alert-info">No selected module</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button v-if="currentStep > 1" type="button" class="btn btn-outline-secondary" @click="prevStep">Previous</button>
            <button v-if="currentStep < 4" type="button" class="btn btn-primary" @click="nextStep">Next</button>
            <button v-if="currentStep === 4" type="button" class="btn btn-success" @click="saveNewProductVersion">Confirm</button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Feature Modal -->
    <div class="modal-backdrop" v-if="showAddFeatureModal" @click="showAddFeatureModal = false"></div>
    <div class="modal-container" v-if="showAddFeatureModal" role="dialog" aria-modal="true">
      <div class="modal-content shadow-lg" style="max-width: 500px; max-height: 400px; margin-left: 200px">
        <div class="modal-header">
          <h5 class="modal-title">Add Feature</h5>
          <button type="button" class="close-button" @click="showAddFeatureModal = false" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
              class="icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>
        <div class="modal-body">
          <div class="form-group">
            <label for="featureName">Name</label>
            <input type="text" id="featureName" class="form-control" v-model="newFeature.name" placeholder="feature name" />
          </div>

          <div class="form-group">
            <label for="featureDescription">Description</label>
            <textarea
              id="featureDescription"
              class="form-control"
              v-model="newFeature.description"
              rows="3"
              placeholder="feature description"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="showAddFeatureModal = false">Cancel</button>
          <button type="button" class="btn btn-primary" @click="addFeature" :disabled="!newFeature.name">Save</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./new-product-version.component.ts"></script>

<style scoped>
.scrollable-form {
  max-height: 70vh;
  overflow-y: auto;
  padding-right: 1rem;
}
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  width: 90%;
  max-width: 900px;
  max-height: 90vh;
  display: flex;
  flex-direction: column;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1.25rem 1.5rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.close-button {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.close-button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.5rem;
  overflow-y: auto;
  flex: 1;
}

.modal-footer {
  padding: 1.25rem 1.5rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.progress-steps {
  display: flex;
  justify-content: space-between;
  margin: 0 1.5rem;
  padding: 1.5rem 0;
  position: relative;
}

.progress-steps::before {
  content: '';
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  height: 2px;
  background-color: #e2e8f0;
  z-index: 1;
}

.step {
  display: flex;
  flex-direction: column;
  align-items: center;
  position: relative;
  z-index: 2;
}

.step-circle {
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background-color: #f1f5f9;
  border: 2px solid #e2e8f0;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  margin-bottom: 0.5rem;
  color: #64748b;
  transition: all 0.3s ease;
}

.step.active .step-circle {
  background-color: #0c2d57;
  border-color: #0c2d57;
  color: white;
}

.step.completed .step-circle {
  background-color: #10b981;
  border-color: #10b981;
  color: white;
}

.step-label {
  font-size: 0.875rem;
  color: #64748b;
  font-weight: 500;
}

.step.active .step-label,
.step.completed .step-label {
  color: #0f172a;
}

.section-title {
  font-size: 1.125rem;
  font-weight: 600;
  margin-bottom: 1.25rem;
  color: #0f172a;
}

.step-content {
  margin-bottom: 1.5rem;
}

.form-group {
  margin-bottom: 1.25rem;
}

.form-group label {
  display: block;
  margin-bottom: 0.5rem;
  font-weight: 500;
  color: #334155;
}

.form-control {
  display: block;
  width: 100%;
  padding: 0.5rem 0.75rem;
  font-size: 0.875rem;
  line-height: 1.5;
  color: #0f172a;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid #cbd5e1;
  border-radius: 0.375rem;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-control:focus {
  border-color: #0c2d57;
  outline: 0;
  box-shadow: 0 0 0 3px rgba(12, 45, 87, 0.1);
}

.form-control:disabled,
.form-control[readonly] {
  background-color: #f8fafc;
  opacity: 1;
}

.form-text {
  display: block;
  margin-top: 0.25rem;
  font-size: 0.75rem;
  color: #64748b;
}

.btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 0.5rem 1rem;
  font-size: 0.875rem;
  font-weight: 500;
  line-height: 1.5;
  text-align: center;
  white-space: nowrap;
  vertical-align: middle;
  cursor: pointer;
  user-select: none;
  border: 1px solid transparent;
  border-radius: 0.375rem;
  transition:
    color 0.15s ease-in-out,
    background-color 0.15s ease-in-out,
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.btn-primary {
  color: #fff;
  background-color: #0c2d57;
  border-color: #0c2d57;
}

.btn-primary:hover {
  background-color: #0a2548;
  border-color: #0a2548;
}

.btn-outline-primary {
  color: #0c2d57;
  border-color: #0c2d57;
  background-color: transparent;
}

.btn-outline-primary:hover {
  color: #fff;
  background-color: #0c2d57;
  border-color: #0c2d57;
}

.btn-success {
  color: #fff;
  background-color: #10b981;
  border-color: #10b981;
}

.btn-success:hover {
  background-color: #0ea271;
  border-color: #0ea271;
}

.btn-outline-secondary {
  color: #64748b;
  border-color: #cbd5e1;
  background-color: transparent;
}

.btn-outline-secondary:hover {
  color: #334155;
  background-color: #f1f5f9;
  border-color: #cbd5e1;
}

.btn-outline-danger {
  color: #ef4444;
  border-color: #ef4444;
  background-color: transparent;
}

.btn-outline-danger:hover {
  color: #fff;
  background-color: #ef4444;
  border-color: #ef4444;
}

.btn-danger {
  color: #fff;
  background-color: #ef4444;
  border-color: #ef4444;
}

.btn-danger:hover {
  background-color: #dc2626;
  border-color: #dc2626;
}

.btn:disabled {
  opacity: 0.65;
  pointer-events: none;
}

.card {
  position: relative;
  display: flex;
  flex-direction: column;
  min-width: 0;
  word-wrap: break-word;
  background-color: #fff;
  background-clip: border-box;
  border: 1px solid #e2e8f0;
  border-radius: 0.5rem;
  overflow: hidden;
}

.card-header {
  padding: 1rem 1.25rem;
  margin-bottom: 0;
  background-color: #f8fafc;
  border-bottom: 1px solid #e2e8f0;
}

.card-body {
  flex: 1 1 auto;
  padding: 1.25rem;
}

.list-group {
  display: flex;
  flex-direction: column;
  padding-left: 0;
  margin-bottom: 0;
  border-radius: 0.5rem;
}

.list-group-item {
  position: relative;
  display: block;
  padding: 0.75rem 1.25rem;
  background-color: #fff;
  border: 1px solid #e2e8f0;
}

.list-group-item:first-child {
  border-top-left-radius: inherit;
  border-top-right-radius: inherit;
}

.list-group-item:last-child {
  border-bottom-right-radius: inherit;
  border-bottom-left-radius: inherit;
}

.list-group-item + .list-group-item {
  border-top-width: 0;
}

.badge {
  display: inline-block;
  padding: 0.25em 0.4em;
  font-size: 75%;
  font-weight: 700;
  line-height: 1;
  text-align: center;
  white-space: nowrap;
  vertical-align: baseline;
  border-radius: 0.25rem;
}

.badge-success {
  color: #fff;
  background-color: #10b981;
}

.badge-warning {
  color: #000;
  background-color: #fbbf24;
}

.alert {
  position: relative;
  padding: 0.75rem 1.25rem;
  margin-bottom: 1rem;
  border: 1px solid transparent;
  border-radius: 0.375rem;
}

.alert-info {
  color: #0c5460;
  background-color: #d1ecf1;
  border-color: #bee5eb;
}

.alert-warning {
  color: #856404;
  background-color: #fff3cd;
  border-color: #ffeeba;
}

.alert-danger {
  color: #721c24;
  background-color: #f8d7da;
  border-color: #f5c6cb;
}

.features-container {
  max-height: 200px;
  overflow-y: auto;
}

.feature-item {
  transition: background-color 0.2s ease;
}

.feature-item:hover {
  background-color: #f8fafc;
}

.border-success {
  border-color: #10b981 !important;
  border-width: 2px !important;
}

.border-warning {
  border-color: #fbbf24 !important;
  border-width: 2px !important;
}

@media (max-width: 768px) {
  .progress-steps {
    margin: 0 1rem;
  }

  .step-label {
    font-size: 0.75rem;
  }

  .step-circle {
    width: 30px;
    height: 30px;
    font-size: 0.875rem;
  }
}
</style>
