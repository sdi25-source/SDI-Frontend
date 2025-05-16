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
            <span v-if="currentStep === 1">Vérification des données du produit</span>
            <span v-else-if="currentStep === 2">Configuration du produit</span>
            <span v-else-if="currentStep === 3">Modules du produit</span>
            <span v-else>Résumé et confirmation</span>
          </h5>
          <button type="button" class="close-button" @click="closeModal" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
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
            <strong>Erreur :</strong> Impossible de créer une nouvelle version du produit. Les données nécessaires sont manquantes ou
            incomplètes.
          </p>
          <button class="btn btn-outline-danger mt-3" @click="closeModal">Fermer</button>
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
              <h6 class="section-title">Informations du produit</h6>
              <div class="form-group">
                <label for="version">Version</label>
                <input type="text" id="version" class="form-control" v-model="newProductVersion.version" readonly />
                <small class="form-text text-muted">Version générée automatiquement</small>
              </div>

              <div class="form-group">
                <label for="root">Version racine</label>
                <select id="root" class="form-control" v-model="newProductVersion.root" disabled>
                  <option :value="null">Aucune</option>
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
                  <h6 class="mb-0">Composants d'infrastructure</h6>
                  <!--                  <button class="btn btn-sm btn-primary" @click="showInfraSelector = !showInfraSelector">-->
                  <!--                    {{ showInfraSelector ? 'Fermer' : 'Ajouter' }}-->
                  <!--                  </button>-->
                </div>
                <div class="card-body">
                  <div v-if="showInfraSelector" class="mb-3 p-3 border rounded">
                    <div class="form-group">
                      <label for="infraComponent">Sélectionner un composant</label>
                      <div class="d-flex">
                        <select id="infraComponent" class="form-control mr-2" v-model="selectedInfraComponentId">
                          <option value="">Sélectionner un composant</option>
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
                          <span class="font-weight-bold">{{ component.infraComponent?.name }}</span>
                          <span class="text-muted ml-2">{{ component.version }}</span>
                        </div>
                        <!--                        <button class="btn btn-sm btn-outline-danger" @click="removeInfraComponent(index)">-->
                        <!--                          <svg-->
                        <!--                            xmlns="http://www.w3.org/2000/svg"-->
                        <!--                            width="16"-->
                        <!--                            height="16"-->
                        <!--                            fill="currentColor"-->
                        <!--                            class="bi bi-trash"-->
                        <!--                            viewBox="0 0 16 16"-->
                        <!--                          >-->
                        <!--                            <path-->
                        <!--                              d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"-->
                        <!--                            />-->
                        <!--                            <path-->
                        <!--                              fillRule="evenodd"-->
                        <!--                              d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"-->
                        <!--                            />-->
                        <!--                          </svg>-->
                        <!--                        </button>-->
                      </li>
                    </ul>
                  </div>
                  <div v-else class="alert alert-info">Aucun composant d'infrastructure sélectionné</div>
                </div>
              </div>
            </div>

            <!-- Step 3: Module Versions -->
            <div v-if="currentStep === 3" class="step-content">
              <h6 class="section-title">Modules</h6>
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
                      Nouvelle version
                    </span>
                  </h6>
                  <!--                  <div>-->
                  <!--                    <button-->
                  <!--                      v-if="isNewlyCreatedModule(moduleVersion)"-->
                  <!--                      class="btn btn-sm btn-outline-info mr-2"-->
                  <!--                      @click="toggleFeaturesVisibility(index)"-->
                  <!--                    >-->
                  <!--                      {{ moduleVersionsUIState[index]?.showFeatures ? 'Masquer features' : 'Voir features' }}-->
                  <!--                    </button>-->
                  <!--                    <button v-if="isNewlyCreatedModule(moduleVersion)" class="btn btn-sm btn-primary mr-2" @click="toggleEditMode(index)">-->
                  <!--                      {{ moduleVersionsUIState[index]?.isEditing ? 'Terminer' : 'Modifier' }}-->
                  <!--                    </button>-->
                  <!--                  </div>-->
                </div>
                <div class="card-body">
                  <div class="row">
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
                    <div class="col-md-6">
                      <div class="form-group">
                        <select
                          class="form-control"
                          v-model="moduleVersion.root"
                          :disabled="!isNewlyCreatedModule(moduleVersion) || !moduleVersionsUIState[index]?.isEditing"
                          hidden="true"
                        >
                          <option :value="null">Aucune</option>
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

                  <!-- Features Section - s'affiche uniquement pour les nouvelles versions de modules -->
                  <div v-if="isNewlyCreatedModule(moduleVersion) && moduleVersionsUIState[index]?.showFeatures" class="mt-4">
                    <div class="d-flex justify-content-between align-items-center mb-3">
                      <h6 class="mb-0">Fonctionnalités</h6>
                      <button
                        class="btn btn-sm btn-outline-primary"
                        @click="showAddFeature(moduleVersion)"
                        :disabled="!moduleVersionsUIState[index]?.isEditing"
                      >
                        Ajouter une fonctionnalité
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
                                  fillRule="evenodd"
                                  d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"
                                />
                              </svg>
                            </button>
                          </div>
                          <div class="text-muted small">{{ feature.description }}</div>
                        </div>
                      </div>
                      <div v-else class="text-muted">Aucune fonctionnalité</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <!-- Step 4: Summary and Confirmation -->
            <div v-if="currentStep === 4" class="step-content">
              <h6 class="section-title">Résumé et confirmation</h6>
              <p class="mb-3">Veuillez vérifier les informations suivantes avant de créer la nouvelle version du produit.</p>

              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Informations du produit</h6>
                </div>
                <div class="card-body">
                  <div class="row">
                    <div class="col-md-6">
                      <p><strong>Version:</strong> {{ newProductVersion.version }}</p>
                      <!--                      <p>-->
                      <!--                        <strong>Version racine:</strong>-->
                      <!--                        {{-->
                      <!--                          newProductVersion.root ? `${newProductVersion.root.product?.name} - ${newProductVersion.root.version}` : 'Aucune'-->
                      <!--                        }}-->
                      <!--                      </p>-->
                    </div>
                    <div class="col-md-6">
                      <p><strong>Date de création:</strong> {{ formatDate(newProductVersion.createDate) }}</p>
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
                        <span class="font-weight-bold">{{ component.infraComponent?.name }}</span>
                        <span class="text-muted ml-2">{{ component.version }}</span>
                      </li>
                    </ul>
                  </div>
                  <div v-else class="alert alert-info">Aucun composant d'infrastructure sélectionné</div>
                </div>
              </div>

              <div class="card mb-3">
                <div class="card-header">
                  <h6 class="mb-0">Modules</h6>
                </div>
                <div class="card-body">
                  <div v-if="newProductVersion.moduleVersions && newProductVersion.moduleVersions.length > 0">
                    <div v-for="(moduleVersion, index) in newProductVersion.moduleVersions" :key="index" class="mb-3 pb-3 border-bottom">
                      <h6>
                        {{ moduleVersion.module?.name }}
                        <span v-if="isNewlyCreatedModule(moduleVersion)" class="badge badge-success ml-2"> Nouvelle version </span>
                      </h6>
                      <div class="row">
                        <div class="col-md-6">
                          <p><strong>Version:</strong> {{ moduleVersion.version }}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                  <div v-else class="alert alert-info">Aucun module sélectionné</div>
                </div>
              </div>
            </div>
          </div>

          <!-- Modal Footer -->
          <div class="modal-footer">
            <button v-if="currentStep > 1" type="button" class="btn btn-outline-secondary" @click="prevStep">Précédent</button>
            <button v-if="currentStep < 4" type="button" class="btn btn-primary" @click="nextStep">Suivant</button>
            <button v-if="currentStep === 4" type="button" class="btn btn-success" @click="saveNewProductVersion">
              Créer la nouvelle version
            </button>
          </div>
        </div>
      </div>
    </div>

    <!-- Add Feature Modal -->
    <div class="modal-backdrop" v-if="showAddFeatureModal" @click="showAddFeatureModal = false"></div>
    <div class="modal-container" v-if="showAddFeatureModal" role="dialog" aria-modal="true">
      <div class="modal-content" style="max-width: 500px">
        <!--        <div class="modal-header">-->
        <!--          <h5 class="modal-title">Ajouter une fonctionnalité</h5>-->
        <!--          <button type="button" class="close-button" @click="showAddFeatureModal = false" aria-label="Fermer">-->
        <!--            <svg-->
        <!--              xmlns="http://www.w3.org/2000/svg"-->
        <!--              width="24"-->
        <!--              height="24"-->
        <!--              viewBox="0 0 24 24"-->
        <!--              fill="none"-->
        <!--              stroke="currentColor"-->
        <!--              strokeWidth="2"-->
        <!--              strokeLinecap="round"-->
        <!--              strokeLinejoin="round"-->
        <!--              class="icon"-->
        <!--            >-->
        <!--              <line x1="18" y1="6" x2="6" y2="18"></line>-->
        <!--              <line x1="6" y1="6" x2="18" y2="18"></line>-->
        <!--            </svg>-->
        <!--          </button>-->
        <!--        </div>-->
        <div class="modal-body">
          <div class="form-group">
            <label for="featureName">Nom</label>
            <input type="text" id="featureName" class="form-control" v-model="newFeature.name" placeholder="Nom de la fonctionnalité" />
          </div>

          <div class="form-group">
            <label for="featureDescription">Description</label>
            <textarea
              id="featureDescription"
              class="form-control"
              v-model="newFeature.description"
              rows="3"
              placeholder="Description de la fonctionnalité"
            ></textarea>
          </div>
        </div>
        <div class="modal-footer">
          <button type="button" class="btn btn-outline-secondary" @click="showAddFeatureModal = false">Annuler</button>
          <button type="button" class="btn btn-primary" @click="addFeature" :disabled="!newFeature.name">Ajouter</button>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import type { PropType } from 'vue';
