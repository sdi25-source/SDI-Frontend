import { inject, nextTick, onMounted, type PropType } from 'vue';
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
import RequestOfChangeService from '@/entities/request-of-change/request-of-change.service.ts';
import ProductService from '@/entities/product/product.service.ts';
import type { IInfraComponent } from '@/shared/model/infra-component.model.ts';
import InfraComponentService from '@/entities/infra-component/infra-component.service.ts';

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
    const productService = inject('productService', () => new ProductService());
    const productVersionService = new ProductVersionService();
    const requestOfChangeService = new RequestOfChangeService();
    const moduleVersionService = new ModuleVersionService();
    const moduleService = new ModuleService();
    const featureService = new FeatureService();
    const infraComponentVersionService = new InfraComponentVersionService();
    const infraComponentService = inject('infraComponentService', () => new InfraComponentService());
    const alertService = useAlertService();

    // State
    const currentStep = ref(1);
    const showInfraSelector = ref(false);
    const showAddFeatureModal = ref(false);
    const selectedInfraComponentId = ref('');
    const selectedModuleForFeature = ref<IModuleVersion | null>(null);
    const availableInfraComponents = ref<IInfraComponentVersion[]>([]);
    const infraComponentOptions = ref<IInfraComponent[]>([]);
    const availableModules = ref<IModule[]>([]);
    const moduleOptions = ref([]);
    const features = ref([]);
    const availableModuleVersions = ref<IModuleVersion[]>([]);
    const availableRootVersions = ref<IProductVersion[]>([]);
    const dataInitialized = ref(false);

    // UI state for modules
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

    // Watch for changes in requestOfChange and isOpen
    watch(
      [() => props.requestOfChange, () => props.isOpen],
      ([newRequest, isOpen]) => {
        if (isOpen && newRequest && !dataInitialized.value) {
          initializeFromRequest(newRequest);
        }
      },
      { immediate: true },
    );

    // Remove a module version from newProductVersion.moduleVersions
    const removeModuleVersion = (index: number) => {
      if (newProductVersion.moduleVersions) {
        const moduleVersion = newProductVersion.moduleVersions[index];
        if (!moduleVersion.isNewlyCreated) {
          newProductVersion.moduleVersions.splice(index, 1);
          // Clean up UI state
          delete moduleVersionsUIState.value[index];
          // Reindex UI state to maintain consistency
          const updatedUIState: { [key: number]: { isEditing: boolean; showFeatures: boolean } } = {};
          Object.keys(moduleVersionsUIState.value).forEach((key, i) => {
            updatedUIState[i] = moduleVersionsUIState.value[parseInt(key)];
          });
          moduleVersionsUIState.value = updatedUIState;
        }
      }
    };

    const fetchLatestNonClientVersion = async () => {
      try {
        // Regular expression to match X.X.X format and exclude unNom_X.X.X
        const versionRegex = /^\d+\.\d+\.\d+$/;
        const clientVersionRegex = /^[a-zA-Z]+_\d+\.\d+\.\d+$/;

        // Filter non-client versions (X.X.X) and exclude client versions (unNom_X.X.X)
        const res = await productService().retrieve();
        const nonClientVersions = res.data.value.filter(
          pv => pv.version && versionRegex.test(pv.version) && !clientVersionRegex.test(pv.version),
        );
        console.log(nonClientVersions);
        if (nonClientVersions.length === 0) {
          return null; // No non-client versions found
        }

        // Sort versions by version number (semantic versioning)
        nonClientVersions.sort((a, b) => {
          const versionA = a.version.split('.').map(Number);
          const versionB = b.version.split('.').map(Number);
          for (let i = 0; i < 3; i++) {
            if (versionA[i] !== versionB[i]) {
              return versionB[i] - versionA[i]; // Descending order
            }
          }
          return new Date(b.createDate) - new Date(a.createDate); // Fallback to creation date
        });

        // Return the latest version
        return nonClientVersions[0];
      } catch (error) {
        alertService.showHttpError(error.response);
        return null;
      }
    };

    const incrementVersion = version => {
      let [major, minor, patch] = version.split('.').map(Number);
      // Increment patch; if it reaches 9, reset to 0 and increment minor
      if (patch < 9) {
        patch += 1;
      } else {
        patch = 0;
        // If minor reaches 9, reset to 0 and increment major
        if (minor < 9) {
          minor += 1;
        } else {
          minor = 0;
          major += 1;
        }
      }
      // Return the new version string
      return `${major}.${minor}.${patch}`;
    };

    // Initialize data from request of change
    const initializeFromRequest = async (request: IRequestOfChange) => {
      if (!isDataValid.value) {
        console.warn('Request data is invalid, cannot initialize');
        return;
      }
      try {
        // Reset state
        currentStep.value = 1;
        moduleVersionsUIState.value = {};

        if (request.type === 'EXTERNAL') {
          // Generate version number based on client name and product version
          if (request.client && request.client.name && request.productVersion && request.productVersion.version) {
            const baseVersion = request.productVersion.version;
            const clientName = request.client.name;

            // Fetch existing product versions for this product and client to determine the increment
            const productVersionsRes = await productVersionService.retrieve();
            const existingVersions = productVersionsRes.data.filter(
              pv => pv.product?.id === request.productVersion?.product?.id && pv.version.startsWith(`${clientName}_${baseVersion}`),
            );

            // Extract the highest increment number
            let maxIncrement = 0;
            existingVersions.forEach(pv => {
              const match = pv.version.match(new RegExp(`^${clientName}_${baseVersion}\\.(\\d+)$`));
              if (match) {
                const increment = parseInt(match[1], 10);
                if (increment > maxIncrement) {
                  maxIncrement = increment;
                }
              }
            });

            // Set the new version with the next increment
            newProductVersion.version = `${clientName}_${baseVersion}.${maxIncrement + 1}`;
          }
        } else if (request.type === 'INTERNAL') {
          newProductVersion.version = incrementVersion(request.productVersion.version);
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

        // Fetch available data
        await fetchAvailableData();

        // Prepare module versions in memory
        if (request.productVersion && request.productVersion.moduleVersions) {
          const moduleIdsInRequest = request.moduleVersions?.map(mv => mv.id).filter(id => id !== undefined) || [];
          const newModuleVersions: IModuleVersion[] = [];

          for (const moduleVersion of request.productVersion.moduleVersions) {
            const isInRequest = moduleIdsInRequest.includes(moduleVersion.id);
            if (isInRequest) {
              // Generate module version name with client prefix
              let newVersionName = '';

              if (request.type === 'EXTERNAL') {
                if (request.client && request.client.name) {
                  // Fetch existing module versions to determine increment
                  const existingModuleVersions = availableModuleVersions.value.filter(
                    mv => mv.id === moduleVersion.id && mv.version.startsWith(`${request.client.name}_${moduleVersion.version}`),
                  );

                  let maxModuleIncrement = 0;
                  existingModuleVersions.forEach(mv => {
                    const match = mv.version.match(new RegExp(`^${request.client.name}_${moduleVersion.version}\\.(\\d+)$`));
                    if (match) {
                      const increment = parseInt(match[1], 10);
                      if (increment > maxModuleIncrement) {
                        maxModuleIncrement = increment;
                      }
                    }
                  });

                  newVersionName = `${request.client.name}_${moduleVersion.version}.${maxModuleIncrement + 1}`;
                }
              } else if (request.type === 'INTERNAL') {
                newVersionName = incrementVersion(moduleVersion.version);
              }

              const newModuleVersion: IModuleVersion = {
                version: newVersionName,
                notes: moduleVersion.notes || '',
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString(),
                module: getModuleVersionWithModuleCached(moduleVersion.id).module,
                features: moduleVersion.features ? [...moduleVersion.features] : [],
                root: getModuleVersionWithModuleCached(moduleVersion.id),
                isNewlyCreated: true, // Flag to indicate this is a new version
              };

              //newModuleVersion.features = fetchFeatures(moduleVersion.id);
              newModuleVersions.push(newModuleVersion);

              // Initialize UI state
              const index = newModuleVersions.length - 1;
              moduleVersionsUIState.value[index] = {
                isEditing: true,
                showFeatures: false,
              };
            } else {
              // Keep existing module version
              newModuleVersions.push({ ...getModuleVersionWithModuleCached(moduleVersion.id), isNewlyCreated: false });
            }
          }

          newProductVersion.moduleVersions = newModuleVersions;
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

    // Check if a module is newly created
    const isNewlyCreatedModule = (moduleVersion: IModuleVersion) => {
      return moduleVersion.isNewlyCreated === true;
    };

    // Get available module versions for a specific module
    const getAvailableModuleVersions = (moduleId: number | undefined) => {
      if (!moduleId) return [];
      return availableModuleVersions.value.filter(mv => mv.module?.id === moduleId);
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
          return 'Produit Version';
        case 2:
          return 'Configuration';
        case 3:
          return 'Modules Version';
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
      moduleVersionsUIState.value = {};
      newProductVersion.moduleVersions = [];
      newProductVersion.infraComponentVersions = [];
      newProductVersion.version = '';
      newProductVersion.notes = '';
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

    const addFeature = () => {
      if (!selectedModuleForFeature.value || !newFeature.name) return;

      // Add feature to module version in memory
      const featureToAdd: IFeature = {
        name: newFeature.name,
        description: newFeature.description || '',
        apiVersion: newFeature.apiVersion || '',
        createDate: new Date().toISOString(),
        updateDate: new Date().toISOString(),
      };

      if (!selectedModuleForFeature.value.features) {
        selectedModuleForFeature.value.features = [];
      }
      selectedModuleForFeature.value.features.push(featureToAdd);

      // Reset form
      newFeature.name = '';
      newFeature.description = '';
      newFeature.apiVersion = '';
      showAddFeatureModal.value = false;

      alertService.showInfo(`Fonctionnalité "${featureToAdd.name}" ajoutée avec succès`, { variant: 'success' });
    };

    const removeFeature = (moduleVersion: IModuleVersion, index: number) => {
      if (!moduleVersion.features) return;
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

        // Show loading indicator
        const loadingMessage = alertService.showInfo('Création de la nouvelle version du produit en cours...', {
          variant: 'info',
          timeout: 0,
        });

        try {
          // Step 1: Create features for new module versions
          const savedModuleVersions: IModuleVersion[] = [];
          for (const moduleVersion of newProductVersion.moduleVersions) {
            if (!moduleVersion.isNewlyCreated) {
              savedModuleVersions.push(moduleVersion);
              continue;
            }

            // Create features first
            const savedFeatures: IFeature[] = [];
            if (moduleVersion.features && moduleVersion.features.length > 0) {
              for (const feature of moduleVersion.features) {
                const featureToSave = {
                  name: feature.name,
                  description: feature.description || '',
                  apiVersion: feature.apiVersion || '',
                  createDate: new Date().toISOString(),
                  updateDate: new Date().toISOString(),
                };
                const savedFeature = await featureService.create(featureToSave);
                savedFeatures.push(savedFeature);
              }
            }

            // Create new module version
            const moduleToSave = {
              version: moduleVersion.version,
              notes: moduleVersion.notes || '',
              createDate: new Date().toISOString(),
              updateDate: new Date().toISOString(),
              module: moduleVersion.module,
              features: savedFeatures,
              root: moduleVersion.root,
            };

            const savedModule = await moduleVersionService.create(moduleToSave);
            savedModuleVersions.push(savedModule);
          }

          // Step 2: Create product version
          const productToSave = {
            version: newProductVersion.version,
            notes: newProductVersion.notes || '',
            createDate: newProductVersion.createDate,
            updateDate: newProductVersion.updateDate,
            product: newProductVersion.product,
            moduleVersions: savedModuleVersions,
            infraComponentVersions: newProductVersion.infraComponentVersions,
            root: newProductVersion.root,
          };

          const result = await productVersionService.create(productToSave);
          console.log(`Version produit créée avec ID: ${result.id}`);

          // Step 3: Update request status to APPROVED
          const updatedRequest = {
            ...props.requestOfChange,
            productVersionResult: result,
            status: 'COMPLETED',
            done: true,
          };
          const response = await requestOfChangeService.update(updatedRequest);
          console.log('Update request: ', response);

          // Complete
          if (loadingMessage) {
            alertService.dismiss(loadingMessage);
          }

          alertService.showInfo('Nouvelle version du produit créée avec succès', { variant: 'success' });
          // Émettre l'événement avec la version du produit et la demande mise à jour
          emit('product-created', { productVersion: result, updatedRequest: response });
          closeModal();

          // Delay page reload to allow the success message to be visible
          setTimeout(() => {
            window.location.reload();
          }, 800);
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

    const infraComponentVersionOptions = ref([]);
    const fetchInfraComponentVersionOptions = async () => {
      try {
        const res = await infraComponentVersionService.retrieve();
        infraComponentVersionOptions.value = res.data;
        console.log(infraComponentVersionOptions.value);
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const getIfraComponentVersionWithInfraCached = infracomponenetVersionId => {
      const infracomponenetVersion = infraComponentVersionOptions.value.find(ifc => ifc.id === infracomponenetVersionId);
      if (!infracomponenetVersion) return null;
      const infraComponent = infraComponentOptions.value.find(m => m.id === infracomponenetVersion.infraComponent?.id);
      return {
        ...infracomponenetVersion,
        infraComponent: infraComponent ? { ...infraComponent } : null,
      };
    };

    const fetchInfraComponents = async () => {
      try {
        const res = await infraComponentService().retrieve();
        infraComponentOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchModuleOptions = async () => {
      try {
        const res = await moduleService.retrieve();
        moduleOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const moduleVersionOptions = ref([]);
    const fetchModuleVersionOptions = async () => {
      try {
        const res = await moduleVersionService.retrieve();
        moduleVersionOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const getModuleVersionWithModuleCached = moduleVersionId => {
      // 1. Trouver la version de module dans le cache
      const moduleVersion = moduleVersionOptions.value.find(mv => mv.id === moduleVersionId);

      if (!moduleVersion) return null;

      // 2. Trouver le module associé dans le cache
      const module = moduleOptions.value.find(m => m.id === moduleVersion.module?.id);

      // 3. Fusionner les données
      return {
        ...moduleVersion,
        module: module ? { ...module } : null,
      };
    };

    const fetchFeatures = async moduleVersionId => {
      const res = await moduleVersionService.find(moduleVersionId);
      features.value = res.features;
      return {
        features,
      };
    };

    onMounted(async () => {
      await fetchInfraComponentVersionOptions();
      await fetchInfraComponents();
      await fetchModuleOptions();
      await fetchModuleVersionOptions();
    });

    return {
      fetchFeatures,
      getModuleVersionWithModuleCached,
      fetchModuleOptions,
      fetchModuleVersionOptions,
      currentStep,
      newProductVersion,
      showInfraSelector,
      showAddFeatureModal,
      selectedInfraComponentId,
      selectedModuleForFeature,
      availableInfraComponents,
      fetchInfraComponentVersionOptions,
      infraComponentOptions,
      availableModules,
      availableModuleVersions,
      availableRootVersions,
      newFeature,
      isDataValid,
      moduleVersionsUIState,
      fetchLatestNonClientVersion,
      removeModuleVersion,
      incrementVersion,
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
      getIfraComponentVersionWithInfraCached,
      fetchInfraComponents,
    };
  },
});
