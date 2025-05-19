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
import RequestOfChangeService from '@/entities/request-of-change/request-of-change.service.ts';

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
    const requestOfChangeService = new RequestOfChangeService();
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

        // Fetch available data
        await fetchAvailableData();

        // Prepare module versions in memory
        if (request.productVersion && request.productVersion.moduleVersions) {
          const moduleIdsInRequest = request.moduleVersions?.map(mv => mv.module?.id).filter(id => id !== undefined) || [];
          const newModuleVersions: IModuleVersion[] = [];

          for (const moduleVersion of request.productVersion.moduleVersions) {
            const isInRequest = moduleIdsInRequest.includes(moduleVersion.module?.id);

            if (isInRequest) {
              // Prepare a new version for this module in memory
              let newVersionName = '';
              if (request.client && request.client.name) {
                newVersionName = `${request.client.name}_${moduleVersion.version}`;
              } else {
                newVersionName = `New_${moduleVersion.version}`;
              }

              const newModuleVersion: IModuleVersion = {
                version: newVersionName,
                notes: moduleVersion.notes || '',
                createDate: new Date().toISOString(),
                updateDate: new Date().toISOString(),
                module: moduleVersion.module,
                features: moduleVersion.features ? [...moduleVersion.features] : [],
                root: moduleVersion,
                isNewlyCreated: true, // Flag to indicate this is a new version
              };

              newModuleVersions.push(newModuleVersion);

              // Initialize UI state
              const index = newModuleVersions.length - 1;
              moduleVersionsUIState.value[index] = {
                isEditing: true,
                showFeatures: false,
              };
            } else {
              // Keep existing module version
              newModuleVersions.push({ ...moduleVersion, isNewlyCreated: false });
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
              // Existing module version, add as-is
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

          const updatedRequest = { ...props.requestOfChange, done: true };
          const response = await requestOfChangeService.update(updatedRequest);
          console.log(`Update request: ${response.id}`);

          // Complete
          if (loadingMessage) {
            alertService.dismiss(loadingMessage);
          }

          alertService.showInfo('Nouvelle version du produit créée avec succès', { variant: 'success' });
          emit('product-created', result);
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