import { defineComponent, ref, reactive, computed, watch } from 'vue';
import type { IRequestOfChange } from '@/shared/model/request-of-change.model';
import type { IProductVersion } from '@/shared/model/product-version.model';
import type { IModuleVersion } from '@/shared/model/module-version.model';
import type { IFeature } from '@/shared/model/feature.model';
import type { IInfraComponentVersion } from '@/shared/model/infra-component-version.model';
import type { IModule } from '@/shared/model/module.model';
import ProductVersionService from '@/entities/product-version/product-version.service';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import ModuleService from '@/entities/module/module.service';
import FeatureService from '@/entities/feature/feature.service';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  name: 'NewProductVersionPopup',
  props: {
    isOpen: {
      type: Boolean,
      required: true,
    },
    requestOfChange: {
      type: Object as PropType<IRequestOfChange>,
      required: false,
      default: null,
    },
  },
  emits: ['close', 'product-created'],
  setup(props, { emit }) {
    // Services
    const productVersionService = new ProductVersionService();
    const moduleVersionService = new ModuleVersionService();
    const moduleService = new ModuleService();
    const featureService = new FeatureService();
    const infraComponentVersionService = new InfraComponentVersionService();
    const alertService = useAlertService();

    // State
    const currentStep = ref(1);
    const showInfraSelector = ref(false);
    const showAddFeatureModal = ref(false);
    const selectedInfraComponentId = ref('');
    const selectedModuleForFeature = ref<IModuleVersion | null>(null);
    const availableInfraComponents = ref<IInfraComponentVersion[]>([]);
    const availableModules = ref<IModule[]>([]);
    const availableModuleVersions = ref<IModuleVersion[]>([]);
    const availableRootVersions = ref<IProductVersion[]>([]);
    const dataInitialized = ref(false);
    const newlyCreatedModuleIds = ref<number[]>([]);

    // UI state pour les modules (séparé des données du modèle)
    const moduleVersionsUIState = ref<{ [index: number]: { isEditing: boolean; showFeatures: boolean } }>({});

    // Check if data is valid
    const isDataValid = computed(() => {
      if (!props.requestOfChange) return false;
      if (!props.requestOfChange.productVersion) return false;
      if (!props.requestOfChange.productVersion.product) return false;
      return true;
    });

    // New items
    const newFeature = reactive({
      name: '',
      description: '',
      apiVersion: '',
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
    });

    // Initialize new product version with default values
    const newProductVersion = reactive<IProductVersion>({
      version: '',
      createDate: new Date().toISOString(),
      updateDate: new Date().toISOString(),
      notes: '',
      product: null,
      moduleVersions: [],
      infraComponentVersions: [],
      root: null,
    });

    // Watch for changes in the request of change and isOpen
    watch(
      [() => props.requestOfChange, () => props.isOpen],
      ([newRequest, isOpen]) => {
        if (isOpen && newRequest && !dataInitialized.value) {
          initializeFromRequest(newRequest);
        }
      },
      { immediate: true },
    );

    // Initialize data from request of change
    const initializeFromRequest = async (request: IRequestOfChange) => {
      if (!isDataValid.value) {
        console.warn('Request data is invalid, cannot initialize');
        return;
      }

      try {
        // Reset state
        currentStep.value = 1;
        newlyCreatedModuleIds.value = [];
        moduleVersionsUIState.value = {};

        // Generate version number based on client name and product version
        if (request.client && request.client.name && request.productVersion && request.productVersion.version) {
          newProductVersion.version = `${request.client.name}_${request.productVersion.version}`;
        } else {
          newProductVersion.version = `New_Version_${new Date().toISOString().slice(0, 10)}`;
        }

        // Set product from request
        if (request.productVersion && request.productVersion.product) {
          newProductVersion.product = request.productVersion.product;
        }

        // Set root version
        if (request.productVersion) {
          newProductVersion.root = request.productVersion;
        }

        // Copy notes
        if (request.productVersion && request.productVersion.notes) {
          newProductVersion.notes = request.productVersion.notes;
        } else {
          newProductVersion.notes = '';
        }

        // Copy infrastructure components
        if (request.productVersion && request.productVersion.infraComponentVersions) {
          newProductVersion.infraComponentVersions = [...request.productVersion.infraComponentVersions];
        } else {
          newProductVersion.infraComponentVersions = [];
        }

        // Fetch available data before processing modules
        await fetchAvailableData();

        // Préparer les modules versions
        if (request.productVersion && request.productVersion.moduleVersions) {
          // Afficher un indicateur de chargement
          const loadingMessage = alertService.showInfo('Création des nouvelles versions de modules...', { variant: 'info', timeout: 0 });

          try {
            // Récupérer tous les moduleVersions du productVersion existant
            const existingModuleVersions = [...request.productVersion.moduleVersions];

            // Déterminer les modules qui sont dans la demande de changement
            // Utiliser module.id au lieu de mv.id pour la comparaison
            const moduleIdsInRequest = request.moduleVersions?.map(mv => mv.id).filter(id => id !== undefined) || [];
            console.log('Modules IDs dans la demande de changement:', moduleIdsInRequest);

            // Tableau pour stocker les nouveaux moduleVersions
            const newModuleVersions: IModuleVersion[] = [];

            // Traiter chaque moduleVersion existant
            for (const moduleVersion of existingModuleVersions) {
              // Vérifier si ce module est dans la demande de changement
              // Comparer avec module.id au lieu de moduleVersion.id
              const isInRequest = moduleIdsInRequest.includes(moduleVersion.id);

              if (isInRequest) {
                // Créer une nouvelle version pour ce module
                console.log(`Création d'une nouvelle version pour le module ${moduleVersion.name}`);

                // Générer le nouveau nom de version avec le préfixe client
                let newVersionName = '';
                if (request.client && request.client.name) {
                  newVersionName = `${request.client.name}_${moduleVersion.version}`;
                } else {
                  newVersionName = `New_${moduleVersion.version}`;
                }
                // Créer d'abord les features si nécessaire
                let savedFeatures: IFeature[] = [];
                if (moduleVersion.features && moduleVersion.features.length > 0) {
                  for (const feature of moduleVersion.features) {
                    // Si la feature a déjà un ID, on la garde telle quelle
                    if (feature.id) {
                      savedFeatures.push(feature);
                      continue;
                    }

                    // Sinon, on la sauvegarde dans la base de données
                    const featureToSave = {
                      name: feature.name,
                      description: feature.description || '',
                      apiVersion: feature.apiVersion || '',
                      createDate: new Date().toISOString(),
                      updateDate: new Date().toISOString(),
                    };

                    try {
                      const savedFeature = await featureService.create(featureToSave);
                      savedFeatures.push(savedFeature);
                    } catch (error) {
                      console.error(`Erreur lors de la sauvegarde de la feature "${feature.name}":`, error);
                      alertService.showError(
                        `Erreur lors de la sauvegarde de la feature "${feature.name}": ${error.message || 'Erreur inconnue'}`,
                      );
                    }
                  }
                }

                // Créer un nouvel objet pour la nouvelle version
                const moduleToSave = {
                  version: newVersionName,
                  notes: moduleVersion.notes || '',
                  createDate: new Date().toISOString(),
                  updateDate: new Date().toISOString(),
                  module: moduleVersion.module,
                  features: savedFeatures,
                  root: moduleVersion,
                };

                try {
                  // Sauvegarder le module dans la base de données
                  const savedModule = await moduleVersionService.create(moduleToSave);
                  console.log(`Module sauvegardé avec ID: ${savedModule.id}`);

                  // Ajouter à la liste des nouveaux modules
                  newModuleVersions.push(savedModule);

                  // Marquer ce module comme nouvellement créé
                  if (savedModule.id) {
                    newlyCreatedModuleIds.value.push(savedModule.id);
                  }

                  // Initialiser l'état UI pour ce module
                  const index = newModuleVersions.length - 1;
                  moduleVersionsUIState.value[index] = {
                    isEditing: true,
                    showFeatures: false,
                  };
                } catch (error) {
                  console.error(`Erreur lors de la sauvegarde du module "${moduleVersion.name}":`, error);
                  alertService.showError(
                    `Erreur lors de la sauvegarde du module "${moduleVersion.name}": ${error.message || 'Erreur inconnue'}`,
                  );
                }
              } else {
                // Ce module n'est pas dans la demande, on le garde tel quel
                newModuleVersions.push(moduleVersion);
              }
            }

            // Mettre à jour les moduleVersions du nouveau productVersion
            newProductVersion.moduleVersions = newModuleVersions;

            if (loadingMessage) {
              alertService.dismiss(loadingMessage);
            }

            alertService.showInfo('Nouvelles versions de modules créées avec succès', { variant: 'success' });
          } catch (error) {
            if (loadingMessage) {
              alertService.dismiss(loadingMessage);
            }
            console.error('Erreur lors de la création des modules:', error);
            alertService.showError('Erreur lors de la création des modules: ' + (error.message || 'Erreur inconnue'));
          }
        }

        // Mark as initialized
        dataInitialized.value = true;
      } catch (error) {
        console.error('Error initializing data:', error);
        alertService.showError("Erreur lors de l'initialisation des données");
      }
    };

    // Fetch available data for dropdowns
    const fetchAvailableData = async () => {
      try {
        // Fetch available infrastructure components
        const infraRes = await infraComponentVersionService.retrieve();
        availableInfraComponents.value = infraRes.data;

        // Fetch available modules
        const modulesRes = await moduleService.retrieve();
        availableModules.value = modulesRes.data;

        // Fetch available module versions
        const moduleVersionsRes = await moduleVersionService.retrieve();
        availableModuleVersions.value = moduleVersionsRes.data;

        // Fetch available product versions for root selection
        if (props.requestOfChange && props.requestOfChange.productVersion && props.requestOfChange.productVersion.product) {
          const productVersionsRes = await productVersionService.retrieve();
          availableRootVersions.value = productVersionsRes.data.filter(
            pv => pv.product?.id === props.requestOfChange.productVersion?.product?.id,
          );
        }
      } catch (error) {
        console.error('Error fetching data:', error);
        alertService.showError('Erreur lors de la récupération des données');
      }
    };

    // Vérifier si un module est nouvellement créé
    const isNewlyCreatedModule = (moduleVersion: IModuleVersion) => {
      return moduleVersion.id && newlyCreatedModuleIds.value.includes(moduleVersion.id);
    };

    // Get available module versions for a specific module
    const getAvailableModuleVersions = (moduleId: number | undefined) => {
      if (!moduleId) return [];

      return availableModuleVersions.value.filter(mv => mv.id === moduleId);
    };

    // Format date
    const formatDate = (date: string | Date | null | undefined) => {
      if (!date) return '-';

      const d = new Date(date);
      return d.toLocaleDateString();
    };

    // Navigation methods
    const nextStep = () => {
      if (currentStep.value < 4) {
        currentStep.value++;
      }
    };

    const prevStep = () => {
      if (currentStep.value > 1) {
        currentStep.value--;
      }
    };

    // Get step label
    const getStepLabel = (step: number) => {
      switch (step) {
        case 1:
          return 'Produit';
        case 2:
          return 'Configuration';
        case 3:
          return 'Modules';
        case 4:
          return 'Confirmation';
        default:
          return '';
      }
    };

    // Close modal
    const closeModal = () => {
      // Reset state
      dataInitialized.value = false;
      currentStep.value = 1;
      newlyCreatedModuleIds.value = [];
      moduleVersionsUIState.value = {};

      emit('close');
    };

    // Infrastructure component methods
    const addInfraComponent = () => {
      if (!selectedInfraComponentId.value) return;

      const component = availableInfraComponents.value.find(c => c.id === parseInt(selectedInfraComponentId.value));

      if (component) {
        // Check if component already exists
        const exists = newProductVersion.infraComponentVersions?.some(c => c.id === component.id);

        if (!exists) {
          if (!newProductVersion.infraComponentVersions) {
            newProductVersion.infraComponentVersions = [];
          }

          newProductVersion.infraComponentVersions.push(component);
        }

        selectedInfraComponentId.value = '';
        showInfraSelector.value = false;
      }
    };

    const removeInfraComponent = (index: number) => {
      if (newProductVersion.infraComponentVersions) {
        newProductVersion.infraComponentVersions.splice(index, 1);
      }
    };

    // Toggle features visibility
    const toggleFeaturesVisibility = (index: number) => {
      if (!moduleVersionsUIState.value[index]) {
        moduleVersionsUIState.value[index] = { isEditing: false, showFeatures: false };
      }
      moduleVersionsUIState.value[index].showFeatures = !moduleVersionsUIState.value[index].showFeatures;
    };

    // Toggle edit mode
    const toggleEditMode = (index: number) => {
      if (!moduleVersionsUIState.value[index]) {
        moduleVersionsUIState.value[index] = { isEditing: false, showFeatures: false };
      }
      moduleVersionsUIState.value[index].isEditing = !moduleVersionsUIState.value[index].isEditing;
    };

    // Feature methods
    const showAddFeature = (moduleVersion: IModuleVersion) => {
      selectedModuleForFeature.value = moduleVersion;
      newFeature.name = '';
      newFeature.description = '';
      showAddFeatureModal.value = true;
    };

    const addFeature = async () => {
      if (!selectedModuleForFeature.value || !newFeature.name) return;

      try {
        // Create new feature in database first
        const featureToSave = {
          name: newFeature.name,
          description: newFeature.description || '',
          apiVersion: newFeature.apiVersion || '',
          createDate: new Date().toISOString(),
          updateDate: new Date().toISOString(),
        };

        const savedFeature = await featureService.create(featureToSave);
        console.log(`Feature sauvegardée avec ID: ${savedFeature.id}`);

        // Add to module version
        if (!selectedModuleForFeature.value.features) {
          selectedModuleForFeature.value.features = [];
        }

        selectedModuleForFeature.value.features.push(savedFeature);

        // Reset form
        newFeature.name = '';
        newFeature.description = '';
        newFeature.apiVersion = '';
        showAddFeatureModal.value = false;

        alertService.showInfo(`Fonctionnalité "${savedFeature.name}" ajoutée avec succès`, { variant: 'success' });
      } catch (error) {
        console.error(`Erreur lors de la sauvegarde de la feature "${newFeature.name}":`, error);
        alertService.showError(`Erreur lors de la sauvegarde de la feature: ${error.message || 'Erreur inconnue'}`);
      }
    };

    const removeFeature = async (moduleVersion: IModuleVersion, index: number) => {
      if (!moduleVersion.features) return;

      const feature = moduleVersion.features[index];

      // Si la feature a un ID, elle est dans la base de données
      if (feature.id) {
        try {
          // Supprimer la feature de la base de données
          await featureService.delete(feature.id);
          console.log(`Feature supprimée avec ID: ${feature.id}`);
        } catch (error) {
          console.error(`Erreur lors de la suppression de la feature "${feature.name}":`, error);
          alertService.showError(`Erreur lors de la suppression de la feature: ${error.message || 'Erreur inconnue'}`);
          return;
        }
      }

      // Supprimer la feature du tableau
      moduleVersion.features.splice(index, 1);
      alertService.showInfo('Fonctionnalité supprimée avec succès', { variant: 'success' });
    };

    // Save new product version
    const saveNewProductVersion = async () => {
      try {
        // Validate data
        if (!newProductVersion.product) {
          alertService.showError('Erreur: Le produit est manquant');
          return;
        }

        if (!newProductVersion.version) {
          alertService.showError('Erreur: La version est manquante');
          return;
        }

        // Afficher un indicateur de chargement
        const loadingMessage = alertService.showInfo('Création de la nouvelle version du produit en cours...', {
          variant: 'info',
          timeout: 0,
        });

        try {
          // Préparer le produit à sauvegarder
          const productToSave = {
            version: newProductVersion.version,
            notes: newProductVersion.notes || '',
            createDate: newProductVersion.createDate,
            updateDate: newProductVersion.updateDate,
            product: newProductVersion.product,
            moduleVersions: newProductVersion.moduleVersions,
            infraComponentVersions: newProductVersion.infraComponentVersions,
            root: newProductVersion.root,
          };

          console.log(`Sauvegarde de la version produit: ${productToSave.version}`);
          console.log(`Nombre de modules: ${productToSave.moduleVersions.length}`);
          console.log(`Nombre de composants d'infrastructure: ${productToSave.infraComponentVersions.length}`);

          // Créer la version du produit
          const result = await productVersionService.create(productToSave);
          console.log(`Version produit créée avec ID: ${result.id}`);

          // Terminer
          if (loadingMessage) {
            alertService.dismiss(loadingMessage);
          }

          alertService.showInfo('Nouvelle version du produit créée avec succès', { variant: 'success' });
          emit('product-created', result);
          closeModal();
        } catch (error) {
          if (loadingMessage) {
            alertService.dismiss(loadingMessage);
          }

          console.error('Erreur lors de la sauvegarde:', error);
          alertService.showError('Erreur lors de la création: ' + (error.message || 'Erreur inconnue'));
        }
      } catch (error) {
        console.error('Erreur générale:', error);
        alertService.showError('Erreur inattendue: ' + (error.message || 'Erreur inconnue'));
      }
    };

    return {
      currentStep,
      newProductVersion,
      showInfraSelector,
      showAddFeatureModal,
      selectedInfraComponentId,
      selectedModuleForFeature,
      availableInfraComponents,
      availableModules,
      availableModuleVersions,
      availableRootVersions,
      newFeature,
      isDataValid,
      moduleVersionsUIState,
      nextStep,
      prevStep,
      getStepLabel,
      closeModal,
      formatDate,
      isNewlyCreatedModule,
      getAvailableModuleVersions,
      addInfraComponent,
      removeInfraComponent,
      toggleFeaturesVisibility,
      toggleEditMode,
      showAddFeature,
      addFeature,
      removeFeature,
      saveNewProductVersion,
    };
  },
});
</script>

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
