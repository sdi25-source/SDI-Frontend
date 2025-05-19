import { defineComponent, inject, onMounted, ref, reactive, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import ProductService from './product.service';
import ProductVersionService from '@/entities/product-version/product-version.service';
import ModuleService from '@/entities/module/module.service';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import FeatureService from '@/entities/feature/feature.service';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';
import ProductLineService from '@/entities/product-line/product-line.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';
import ComponentTypeService from '@/entities/component-type/component-type.service.ts';
import InfraComponentService from '@/entities/infra-component/infra-component.service.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Product',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const productService = inject('productService', () => new ProductService());
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const moduleService = inject('moduleService', () => new ModuleService());
    const moduleVersionService = inject('moduleVersionService', () => new ModuleVersionService());
    const featureService = inject('featureService', () => new FeatureService());
    const infraComponentVersionService = inject('infraComponentVersionService', () => new InfraComponentVersionService());
    const componentTypeService = inject('componentTypeService', () => new ComponentTypeService());
    const infraComponentService = inject('infraComponentService', () => new InfraComponentService());
    const productLineService = inject('productLineService', () => new ProductLineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    // Data
    const products = ref([]);
    const allProducts = ref([]);
    const isFetching = ref(false);
    const removeId = ref(null);
    const removeEntity = ref(null);
    const searchTerm = ref('');
    const searchTimeout = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const totalItems = ref(0);
    const selectedProduct = ref(null);
    const selectedVersion = ref(null);
    const selectedModule = ref(null);
    const showModuleVersionsModal = ref(false);
    const activeTabIndex = ref(0);
    const tabs = ['Versions', 'Modules', 'Configuration'];
    const tabRefs = reactive([]);
    const hoveredIndex = ref(null);
    const hoverStyle = ref({ left: '0px', width: '0px' });
    const activeStyle = ref({ left: '0px', width: '0px' });
    const showAddVersionRow = ref(false);
    const showAddModuleVersionRow = ref(false);
    const showAddRow = ref(false);
    const showAddModuleRow = ref(false);

    // Variables pour l'édition de version
    const editingVersionData = ref(null);
    const isEditingVersion = ref(false);

    // Options pour les selects
    const productLineOptions = ref([]);
    const infraComponentVersionOptions = ref([]);
    const infraComponentOptions = ref<IInfraComponent[]>([]);
    const componentTypeOptions = ref<IComponentType[]>([]);
    const moduleOptions = ref([]);
    const moduleVersionOptions = ref([]);
    const selectedProductLineIds = ref([]);
    const editProductLineIds = ref([]);

    // Product settings modal
    const showSettingsModal = ref(false);
    const showModuleSelector = ref(false);
    const showInfraSelector = ref(false);
    const selectedModuleVersionId = ref('');
    const selectedInfraComponentId = ref('');
    const productInfraComponents = ref([]);
    const productModules = ref([]);

    // Version settings modal
    const showVersionSettingsModal = ref(false);
    const showVersionModuleSelector = ref(false);
    const showVersionInfraSelector = ref(false);
    const selectedVersionModuleId = ref('');
    const selectedVersionInfraComponentId = ref('');
    const versionInfraComponents = ref([]);
    const versionModuleVersions = ref([]);
    const editingVersion = ref(null);

    // Propriétés pour les versions de produit
    const productVersions = ref([]);
    const removeVersionId = ref(null);
    const removeVersionEntity = ref(null);

    // Pagination pour les versions
    const currentVersionPage = ref(1);
    const itemsPerVersionPage = ref(5);
    const totalVersionItems = ref(0);

    // Propriétés pour les versions de module
    const moduleVersions = ref([]);
    const selectedModuleVersion = ref(null);
    const removeModuleId = ref(null);
    const removeModuleEntity = ref(null);

    // Features
    const features = ref([]);
    const showFeaturesTable = ref(false);
    const showAddFeatureRow = ref(false);
    const showModuleFeaturesModal = ref(false);

    // New item templates
    const newProduct = ref({
      name: '',
      logo: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      productLines: [],
      infraComponentVersions: [],
      modules: [],
    });

    const newVersion = ref({
      version: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
      product: null,
      moduleVersions: [],
      infraComponentVersions: [],
      root: null,
    });

    const newModuleVersion = ref({
      version: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
      module: null,
      features: [],
    });

    const newModule = ref({
      name: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
    });

    const newFeature = ref({
      name: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      moduleVersion: null,
    });

    // Computed properties
    const filteredProducts = computed(() => {
      if (!searchTerm.value) return allProducts.value;
      const term = searchTerm.value.toLowerCase();
      return allProducts.value.filter(
        product => product.name?.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term),
      );
    });

    const paginatedProducts = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return filteredProducts.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(filteredProducts.value.length / itemsPerPage.value));

    const isPrevDisabled = computed(() => currentPage.value <= 1);

    const isNextDisabled = computed(() => currentPage.value >= totalPages.value);

    const paginationInfo = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(start + itemsPerPage.value - 1, filteredProducts.value.length);
      return `${start}-${end} sur ${filteredProducts.value.length}`;
    });

    // Computed properties pour la pagination des versions
    const paginatedVersions = computed(() => {
      const start = (currentVersionPage.value - 1) * itemsPerVersionPage.value;
      const end = start + itemsPerVersionPage.value;
      return productVersions.value.slice(start, end);
    });

    const totalVersionPages = computed(() => {
      return Math.ceil(totalVersionItems.value / itemsPerVersionPage.value);
    });

    const isVersionPrevDisabled = computed(() => {
      return currentVersionPage.value <= 1;
    });

    const isVersionNextDisabled = computed(() => {
      return currentVersionPage.value >= totalVersionPages.value;
    });

    const versionPaginationInfo = computed(() => {
      if (totalVersionItems.value === 0) return '0-0 / 0';

      const start = (currentVersionPage.value - 1) * itemsPerVersionPage.value + 1;
      const end = Math.min(start + itemsPerVersionPage.value - 1, totalVersionItems.value);
      return `${start}-${end} / ${totalVersionItems.value}`;
    });

    // Get filtered components based on selected version
    const getFilteredInfraComponents = computed(() => {
      if (!selectedProduct.value) return [];

      // Récupérer la liste brute des composants (IDs ou objets partiels)
      const rawComponents = selectedVersion.value
        ? selectedVersion.value.infraComponentVersions || []
        : selectedProduct.value.infraComponentVersions || [];

      return rawComponents
        .map(component => {
          // 1. Récupérer l'ID réel
          const componentId = typeof component === 'number' ? component : component.id;

          // 2. Trouver la version complète
          const fullComponentVersion = infraComponentVersionOptions.value.find(icv => icv.id === componentId);

          if (!fullComponentVersion) return null;

          // 3. Trouver le composant parent
          const infraComponent = infraComponentOptions.value.find(ic => ic.id === fullComponentVersion.infraComponent?.id);

          // 4. Trouver le type de composant
          const componentType = componentTypeOptions.value.find(ct => ct.id === infraComponent?.componentType?.id);

          // 5. Fusionner les données
          return {
            ...fullComponentVersion,
            infraComponent: infraComponent
              ? {
                  ...infraComponent,
                  componentType: componentType || null,
                }
              : null,
          };
        })
        .filter(Boolean); // Filtrer les entrées non trouvées
    });

    // Get filtered modules based on selected version
    const getFilteredModules = computed(() => {
      if (!selectedProduct.value) return [];
      if (selectedVersion.value) {
        // Return modules specific to the selected version (moduleVersions)
        return (
          selectedVersion.value.moduleVersions?.map(mv => ({
            id: mv.id,
            name: mv.module?.name,
            description: mv.module?.description,
            version: mv.version,
            module: mv.module,
            root: mv.root,
          })) || []
        );
      } else {
        // Return all modules for the product
        return selectedProduct.value.modules || [];
      }
    });

    // Methods
    const retrieveProducts = async () => {
      isFetching.value = true;
      try {
        const res = await productService().retrieve();
        products.value = res.data.map(product => {
          // Enrichir les modules de chaque produit
          const modulesWithExpansion = product.modules
            ? product.modules.map(mod => ({
                ...mod,
                isExpanded: false,
                versions: [],
                isLoadingVersions: false,
              }))
            : [];
          return {
            ...product,
            isEditing: false,
            showDropdown: false,
            originalData: { ...product },
            modules: modulesWithExpansion,
          };
        });
        allProducts.value = [...products.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const fetchProductLineOptions = async () => {
      try {
        const res = await productLineService().retrieve();
        productLineOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchInfraComponentVersionOptions = async () => {
      try {
        const res = await infraComponentVersionService().retrieve();
        infraComponentVersionOptions.value = res.data;
        console.log(infraComponentVersionOptions.value);
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchInfraComponents = async () => {
      try {
        const res = await infraComponentService().retrieve();
        infraComponentOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchComponentTypes = async () => {
      try {
        const res = await componentTypeService().retrieve();
        componentTypeOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchModuleOptions = async () => {
      try {
        const res = await moduleService().retrieve();
        moduleOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchModuleVersionOptions = async () => {
      try {
        const res = await moduleVersionService().retrieve();
        moduleVersionOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const handleSyncList = () => {
      retrieveProducts();
    };

    const prepareRemove = instance => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeProduct = async () => {
      try {
        isFetching.value = true;

        // Étape 1 : récupérer toutes les versions de ce produit
        const res = await productVersionService().retrieve();
        const versionsToDelete = res.data.filter(pv => pv.product?.id === removeId.value);

        // Étape 2 : supprimer chaque version une par une
        for (const version of versionsToDelete) {
          await productVersionService().delete(version.id);
        }

        // Étape 3 : supprimer le produit
        await productService().delete(removeId.value);

        const message = t$('sdiFrontendApp.product.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });

        removeId.value = null;
        retrieveProducts();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      searchTimeout.value = setTimeout(() => {
        products.value = filteredProducts.value;
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    const goToPrevPage = () => {
      if (currentPage.value > 1) {
        currentPage.value--;
      }
    };

    const goToNextPage = () => {
      if (currentPage.value < totalPages.value) {
        currentPage.value++;
      }
    };

    const updateTotalItems = () => {
      if (products.value) {
        totalItems.value = products.value.length;
      } else {
        totalItems.value = 0;
      }
    };

    // Format date
    const formatDate = date => {
      if (!date) return '-';
      const d = new Date(date);
      return d.toLocaleDateString();
    };

    // Toggle product selection with checkbox
    const toggleProductSelection = async product => {
      if (selectedProduct.value && selectedProduct.value.id === product.id) {
        selectedProduct.value = null;
        selectedVersion.value = null;
        productVersions.value = [];
      } else {
        selectedProduct.value = product;
        selectedVersion.value = null;

        // Fetch product versions
        await fetchProductVersions(product.id);
      }
    };

    // Toggle version selection with checkbox
    const toggleVersionSelection = version => {
      if (selectedVersion.value && selectedVersion.value.id === version.id) {
        selectedVersion.value = null;
      } else {
        selectedVersion.value = version;
        // Switch to Configuration tab to show related components
        setActiveTabIndex(0);
      }
    };

    // Fetch product versions
    const fetchProductVersions = async productId => {
      isFetching.value = true;
      try {
        const res = await productVersionService().retrieve();
        // Filtrer les versions de produit par ID du produit
        productVersions.value = res.data.filter(pv => pv.product?.id === productId);
        productVersions.value.forEach(request => {
          if (request.moduleVersions) {
            request.moduleVersions = request.moduleVersions.map(mv => {
              const full = moduleVersions.value.find(opt => opt.id === mv.id);
              return full ? full : mv;
            });
          }
        });
        updateTotalVersionItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    // Fetch module versions
    const fetchModuleVersions = async moduleId => {
      isFetching.value = true;
      try {
        const res = await moduleVersionService().retrieve();
        moduleVersions.value = res.data.filter(pv => pv.module?.id === moduleId);
        console.log(res.data);
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    // Fetch features for a module version
    const fetchFeatures = async moduleVersionId => {
      isFetching.value = true;
      try {
        const res = await moduleVersionService().find(moduleVersionId);
        features.value = res.features;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    // Product settings methods
    const openSettingsModal = () => {
      productInfraComponents.value = newProduct.value.infraComponentVersions || [];
      productModules.value = newProduct.value.modules || [];
      showSettingsModal.value = true;
    };

    const openProductSettings = product => {
      selectedProduct.value = product;
      productInfraComponents.value = product.infraComponentVersions || [];
      productModules.value = product.modules || [];
      showSettingsModal.value = true;
    };

    const closeSettingsModal = () => {
      showSettingsModal.value = false;
      showModuleSelector.value = false;
      showInfraSelector.value = false;
      selectedModuleVersionId.value = '';
      selectedInfraComponentId.value = '';
    };

    const saveSettingsModal = async () => {
      try {
        if (selectedProduct.value) {
          // Update existing product
          selectedProduct.value.infraComponentVersions = productInfraComponents.value;
          //   selectedProduct.value.infraComponentVersions.value.infraComponent = productInfraComponents.value.infraComponent.value;

          selectedProduct.value.modules = productModules.value;
          await productService().update(selectedProduct.value);
          await retrieveProducts();
        } else {
          // For new product
          newProduct.value.infraComponentVersions = productInfraComponents.value;
          newProduct.value.modules = productModules.value;
        }
        closeSettingsModal();
        alertService.showInfo('Configuration sauvegardée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Version settings methods
    const openVersionSettings = version => {
      editingVersion.value = version;
      versionInfraComponents.value = version.infraComponentVersions || [];
      versionModuleVersions.value = version.moduleVersions || [];
      showVersionSettingsModal.value = true;
    };

    // Fonction pour ouvrir le modal de paramètres depuis l'édition en ligne
    const openVersionSettingsFromEdit = () => {
      if (!editingVersionData.value) return;

      // Ouvrir le modal de paramètres avec les données existantes
      editingVersion.value = editingVersionData.value;
      versionInfraComponents.value = editingVersionData.value.infraComponentVersions || [];
      versionModuleVersions.value = editingVersionData.value.moduleVersions || [];
      showVersionSettingsModal.value = true;
    };

    const openNewVersionSettings = () => {
      // Utiliser les composants d'infrastructure du produit par défaut
      versionInfraComponents.value = selectedProduct.value?.infraComponentVersions || [];
      versionModuleVersions.value = [];
      showVersionSettingsModal.value = true;
    };

    const closeVersionSettingsModal = () => {
      showVersionSettingsModal.value = false;
      showVersionModuleSelector.value = false;
      showVersionInfraSelector.value = false;
      selectedVersionModuleId.value = '';
      selectedVersionInfraComponentId.value = '';
      editingVersion.value = null;
    };

    const saveVersionSettingsModal = async () => {
      try {
        if (editingVersion.value) {
          // Update existing version
          const updatedVersion = {
            ...editingVersion.value,
            infraComponentVersions: versionInfraComponents.value,
            moduleVersions: versionModuleVersions.value,
          };

          // Si nous sommes en mode édition directe, mettre à jour les champs modifiables
          if (isEditingVersion.value && editingVersionData.value) {
            updatedVersion.version = editingVersionData.value.version;
            updatedVersion.notes = editingVersionData.value.notes;
            updatedVersion.updateDate = new Date().toISOString().split('T')[0];
          }

          await productVersionService().update(updatedVersion);
          await fetchProductVersions(selectedProduct.value.id);

          // Réinitialiser l'état d'édition
          isEditingVersion.value = false;
          editingVersionData.value = null;

          alertService.showInfo('Version mise à jour avec succès', { variant: 'success' });
        } else {
          // For new version
          newVersion.value.infraComponentVersions = versionInfraComponents.value;
          newVersion.value.moduleVersions = versionModuleVersions.value;
        }
        closeVersionSettingsModal();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const addModuleToProduct = () => {
      if (!selectedModuleVersionId.value) return;

      const module = getModuleById(selectedModuleVersionId.value);
      if (module) {
        const exists = productModules.value.some(m => m.id === module.id);
        if (!exists) {
          productModules.value.push(module);
        }
        selectedModuleVersionId.value = '';
      }
    };

    const removeModuleFromProduct = index => {
      productModules.value.splice(index, 1);
    };

    const addInfraToProduct = () => {
      if (!selectedInfraComponentId.value) return;

      const component = getInfraComponentById(selectedInfraComponentId.value);
      if (component) {
        const exists = productInfraComponents.value.some(c => c.id === component.id);
        if (!exists) {
          productInfraComponents.value.push(component);
        }
        selectedInfraComponentId.value = '';
      }
    };

    const removeInfraFromProduct = index => {
      productInfraComponents.value.splice(index, 1);
    };

    const addModuleToVersion = () => {
      if (!selectedVersionModuleId.value) return;

      const moduleVersion = getModuleVersionById(selectedVersionModuleId.value);
      if (moduleVersion) {
        const exists = versionModuleVersions.value.some(mv => mv.id === moduleVersion.id);
        if (!exists) {
          versionModuleVersions.value.push(moduleVersion);
        }
        selectedVersionModuleId.value = '';
      }
    };

    const removeModuleFromVersion = index => {
      versionModuleVersions.value.splice(index, 1);
    };

    const addInfraToVersion = () => {
      if (!selectedVersionInfraComponentId.value) return;
      console.log(versionInfraComponents.value);

      const component = getInfraComponentById(selectedVersionInfraComponentId.value);
      if (component) {
        const exists = versionInfraComponents.value.some(c => c.id === component.id);
        if (!exists) {
          versionInfraComponents.value.push(component);
        }
        selectedVersionInfraComponentId.value = '';
      }
    };

    const removeInfraFromVersion = index => {
      versionInfraComponents.value.splice(index, 1);
    };

    // Editions methods
    const editProduct = product => {
      product.isEditing = true;
      editProductLineIds.value = product.productLines?.map(pl => pl.id) || [];
    };

    const cancelEdit = product => {
      Object.assign(product, product.originalData);
      product.isEditing = false;
    };

    const saveEditProduct = async product => {
      try {
        await productService().update(product);
        product.isEditing = false;
        product.originalData = { ...product };
        alertService.showInfo('Produit mis à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const updateProductLines = () => {
      const selectedOptions = productLineOptions.value.filter(option => selectedProductLineIds.value.includes(option.id));
      newProduct.value.productLines = selectedOptions;
    };

    const updateEditProductLines = product => {
      const selectedOptions = productLineOptions.value.filter(option => editProductLineIds.value.includes(option.id));
      //product.productLines = selectedOptions;

      selectedOptions.forEach(option => {
        const alreadyExists = product.productLines.some(p => p.id === option.id);
        if (!alreadyExists) {
          product.productLines.push(option);
        }
      });
    };

    const removeProductLine = id => {
      newProduct.value.productLines = newProduct.value.productLines.filter(line => line.id !== id);
      selectedProductLineIds.value = selectedProductLineIds.value.filter(lineId => lineId !== id);
    };

    const removeEditProductLine = (product, id) => {
      product.productLines = product.productLines.filter(line => line.id !== id);
      editProductLineIds.value = editProductLineIds.value.filter(lineId => lineId !== id);
    };

    const saveNewProduct = async () => {
      if (!newProduct.value.name) {
        alertService.showInfo('Le nom du produit est requis', { variant: 'danger' });
        return;
      }

      try {
        // Create the product
        const result = await productService().create(newProduct.value);

        // Reset the form
        showAddRow.value = false;
        newProduct.value = {
          name: '',
          logo: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          productLines: [],
          infraComponentVersions: [],
          modules: [],
        };
        selectedProductLineIds.value = [];

        // Refresh the product list
        await retrieveProducts();

        alertService.showInfo('Produit créé avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewProduct = () => {
      showAddRow.value = false;
      newProduct.value = {
        name: '',
        logo: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        productLines: [],
        infraComponentVersions: [],
        modules: [],
      };
      selectedProductLineIds.value = [];
    };

    // Version management methods
    const editVersion = version => {
      // Créer une copie pour l'édition
      editingVersionData.value = { ...version };
      isEditingVersion.value = true;

      // Ne pas ouvrir le modal de paramètres automatiquement
      // Le modal sera ouvert uniquement via le bouton de paramètres
    };

    const saveEditVersion = async version => {
      if (!editingVersionData.value) return;

      try {
        // Mettre à jour les champs modifiables
        const updatedVersion = {
          ...version,
          version: editingVersionData.value.version,
          notes: editingVersionData.value.notes,
          updateDate: new Date().toISOString().split('T')[0],
          // Conserver les relations existantes
          infraComponentVersions: version.infraComponentVersions || [],
          moduleVersions: version.moduleVersions || [],
          root: editingVersionData.value.root,
        };

        await productVersionService().update(updatedVersion);

        // Rafraîchir les versions
        await fetchProductVersions(selectedProduct.value.id);

        // Réinitialiser l'état d'édition
        isEditingVersion.value = false;
        editingVersionData.value = null;

        alertService.showInfo('Version mise à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditVersion = () => {
      isEditingVersion.value = false;
      editingVersionData.value = null;
    };

    const prepareRemoveVersion = version => {
      if (!version || !version.id) {
        alertService.showInfo('Version invalide', { variant: 'danger' });
        return;
      }

      removeVersionId.value = version.id;

      // Vérifier si removeVersionEntity est disponible
      if (removeVersionEntity.value) {
        removeVersionEntity.value.show();
      } else {
        // Fallback si le modal n'est pas disponible
        if (confirm(`Êtes-vous sûr de vouloir supprimer la version ${version.version} ?`)) {
          removeProductVersion();
        }
      }
    };

    const closeVersionDialog = () => {
      if (removeVersionEntity.value) {
        removeVersionEntity.value.hide();
      }
    };

    const removeProductVersion = async () => {
      if (!removeVersionId.value) {
        alertService.showInfo('ID de version invalide', { variant: 'danger' });
        return;
      }

      try {
        isFetching.value = true;
        await productVersionService().delete(removeVersionId.value);

        const message = t$('sdiFrontendApp.productVersion.deleted', { param: removeVersionId.value }).toString();
        alertService.showInfo(message, { variant: 'success' });

        // Réinitialiser la sélection si la version supprimée était sélectionnée
        if (selectedVersion.value && selectedVersion.value.id === removeVersionId.value) {
          selectedVersion.value = null;
        }

        // Rafraîchir les versions
        if (selectedProduct.value) {
          await fetchProductVersions(selectedProduct.value.id);
        }

        removeVersionId.value = null;

        // Fermer le modal si disponible
        closeVersionDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isFetching.value = false;
      }
    };

    const updateTotalVersionItems = () => {
      if (productVersions.value) {
        totalVersionItems.value = productVersions.value.length;
      } else {
        totalVersionItems.value = 0;
      }
    };

    const saveNewVersion = async () => {
      if (!newVersion.value.version || !selectedProduct.value) {
        alertService.showInfo('La version et le produit sont requis', { variant: 'danger' });
        return;
      }

      try {
        // Préparer les données pour l'API
        const versionData = {
          ...newVersion.value,
          product: { id: selectedProduct.value.id },
          infraComponentVersions: versionInfraComponents.value,
          moduleVersions: versionModuleVersions.value,
        };

        console.log(versionData);

        // Créer la version
        await productVersionService().create(versionData);

        // Réinitialiser le formulaire
        showAddVersionRow.value = false;
        newVersion.value = {
          version: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
          product: null,
          moduleVersions: [],
          infraComponentVersions: [],
          root: null,
        };

        // Rafraîchir les versions
        await fetchProductVersions(selectedProduct.value.id);

        alertService.showInfo('Version créée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewVersion = () => {
      showAddVersionRow.value = false;

      // Reset form
      newVersion.value = {
        version: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
        product: null,
        moduleVersions: [],
        infraComponentVersions: [],
        root: null,
      };
    };

    // Module methods
    const getModuleById = id => {
      return moduleOptions.value.find(module => module.id === Number.parseInt(id));
    };

    const getInfraComponentById = id => {
      return infraComponentVersionOptions.value.find(component => component.id === Number.parseInt(id));
    };

    const getModuleVersionById = id => {
      return moduleVersionOptions.value.find(moduleVersion => moduleVersion.id === Number.parseInt(id));
    };

    // Module versions modal methods
    const openModuleVersionsModal = async module => {
      // Si nous sommes dans le contexte d'une version de produit, nous devons obtenir le module complet
      if (selectedVersion.value) {
        // Trouver le module complet à partir de l'ID
        const fullModule = moduleOptions.value.find(m => m.id === module.id);
        if (fullModule) {
          selectedModule.value = fullModule;
        } else {
          selectedModule.value = module;
        }
      } else {
        selectedModule.value = module;
      }

      await fetchModuleVersions(selectedModule.value.id);
      showModuleVersionsModal.value = true;
    };

    const closeModuleVersionsModal = () => {
      showModuleVersionsModal.value = false;
      selectedModule.value = null;
      showAddModuleVersionRow.value = false;
      moduleVersions.value = [];
      showFeaturesTable.value = false;
      selectedModuleVersion.value = null;
    };

    const closeFeatureModule = () => {
      showFeaturesTable.value = false;
    };

    // Module version methods
    const editModuleVersion = version => {
      // Implement module version editing
      version.isEditing = true;
      version.originalData = { ...version };
    };

    const saveEditModuleVersion = async version => {
      try {
        await moduleVersionService().update(version);
        version.isEditing = false;
        version.originalData = { ...version };

        // Refresh versions
        if (selectedModule.value) {
          await fetchModuleVersions(selectedModule.value.id);
        }

        alertService.showInfo('Version du module mise à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditModuleVersion = version => {
      Object.assign(version, version.originalData);
      version.isEditing = false;
    };

    const saveNewModuleVersion = async () => {
      if (!newModuleVersion.value.version || !selectedModule.value) {
        alertService.showInfo('La version et le module sont requis', { variant: 'danger' });
        return;
      }

      try {
        // Prepare data for API
        const versionData = {
          ...newModuleVersion.value,
          module: { id: selectedModule.value.id },
        };

        // Create the version
        await moduleVersionService().create(versionData);

        // Reset the form
        showAddModuleVersionRow.value = false;
        newModuleVersion.value = {
          version: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
          module: null,
          features: [],
        };

        // Refresh versions
        await fetchModuleVersions(selectedModule.value.id);

        alertService.showInfo('Version du module créée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewModuleVersion = () => {
      showAddModuleVersionRow.value = false;

      // Reset form
      newModuleVersion.value = {
        version: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
        module: null,
        features: [],
      };
    };

    const removeModuleVersion = async index => {
      try {
        const versionToRemove = moduleVersions.value[index];

        // Delete the version
        await moduleVersionService().delete(versionToRemove.id);

        // Refresh versions
        if (selectedModule.value) {
          await fetchModuleVersions(selectedModule.value.id);
        }

        alertService.showInfo('Version du module supprimée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Module management methods
    const saveNewModule = async () => {
      if (!newModule.value.name) {
        alertService.showInfo('Le nom du module est requis', { variant: 'danger' });
        return;
      }

      try {
        // Create the module
        const moduleData = {
          ...newModule.value,
        };
        const result = await moduleService().create(moduleData);

        // Add the module to the product
        if (selectedProduct.value) {
          const updatedProduct = { ...selectedProduct.value };
          if (!updatedProduct.modules) {
            updatedProduct.modules = [];
          }
          updatedProduct.modules.push(result);
          await productService().update(updatedProduct);

          // Refresh product data
          await retrieveProducts();
          if (selectedProduct.value) {
            const refreshedProduct = products.value.find(p => p.id === selectedProduct.value.id);
            if (refreshedProduct) {
              selectedProduct.value = refreshedProduct;
            }
          }
        }

        // Reset the form
        showAddModuleRow.value = false;
        newModule.value = {
          name: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
        };

        // Refresh module options
        await fetchModuleOptions();

        alertService.showInfo('Module créé avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewModule = () => {
      showAddModuleRow.value = false;
      newModule.value = {
        name: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
      };
    };

    const editModule = module => {
      module.isEditing = true;
      module.originalData = { ...module };
    };

    const saveEditModule = async module => {
      try {
        await moduleService().update(module);
        module.isEditing = false;
        module.originalData = { ...module };

        // Refresh product data to update the module list
        if (selectedProduct.value) {
          await retrieveProducts();
          const refreshedProduct = products.value.find(p => p.id === selectedProduct.value.id);
          if (refreshedProduct) {
            selectedProduct.value = refreshedProduct;
          }
        }

        alertService.showInfo('Module mis à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditModule = module => {
      Object.assign(module, module.originalData);
      module.isEditing = false;
    };

    const prepareRemoveModule = module => {
      removeModuleId.value = module.id;
      if (removeModuleEntity.value) {
        removeModuleEntity.value.show();
      } else {
        if (confirm(`Êtes-vous sûr de vouloir supprimer le module ${module.name} ?`)) {
          removeModuleConfirm();
        }
      }
    };

    const closeModuleDialog = () => {
      if (removeModuleEntity.value) {
        removeModuleEntity.value.hide();
      }
    };

    const removeModuleConfirm = async () => {
      if (!removeModuleId.value) {
        alertService.showInfo('ID de module invalide', { variant: 'danger' });
        return;
      }

      try {
        isFetching.value = true;

        // Remove the module from the product first
        if (selectedProduct.value) {
          const updatedProduct = { ...selectedProduct.value };
          updatedProduct.modules = updatedProduct.modules.filter(m => m.id !== removeModuleId.value);
          await productService().update(updatedProduct);
        }

        // Then delete the module
        await moduleService().delete(removeModuleId.value);

        // Refresh product data
        await retrieveProducts();
        if (selectedProduct.value) {
          const refreshedProduct = products.value.find(p => p.id === selectedProduct.value.id);
          if (refreshedProduct) {
            selectedProduct.value = refreshedProduct;
          }
        }

        removeModuleId.value = null;
        closeModuleDialog();

        alertService.showInfo('Module supprimé avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isFetching.value = false;
      }
    };

    const openModuleSettings = module => {
      // Implement module settings
      alertService.showInfo('Fonctionnalité à implémenter', { variant: 'info' });
    };

    // Feature management methods
    const openModuleVersionFeaturesTable = async version => {
      selectedModuleVersion.value = version;
      await fetchFeatures(version.id);
      showFeaturesTable.value = true;
    };

    // Modifiez la fonction openModuleFeaturesModal pour stocker correctement le moduleVersion sélectionné
    const openModuleFeaturesModal = async moduleVersion => {
      selectedModuleVersion.value = moduleVersion;
      // Assurez-vous que moduleVersion a un ID avant de l'utiliser
      if (moduleVersion && moduleVersion.id) {
        await fetchFeatures(moduleVersion.id);
      } else {
        features.value = []; // Réinitialiser les features si aucun ID valide
      }
      showModuleFeaturesModal.value = true;
    };

    const closeModuleFeaturesModal = () => {
      showModuleFeaturesModal.value = false;
      selectedModuleVersion.value = null;
      features.value = [];
      showAddFeatureRow.value = false;
    };

    const editFeature = feature => {
      feature.isEditing = true;
      feature.originalData = { ...feature };
    };

    const saveEditFeature = async feature => {
      try {
        await featureService().update(feature);
        feature.isEditing = false;
        feature.originalData = { ...feature };

        // Refresh features
        if (selectedModuleVersion.value) {
          await fetchFeatures(selectedModuleVersion.value.id);
        }

        alertService.showInfo('Fonctionnalité mise à jour avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditFeature = feature => {
      Object.assign(feature, feature.originalData);
      feature.isEditing = false;
    };

    const saveNewFeature = async () => {
      if (!newFeature.value.name || !selectedModuleVersion.value) {
        alertService.showInfo('Le nom et le module version sont requis', { variant: 'danger' });
        return;
      }

      try {
        // Déterminer l'ID correct du moduleVersion
        let moduleVersionId;
        if (selectedModuleVersion.value.id) {
          moduleVersionId = selectedModuleVersion.value.id;
        } else if (selectedModuleVersion.value.module && selectedModuleVersion.value.module.id) {
          moduleVersionId = selectedModuleVersion.value.module.id;
        } else {
          alertService.showInfo('ID de module version invalide', { variant: 'danger' });
          return;
        }

        // Prepare data for API
        const featureData = {
          ...newFeature.value,
          moduleVersion: { id: moduleVersionId },
        };

        // Create the feature
        const createdFeature = await featureService().create(featureData);

        // Récupérer la version actuelle du module pour avoir tous les champs nécessaires
        const currentModuleVersion = await moduleVersionService().find(moduleVersionId);

        // Préparer les données pour la mise à jour du moduleVersion
        const updatedFeatures = currentModuleVersion.features ? [...currentModuleVersion.features, createdFeature] : [createdFeature];

        const updateModuleVersionData = {
          ...currentModuleVersion,
          features: updatedFeatures,
        };

        // Mettre à jour le moduleVersion avec la nouvelle liste de features
        await moduleVersionService().update(updateModuleVersionData);

        // Reset the form
        showAddFeatureRow.value = false;
        newFeature.value = {
          name: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          moduleVersion: null,
        };

        // Refresh features with the correct moduleVersionId
        await fetchFeatures(moduleVersionId);

        alertService.showInfo('Fonctionnalité créée avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewFeature = () => {
      showAddFeatureRow.value = false;
      newFeature.value = {
        name: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        moduleVersion: null,
      };
    };

    const removeFeature = async index => {
      try {
        const featureToRemove = features.value[index];

        if (!selectedModuleVersion.value || !selectedModuleVersion.value.id) {
          alertService.showInfo('Module version non valide', { variant: 'danger' });
          return;
        }

        // Étape 1: Récupérer la version actuelle du module
        const moduleVersionId = selectedModuleVersion.value.id;
        const currentModuleVersion = await moduleVersionService().find(moduleVersionId);

        // Étape 2: Mettre à jour la liste des features en retirant le feature à supprimer
        const updatedFeatures = currentModuleVersion.features.filter(f => f.id !== featureToRemove.id);

        // Étape 3: Mettre à jour le moduleVersion avec la nouvelle liste de features
        const updateModuleVersionData = {
          ...currentModuleVersion,
          features: updatedFeatures,
        };

        // Étape 4: Sauvegarder la version du module mise à jour
        await moduleVersionService().update(updateModuleVersionData);

        // Étape 5: Supprimer le feature
        await featureService().delete(featureToRemove.id);

        // Étape 6: Rafraîchir la liste des features
        await fetchFeatures(moduleVersionId);

        alertService.showInfo('Fonctionnalité supprimée avec succès', { variant: 'success' });
      } catch (error) {
        console.error('Erreur lors de la suppression du feature:', error);
        // Gestion améliorée des erreurs
        if (error.response) {
          alertService.showHttpError(error.response);
        } else {
          alertService.showInfo('Une erreur est survenue lors de la suppression de la fonctionnalité', {
            variant: 'danger',
          });
        }
      }
    };

    const returnToProductList = () => {
      selectedProduct.value = null;
      selectedVersion.value = null;
      productVersions.value = [];
    };

    // Vercel Tabs functionality
    const setHoveredIndex = index => {
      hoveredIndex.value = index;
      if (index !== null && tabRefs[index]) {
        const hoveredElement = tabRefs[index];
        const { offsetLeft, offsetWidth } = hoveredElement;
        hoverStyle.value = {
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        };
      }
    };

    const setActiveTabIndex = index => {
      activeTabIndex.value = index;
      if (tabRefs[index]) {
        const activeElement = tabRefs[index];
        const { offsetLeft, offsetWidth } = activeElement;
        activeStyle.value = {
          left: `${offsetLeft}px`,
          width: `${offsetWidth}px`,
        };
      }
    };

    // Initialize
    onMounted(async () => {
      await retrieveProducts();
      await fetchProductLineOptions();
      await fetchInfraComponentVersionOptions();
      await fetchInfraComponents();
      await fetchComponentTypes();
      await fetchModuleOptions();
      await fetchModuleVersionOptions();

      // Initialize tabs
      nextTick(() => {
        if (tabRefs[activeTabIndex.value]) {
          setActiveTabIndex(activeTabIndex.value);
        }
      });
    });

    // Watch for tab refs changes
    watch(
      () => tabRefs,
      () => {
        if (tabRefs[activeTabIndex.value]) {
          nextTick(() => {
            setActiveTabIndex(activeTabIndex.value);
          });
        }
      },
      { deep: true },
    );

    watch(selectedVersion, newVersion => {
      if (newVersion) {
        // Mettre à jour les configurations et modules en fonction de la version sélectionnée
        versionInfraComponents.value = newVersion.infraComponentVersions || [];
        versionModuleVersions.value = newVersion.moduleVersions || [];

        // Passer à l'onglet Configuration
        setActiveTabIndex(1);
      }
    });

    const newModuleInSettingsModal = ref({
      name: '',
      description: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
    });

    // Variable pour contrôler l'affichage du formulaire d'ajout de module
    const showNewModuleForm = ref(false);

    // Variable pour stocker les versions de modules déployées
    const expandedVersions = ref(new Set());

    // Fonction pour afficher/masquer les modules d'une version
    const toggleVersionModules = versionId => {
      if (expandedVersions.value.has(versionId)) {
        expandedVersions.value.delete(versionId);
      } else {
        expandedVersions.value.add(versionId);
      }
    };

    // Fonction pour ajouter un nouveau module depuis le modal de paramètres
    const addNewModuleFromSettingsModal = async () => {
      if (!newModuleInSettingsModal.value.name) {
        alertService.showInfo('Le nom du module est requis', { variant: 'danger' });
        return;
      }

      try {
        // Création du module
        const moduleData = {
          ...newModuleInSettingsModal.value,
        };
        const result = await moduleService().create(moduleData);

        // Ajout du module à la liste des options
        moduleOptions.value.push(result);

        // Sélection automatique du nouveau module créé
        selectedModuleVersionId.value = result.id.toString();

        // Réinitialisation du formulaire
        newModuleInSettingsModal.value = {
          name: '',
          description: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
        };

        showNewModuleForm.value = false;

        alertService.showInfo('Module créé avec succès', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Fonction pour annuler l'ajout d'un nouveau module
    const cancelNewModuleInSettings = () => {
      showNewModuleForm.value = false;
      newModuleInSettingsModal.value = {
        name: '',
        description: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
      };
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
    return {
      t$,
      getModuleVersionWithModuleCached,
      newModuleInSettingsModal,
      showNewModuleForm,
      expandedVersions,
      toggleVersionModules,
      addNewModuleFromSettingsModal,
      cancelNewModuleInSettings,
      products,
      isFetching,
      removeId,
      removeEntity,
      searchTerm,
      currentPage,
      itemsPerPage,
      totalItems,
      selectedProduct,
      selectedVersion,
      selectedModule,
      showModuleVersionsModal,
      activeTabIndex,
      tabs,
      tabRefs,
      hoveredIndex,
      hoverStyle,
      activeStyle,
      showAddVersionRow,
      showAddModuleVersionRow,
      showAddRow,
      showAddModuleRow,
      editingVersionData,
      isEditingVersion,
      productLineOptions,
      infraComponentVersionOptions,
      infraComponentOptions,
      componentTypeOptions,
      moduleOptions,
      moduleVersionOptions,
      selectedProductLineIds,
      editProductLineIds,
      showSettingsModal,
      showModuleSelector,
      showInfraSelector,
      selectedModuleVersionId,
      selectedInfraComponentId,
      productInfraComponents,
      productModules,
      showVersionSettingsModal,
      showVersionModuleSelector,
      showVersionInfraSelector,
      selectedVersionModuleId,
      selectedVersionInfraComponentId,
      versionInfraComponents,
      versionModuleVersions,
      editingVersion,
      productVersions,
      removeVersionId,
      removeVersionEntity,
      currentVersionPage,
      itemsPerVersionPage,
      totalVersionItems,
      moduleVersions,
      selectedModuleVersion,
      removeModuleId,
      removeModuleEntity,
      features,
      showFeaturesTable,
      showAddFeatureRow,
      showModuleFeaturesModal,
      newProduct,
      newVersion,
      newModuleVersion,
      newModule,
      newFeature,
      filteredProducts,
      paginatedProducts,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      paginatedVersions,
      totalVersionPages,
      isVersionPrevDisabled,
      isVersionNextDisabled,
      versionPaginationInfo,
      getFilteredInfraComponents,
      getFilteredModules,
      retrieveProducts,
      fetchProductLineOptions,
      fetchInfraComponentVersionOptions,
      fetchModuleOptions,
      fetchModuleVersionOptions,
      handleSyncList,
      prepareRemove,
      closeDialog,
      removeProduct,
      handleSearch,
      goToPrevPage,
      goToNextPage,
      updateTotalItems,
      formatDate,
      toggleProductSelection,
      toggleVersionSelection,
      fetchProductVersions,
      fetchModuleVersions,
      fetchFeatures,
      openSettingsModal,
      openProductSettings,
      closeSettingsModal,
      saveSettingsModal,
      openVersionSettings,
      openVersionSettingsFromEdit,
      openNewVersionSettings,
      closeVersionSettingsModal,
      saveVersionSettingsModal,
      addModuleToProduct,
      removeModuleFromProduct,
      addInfraToProduct,
      removeInfraFromProduct,
      addModuleToVersion,
      removeModuleFromVersion,
      addInfraToVersion,
      removeInfraFromVersion,
      editProduct,
      cancelEdit,
      saveEditProduct,
      updateProductLines,
      updateEditProductLines,
      removeProductLine,
      removeEditProductLine,
      saveNewProduct,
      cancelNewProduct,
      editVersion,
      saveEditVersion,
      cancelEditVersion,
      prepareRemoveVersion,
      closeVersionDialog,
      removeProductVersion,
      updateTotalVersionItems,
      saveNewVersion,
      cancelNewVersion,
      getModuleById,
      getInfraComponentById,
      getModuleVersionById,
      openModuleVersionsModal,
      closeModuleVersionsModal,
      editModuleVersion,
      saveEditModuleVersion,
      cancelEditModuleVersion,
      saveNewModuleVersion,
      cancelNewModuleVersion,
      removeModuleVersion,
      saveNewModule,
      cancelNewModule,
      editModule,
      saveEditModule,
      cancelEditModule,
      prepareRemoveModule,
      closeModuleDialog,
      removeModuleConfirm,
      openModuleSettings,
      openModuleVersionFeaturesTable,
      openModuleFeaturesModal,
      closeModuleFeaturesModal,
      closeFeatureModule,
      editFeature,
      saveEditFeature,
      cancelEditFeature,
      saveNewFeature,
      cancelNewFeature,
      removeFeature,
      returnToProductList,
      setHoveredIndex,
      setActiveTabIndex,
      dataUtils,
    };
  },
});
