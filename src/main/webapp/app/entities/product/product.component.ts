import { type Ref, defineComponent, inject, onMounted, ref, reactive, computed, watch, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import ProductService from './product.service';
import ProductVersionService from '@/entities/product-version/product-version.service';
import ModuleService from '@/entities/module/module.service';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import DomaineService from '@/entities/domaine/domaine.service';
import { type IDomaine } from '@/shared/model/domaine.model';
import FeatureService from '@/entities/feature/feature.service';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';
import ProductLineService from '@/entities/product-line/product-line.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';
import ComponentTypeService from '@/entities/component-type/component-type.service.ts';
import InfraComponentService from '@/entities/infra-component/infra-component.service.ts';
import type { IInfraComponent } from '@/shared/model/infra-component.model.ts';
import type { IComponentType } from '@/shared/model/component-type.model.ts';
import CertificationService from '@/entities/certification/certification.service.ts';
import CertificationVersionService from '@/entities/certification/certification-version.service.ts';
import ClientCertificationService from '@/entities/client-certification/client-certification.service.ts';
import type AccountService from '@/account/account.service.ts';
import { useRouter } from 'vue-router';
import jsPDF from 'jspdf';
import S2MLogo from '@/../content/images/bgImage.png';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Product',
  setup() {
    // Breadcrumb navigation
    const breadcrumb = ref([{ name: 'Products', id: null }]);

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
    const certificationService = inject('certificationService', () => new CertificationService());
    const certificationVersionService = inject('certificationVersionService', () => new CertificationVersionService());
    const clientCertificationService = inject('clientCertificationService', () => new ClientCertificationService());

    const domaineService = inject('domaineService', () => new DomaineService());

    const accountService = inject<AccountService>('accountService');
    const alertService = inject('alertService', () => useAlertService(), true);

    // Data
    const hasAnyAuthorityValues: Ref<any> = ref({});
    const products = ref([]);
    const allProducts = ref([]);
    const isFetching = ref(false);
    const removeId = ref(null);
    const removeEntity = ref(null);
    const searchTerm = ref('');
    const searchTimeout = ref(null);
    const currentPage = ref(1);
    const itemsPerPage = ref(20);
    const totalItems = ref(0);
    const selectedProduct = ref(null);
    const selectedVersion = ref(null);
    const selectedModule = ref(null);
    const showModuleVersionsModal = ref(false);
    const activeTabIndex = ref(0);
    const tabs = ref(['Product Versions']);
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
    const certificationsOptions = ref([]);
    const certificationsOptionsVersions = ref([]);
    const selectedProductLineIds = ref([]);
    const editProductLineIds = ref([]);

    const viewTabs = ref(false);

    // Product settings modal
    const showSettingsModal = ref(false);
    const showCertificationsModal = ref(false);
    const showModuleSelector = ref(false);
    const showCertificationSelector = ref(false);
    const showInfraSelector = ref(false);
    const selectedModuleVersionId = ref('');
    const selectedCertificationId = ref('');
    const selectedInfraComponentId = ref('');
    const productInfraComponents = ref([]);
    const productModules = ref([]);
    const productCertifications = ref([]);

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

    const selectedModuleId = ref('');
    const filteredModuleVersionOptions = ref([]);

    const showAddModuleVersionForm = ref(false);
    const selectedProductLineFilter = ref(null);

    const isEditingModuleVersion = ref(false);
    const editingModuleVersionData = ref(null);

    // Delete modals
    const showVersionDeleteModal = ref(false);
    const showModuleVersionDeleteModal = ref(false);
    const versionToDelete = ref(null);
    const moduleVersionToDelete = ref(null);

    const domaines: Ref<IDomaine[]> = ref([]);

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
      certifications: [],
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

    const filteredProducts = computed(() => {
      let filtered = allProducts.value;

      // Apply product line filter
      if (selectedProductLineFilter.value) {
        filtered = filtered.filter(product => product.productLines?.some(line => line.id === selectedProductLineFilter.value));
      }

      // Apply search filter
      if (searchTerm.value) {
        const term = searchTerm.value.toLowerCase();
        filtered = filtered.filter(
          product => product.name?.toLowerCase().includes(term) || product.description?.toLowerCase().includes(term),
        );
      }

      return filtered;
    });

    const applyFilters = () => {
      currentPage.value = 1; // Reset to first page when filters change
      updateTotalItems(); // Update pagination
    };
    const resetFilters = () => {
      selectedProductLineFilter.value = null;
      searchTerm.value = '';
      currentPage.value = 1;
      updateTotalItems();
    };

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
            description: mv.description,
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

    const retrieveCertificationsVersions = async () => {
      try {
        const res = await certificationVersionService().retrieve();
        certificationsOptionsVersions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveCertifications = async () => {
      try {
        const res = await certificationService().retrieve();
        certificationsOptions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
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
        console.log('all modules :', res.data);
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const fetchDomaines = async () => {
      try {
        const res = await domaineService().retrieve();
        domaines.value = res.data;
        console.log('all domaines :', res.data);
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
      removeEntity.value = true;
    };

    const closeDialog = () => {
      removeEntity.value = false;
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
        applyFilters();
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
        viewTabs.value = false;
      } else {
        selectedProduct.value = product;
        selectedVersion.value = null;
        viewTabs.value = true;

        // Update breadcrumb
        breadcrumb.value = [
          { name: 'Products', id: null },
          { name: product.name, id: product.id },
        ];

        // Fetch product versions
        await fetchProductVersions(product.id);
      }
    };

    // Select a version
    const selectVersion = version => {
      selectedVersion.value = version;
      activeTabIndex.value = 0;

      // Update breadcrumb
      breadcrumb.value = [
        { name: 'Products', id: null },
        { name: version.product.name, id: version.product.id },
        { name: `Version ${version.version}`, id: version.id },
      ];
    };

    // Return to versions list
    const returnToVersionsList = () => {
      selectedVersion.value = null;

      // Update breadcrumb
      if (selectedProduct.value) {
        breadcrumb.value = [
          { name: 'Products', id: null },
          { name: selectedProduct.value.name, id: selectedProduct.value.id },
        ];
      }
    };

    // Navigate to specific breadcrumb level
    const navigateToBreadcrumb = index => {
      if (index === 0) {
        returnToProductList();
      } else if (index === 1 && breadcrumb.value.length > 2) {
        returnToVersionsList();
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
      productModules.value = newProduct.value.modules || [];
      showSettingsModal.value = true;
    };

    const openProductSettings = product => {
      selectedProduct.value = product;
      productModules.value = product.modules || [];
      showSettingsModal.value = true;
    };

    const openCertifications = product => {
      selectedProduct.value = product;
      loadProductClientCertifications(product.id);
      showCertificationsModal.value = true;
    };

    const loadProductClientCertifications = async productId => {
      try {
        const res = await clientCertificationService().retrieve();
        console.log('testttt :', res.data);
        // Filter client certifications for this specific product
        productCertifications.value = res.data.filter(clientCert => clientCert.product && clientCert.product.id === productId);
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const closeCertificationsModal = () => {
      showCertificationsModal.value = false;
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
          selectedProduct.value.modules = productModules.value;
          await productService().update(selectedProduct.value);
          await retrieveProducts();
        } else {
          // For new product
          newProduct.value.modules = productModules.value;
          newProduct.value.certifications = productCertifications.value;
        }
        closeSettingsModal();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveCertificationsModal = async () => {
      try {
        if (selectedProduct.value) {
          // The client certifications are already saved when added/removed
          await retrieveProducts(); // Refresh the products list
        }
        closeCertificationsModal();
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

    const openNewVersionSettings = async () => {
      if (newVersion.value.root && newVersion.value.root.id) {
        try {
          // Fetch the root product version details
          const rootVersion = await productVersionService().find(newVersion.value.root.id);

          // Initialize with root's configuration
          versionInfraComponents.value = rootVersion.infraComponentVersions
            ? rootVersion.infraComponentVersions.map(icv => ({
                ...icv,
                id: icv.id,
              }))
            : [];

          versionModuleVersions.value = rootVersion.moduleVersions
            ? rootVersion.moduleVersions.map(mv => ({
                ...mv,
                id: mv.id,
              }))
            : [];
        } catch (error) {
          alertService.showHttpError(error.response);
        }
      } else {
        // Initialize with empty arrays if no root is selected
        versionInfraComponents.value = [];
        versionModuleVersions.value = [];
      }
      showVersionSettingsModal.value = true;
    };

    const closeVersionSettingsModal = () => {
      showVersionSettingsModal.value = false;
      showVersionModuleSelector.value = false;
      showVersionInfraSelector.value = false;
      selectedVersionModuleId.value = '';
      selectedVersionInfraComponentId.value = '';
      selectedModuleId.value = ''; // Réinitialiser le module sélectionné
      filteredModuleVersionOptions.value = []; // Réinitialiser les versions filtrées
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

    const addCertificationToProduct = async () => {
      if (!selectedCertificationId.value || !selectedProduct.value) return;

      const certificationVersion = getCertificationById(selectedCertificationId.value);
      if (certificationVersion) {
        try {
          const newClientCertification = {
            certification: `${certificationVersion.certification.name}`,
            certificationDate: new Date(),
            createDate: new Date(),
            client: null, // The client is actually the product in this context
            certificationVersion: certificationVersion,
            product: selectedProduct.value, // Associate with the current product
            productDeployements: null,
          };

          const res = await clientCertificationService().create(newClientCertification);

          // Add to local array
          productCertifications.value.push(res.data);
          selectedCertificationId.value = '';

          await loadProductClientCertifications(selectedProduct.value.id);
        } catch (error) {
          alertService.showHttpError(error.response);
        }
      }
    };

    const removeCertificationFromProduct = async index => {
      try {
        const clientCertification = productCertifications.value[index];
        if (clientCertification.id) {
          await clientCertificationService().delete(clientCertification.id);
        }
        productCertifications.value.splice(index, 1);
      } catch (error) {
        alertService.showHttpError(error.response);
      }
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

    // méthode pour récupérer les versions du module sélectionné
    const fetchModuleVersionsForSelectedModule = async () => {
      if (!selectedModuleId.value) {
        filteredModuleVersionOptions.value = [];
        selectedVersionModuleId.value = '';
        return;
      }

      const res = await moduleVersionService().retrieve();
      filteredModuleVersionOptions.value = res.data.filter(pv => pv.module?.id === selectedModuleId.value);

      selectedVersionModuleId.value = '';

      console.log('result', filteredModuleVersionOptions);
    };

    const addModuleToVersion = () => {
      if (!selectedVersionModuleId.value) return;

      const moduleVersion = filteredModuleVersionOptions.value.find(mv => mv.id === Number.parseInt(selectedVersionModuleId.value));
      if (moduleVersion) {
        const exists = versionModuleVersions.value.some(mv => mv.id === moduleVersion.id);
        if (!exists) {
          versionModuleVersions.value.push(moduleVersion);
        }
        // Réinitialiser les sélections
        selectedVersionModuleId.value = '';
        selectedModuleId.value = '';
        filteredModuleVersionOptions.value = [];
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
          certifications: [],
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
        certifications: [],
      };
      selectedProductLineIds.value = [];
    };

    // Version management methods
    const editVersion = version => {
      editingVersionData.value = { ...version };
      isEditingVersion.value = true;
    };

    const saveEditVersion = async version => {
      if (!editingVersionData.value) return;

      try {
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
      removeVersionEntity.value = true;
    };

    const closeVersionDialog = () => {
      if (removeVersionEntity.value) {
        removeVersionEntity.value = false;
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
        //   alertService.showInfo(message, { variant: 'success' });

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

    const handleNewImageUpload = event => {
      const file = event.target.files[0];
      if (!file) return;

      // Validate file type
      if (!file.type.startsWith('image/')) {
        alertService.showInfo('Veuillez sélectionner une image valide', { variant: 'danger' });
        return;
      }

      // Validate file size (e.g., max 5MB)
      const maxSize = 5 * 1024 * 1024; // 5MB in bytes
      if (file.size > maxSize) {
        alertService.showInfo("L'image ne doit pas dépasser 5 Mo", { variant: 'danger' });
        return;
      }

      const reader = new FileReader();
      reader.onload = () => {
        newProduct.value.logo = reader.result; // Base64 string
      };
      reader.onerror = () => {
        alertService.showInfo("Erreur lors du chargement de l'image", { variant: 'danger' });
      };
      reader.readAsDataURL(file);
    };

    const fetchLatestNonClientVersion = async () => {
      try {
        // Regular expression to match X.X.X format and exclude unNom_X.X.X
        const versionRegex = /^\d+\.\d+\.\d+$/;
        const clientVersionRegex = /^[a-zA-Z]+_\d+\.\d+\.\d+$/;

        // Filter non-client versions (X.X.X) and exclude client versions (unNom_X.X.X)
        const nonClientVersions = productVersions.value.filter(
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

    const incrementVersion = rootVersion => {
      if (!rootVersion || !rootVersion.version) {
        // If no root version exists, start with 1.0.0
        return '1.0.0';
      }
      let [major, minor, patch] = rootVersion.version.split('.').map(Number);
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

    const showAddVersionLigne = async () => {
      showAddVersionRow.value = true;
      const latestVersion = await fetchLatestNonClientVersion();
      newVersion.value.root = latestVersion;
      newVersion.value.version = incrementVersion(latestVersion);
      newVersion.value.moduleVersions = [];
      newVersion.value.infraComponentVersions = [];
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
        // Prepare data for API
        const versionData = {
          ...newVersion.value,
          product: { id: selectedProduct.value.id },
          infraComponentVersions: versionInfraComponents.value.map(icv => ({ id: icv.id })), // Send only IDs
          moduleVersions: versionModuleVersions.value.map(mv => ({ id: mv.id })), // Send only IDs
        };

        // Create the version
        await productVersionService().create(versionData);

        // Reset the form
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
        versionInfraComponents.value = [];
        versionModuleVersions.value = [];

        // Refresh versions
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

    const updateRootConfiguration = async () => {
      if (newVersion.value.root && newVersion.value.root.id) {
        try {
          const rootVersion = await productVersionService().find(newVersion.value.root.id);
          versionInfraComponents.value = rootVersion.infraComponentVersions
            ? rootVersion.infraComponentVersions.map(icv => ({
                ...icv,
                id: icv.id,
              }))
            : [];
          versionModuleVersions.value = rootVersion.moduleVersions
            ? rootVersion.moduleVersions.map(mv => ({
                ...mv,
                id: mv.id,
              }))
            : [];
        } catch (error) {
          alertService.showHttpError(error.response);
        }
      } else {
        versionInfraComponents.value = [];
        versionModuleVersions.value = [];
      }
    };

    // Module methods
    const getModuleById = id => {
      return moduleOptions.value.find(module => module.id === Number.parseInt(id));
    };

    const getCertificationById = id => {
      return certificationsOptionsVersions.value.find(cert => cert.id === Number.parseInt(id));
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
    const editModuleVersion = moduleVersion => {
      editingModuleVersionData.value = { ...moduleVersion };
      isEditingModuleVersion.value = true;
    };

    const prepareRemoveModuleVersion = moduleVersion => {
      moduleVersionToDelete.value = moduleVersion;
      showModuleVersionDeleteModal.value = true;
    };

    const saveEditModuleVersion = async moduleVersion => {
      if (!editingModuleVersionData.value) return;

      try {
        // Simulate API call
        console.log('Saving module version:', editingModuleVersionData.value);

        // Update the module version in the selected version
        if (selectedVersion.value && selectedVersion.value.moduleVersions) {
          const index = selectedVersion.value.moduleVersions.findIndex(mv => mv.id === moduleVersion.id);
          if (index !== -1) {
            selectedVersion.value.moduleVersions[index] = { ...editingModuleVersionData.value };
          }
        }

        isEditingModuleVersion.value = false;
        editingModuleVersionData.value = null;
        alertService.showInfo('Module Version updated successfully.', { variant: 'success' });
      } catch (error) {
        console.error('Error saving module version:', error);
        alertService.showError('Error saving Module Version.', { variant: 'error' });
      }
    };

    const cancelEditModuleVersion = () => {
      isEditingModuleVersion.value = false;
      editingModuleVersionData.value = null;
    };

    const closeModuleVersionDeleteModal = () => {
      showModuleVersionDeleteModal.value = false;
      moduleVersionToDelete.value = null;
    };

    const confirmRemoveModuleVersion = async () => {
      if (!moduleVersionToDelete.value) return;

      try {
        // Simulate API call
        console.log('Deleting module version:', moduleVersionToDelete.value);

        // Remove from selected version's module versions
        if (selectedVersion.value && selectedVersion.value.moduleVersions) {
          selectedVersion.value.moduleVersions = selectedVersion.value.moduleVersions.filter(
            mv => mv.id !== moduleVersionToDelete.value.id,
          );
        }

        closeModuleVersionDeleteModal();
        alertService.showSuccess('Module Version deleted successfully.', { variant: 'success' });
      } catch (error) {
        console.error('Error deleting module version:', error);
        alertService.showError('Error deleting Module Version.', { variant: 'error' });
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
      removeModuleEntity.value = true;
    };

    const closeModuleDialog = () => {
      if (removeModuleEntity.value) {
        removeModuleEntity.value = false;
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

        // alertService.showInfo('Module supprimé avec succès', { variant: 'success' });
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

    // Add to methods
    const toggleAddModuleVersionForm = () => {
      showAddModuleVersionForm.value = !showAddModuleVersionForm.value;
      if (!showAddModuleVersionForm.value) {
        cancelAddModuleVersionForm();
      }
    };

    const toggleAddModuleVersionRow = () => {
      showAddModuleVersionRow.value = !showAddModuleVersionRow.value;
      if (!showAddModuleVersionRow.value) {
        cancelAddModuleVersionRow();
      }
    };

    const saveNewModuleVersionAndAssign = async () => {
      if (!newModuleVersion.value.version || !newModuleVersion.value.module || !selectedVersion.value) {
        alertService.showInfo(t$('sdiFrontendApp.moduleVersion.requiredFields'), { variant: 'danger' });
        return;
      }

      try {
        // Prepare module version data
        const versionData = {
          ...newModuleVersion.value,
          module: { id: newModuleVersion.value.module.id },
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          features: [],
        };

        // Create the module version
        const createdModuleVersion = await moduleVersionService().create(versionData);

        // Update the product version with the new module version
        const updatedModuleVersions = [...(selectedVersion.value.moduleVersions || []), { id: createdModuleVersion.id }];
        const updatedVersion = {
          ...selectedVersion.value,
          moduleVersions: updatedModuleVersions,
        };

        await productVersionService().update(updatedVersion);

        // Refresh module versions and product versions
        await fetchModuleVersionOptions();
        await fetchProductVersions(selectedProduct.value.id);

        // Update selectedVersion to reflect changes
        selectedVersion.value = productVersions.value.find(v => v.id === selectedVersion.value.id) || selectedVersion.value;

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

        alertService.showInfo(t$('sdiFrontendApp.moduleVersion.createdAndAssigned'), { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelAddModuleVersionRow = () => {
      showAddModuleVersionRow.value = false;
      newModuleVersion.value = {
        version: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
        module: null,
        features: [],
      };
    };

    const cancelAddModuleVersionForm = () => {
      showAddModuleVersionForm.value = false;
      newModuleVersion.value = {
        version: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
        module: null,
        features: [],
      };
    };

    // Update existing saveNewModuleVersion (if needed) to avoid duplication
    const saveNewModuleVersion = async () => {
      if (!newModuleVersion.value.version || !selectedModule.value) {
        alertService.showInfo(t$('sdiFrontendApp.moduleVersion.requiredFields'), { variant: 'danger' });
        return;
      }

      try {
        const versionData = {
          ...newModuleVersion.value,
          module: { id: selectedModule.value.id },
        };
        await moduleVersionService().create(versionData);
        showAddModuleVersionRow.value = false;
        newModuleVersion.value = {
          version: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
          module: null,
          features: [],
        };
        await fetchModuleVersions(selectedModule.value.id);
        alertService.showInfo(t$('sdiFrontendApp.moduleVersion.created'), { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const moduleVersionSelected = ref(null);
    const openModuleFeaturesModal = async moduleVersion => {
      selectedModuleVersion.value = moduleVersion;
      // Assurez-vous que moduleVersion a un ID avant de l'utiliser
      if (moduleVersion && moduleVersion.id) {
        moduleVersionSelected.value = getModuleVersionWithModuleCached(moduleVersion.id).module.name + ' - v' + moduleVersion.version;
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
      viewTabs.value = false;
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
      await fetchDomaines();
      await fetchModuleVersionOptions();
      await retrieveCertifications();
      await retrieveCertificationsVersions();

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
        tabs.value = ['Modules Version', 'Configuration'];
        versionInfraComponents.value = newVersion.infraComponentVersions || [];
        versionModuleVersions.value = newVersion.moduleVersions || [];
      } else {
        tabs.value = ['Product Versions'];
      }
    });

    // In the setup function, add a watch for newVersion.root
    watch(
      () => newVersion.value.root,
      async newRoot => {
        if (newRoot && newRoot.id) {
          try {
            // Fetch the root product version details
            const rootVersion = await productVersionService().find(newRoot.id);

            // Update versionInfraComponents and versionModuleVersions with root's configuration
            versionInfraComponents.value = rootVersion.infraComponentVersions
              ? rootVersion.infraComponentVersions.map(icv => ({
                  ...icv,
                  id: icv.id, // Ensure ID is included
                }))
              : [];

            versionModuleVersions.value = rootVersion.moduleVersions
              ? rootVersion.moduleVersions.map(mv => ({
                  ...mv,
                  id: mv.id, // Ensure ID is included
                }))
              : [];

            alertService.showInfo('Configuration du root appliquée automatiquement', { variant: 'info' });
          } catch (error) {
            alertService.showHttpError(error.response);
          }
        } else {
          // Reset configurations if no root is selected
          versionInfraComponents.value = [];
          versionModuleVersions.value = [];
        }
      },
      { deep: true },
    );

    const newModuleInSettingsModal = ref({
      name: '',
      description: '',
      domaine: null,
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
          domaine: null,
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
        domaine: null,
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
      };
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

    const getCertificationCached = clientCertificationId => {
      const clientCertification = productCertifications.value.find(cc => cc.id === clientCertificationId);

      if (!clientCertification || !clientCertification.certificationVersion) return null;

      const certification = certificationsOptions.value.find(c => c.id === clientCertification.certificationVersion.certification?.id);

      return {
        ...clientCertification.certificationVersion,
        certification: certification ? { ...certification } : null,
      };
    };

    const activeVersionSettingsSection = ref('configuration');
    const showConfigurationSection = () => {
      activeVersionSettingsSection.value = 'configuration';
    };

    const showModulesSection = () => {
      activeVersionSettingsSection.value = 'modules';
    };

    const COMPANY_CONFIG = {
      name: 'S2M - Société Maghrébine de Monétique',
      font: 'Times',
      colors: {
        darkBlue: [12, 45, 87],
        black: [0, 0, 0],
        lightGray: [220, 220, 220],
        white: [255, 255, 255],
      },
    };

    const exportProductToPDF = async product => {
      try {
        const doc = new jsPDF();
        let yPosition = 20;
        const pageHeight = doc.internal.pageSize.height;
        const pageWidth = doc.internal.pageSize.width;
        const margin = 20;
        const footerHeight = 20;

        // Set default font
        doc.setFont(COMPANY_CONFIG.font);

        // Helper to add text with specific style
        const addStyledText = (text, x, y, options = {}) => {
          const {
            fontSize = 10,
            fontStyle = 'normal',
            color = COMPANY_CONFIG.colors.black,
            maxWidth = pageWidth - 2 * margin,
            align = 'left',
            lineHeight = 1.2,
          } = options;

          doc.setFontSize(fontSize);
          doc.setFont(COMPANY_CONFIG.font, fontStyle);
          doc.setTextColor(...color);

          const lines = doc.splitTextToSize(text || 'N/A', maxWidth);
          doc.text(lines, x, y, { align, lineHeightFactor: lineHeight });
          return lines.length * (fontSize * lineHeight * 0.35); // Approximate height
        };

        // Function to add the unique first page header
        const addFirstPageHeader = () => {
          doc.setFont(COMPANY_CONFIG.font);
          doc.setTextColor(...COMPANY_CONFIG.colors.darkBlue);

          // Product Name (Top Left)
          addStyledText(product.name, margin, 25, { fontSize: 20, fontStyle: 'bold' });
          // Subtitle below product name
          addStyledText('Product configuration report', margin, 35, { fontSize: 10, fontStyle: 'normal' });

          // S2M Logo (Top Right)
          doc.addImage(S2MLogo, 'PNG', pageWidth - 38, 17, 20, 15);

          // Company Name and Infos (Top Right)
          addStyledText(COMPANY_CONFIG.name, pageWidth - margin, 35, {
            fontSize: 10,
            fontStyle: 'bold',
            align: 'right',
          });

          // Contact infos
          addStyledText('+212 (0) 522 87 83 00', pageWidth - margin, 40, {
            fontSize: 9,
            align: 'right',
          });
          addStyledText('contact@s2m.ma', pageWidth - margin, 45, {
            fontSize: 9,
            align: 'right',
          });

          // Date (below contact infos)
          addStyledText(`${new Date().toLocaleDateString('fr-FR')}`, pageWidth - margin, 50, {
            fontSize: 8,
            align: 'right',
          });

          // Simple line separator
          doc.setDrawColor(...COMPANY_CONFIG.colors.darkBlue);
          doc.setLineWidth(0.5);
          doc.line(margin, 55, pageWidth - margin, 55);
        };

        // Function to add a generic header for subsequent pages
        const addGenericHeader = () => {
          doc.setFont(COMPANY_CONFIG.font);
          doc.setTextColor(...COMPANY_CONFIG.colors.darkBlue);
          doc.setFontSize(10);
          doc.setFont(undefined, 'bold');
          doc.text(product.name, margin, 20);
          doc.setFont(undefined, 'normal');
          doc.text(COMPANY_CONFIG.name, pageWidth - margin, 20, { align: 'right' });
          doc.setDrawColor(...COMPANY_CONFIG.colors.lightGray);
          doc.setLineWidth(0.2);
          doc.line(margin, 25, pageWidth - margin, 25);
        };

        // Function to add the footer
        const addBottomHeader = (productName, currentPage, totalPages) => {
          doc.setFont(COMPANY_CONFIG.font);
          doc.setTextColor(...COMPANY_CONFIG.colors.darkBlue);
          doc.setFontSize(9);

          // Line separator above the footer content
          doc.setDrawColor(...COMPANY_CONFIG.colors.lightGray);
          doc.setLineWidth(0.2);
          doc.line(margin, pageHeight - footerHeight + 5, pageWidth - margin, pageHeight - footerHeight + 5);

          // Product Name on the left
          addStyledText(productName, margin, pageHeight - footerHeight + 12, {
            fontSize: 9,
            fontStyle: 'bold',
            color: COMPANY_CONFIG.colors.darkBlue,
          });

          // Pagination on the right
          addStyledText(`Page ${currentPage} sur ${totalPages}`, pageWidth - margin, pageHeight - footerHeight + 12, {
            fontSize: 9,
            align: 'right',
            color: COMPANY_CONFIG.colors.darkBlue,
          });
        };

        // Function to add a section title
        const addSectionTitle = (title, y) => {
          doc.setFont(COMPANY_CONFIG.font, 'bold');
          doc.setTextColor(...COMPANY_CONFIG.colors.darkBlue);
          doc.setFontSize(14);
          doc.text(title, margin, y);
          doc.setDrawColor(...COMPANY_CONFIG.colors.lightGray);
          doc.setLineWidth(0.2);
          doc.line(margin, y + 5, pageWidth - margin, y + 5);
          return y + 15;
        };

        // Function to draw a small table with dynamic row heights
        const drawTable = (headers, data, startY, columnWidths) => {
          let currentY = startY;
          const cellPadding = 2;
          const headerHeight = 8;
          const minRowHeight = 7;

          // Draw header row
          doc.setFillColor(...COMPANY_CONFIG.colors.darkBlue);
          doc.rect(margin, currentY, pageWidth - 2 * margin, headerHeight, 'F');
          let currentX = margin;
          headers.forEach((header, i) => {
            addStyledText(header, currentX + cellPadding, currentY + cellPadding + 1, {
              fontSize: 8,
              fontStyle: 'bold',
              color: COMPANY_CONFIG.colors.white,
              maxWidth: columnWidths[i] - 2 * cellPadding,
            });
            currentX += columnWidths[i];
          });
          currentY += headerHeight;

          // Draw data rows
          data.forEach(row => {
            let maxCurrentRowContentHeight = 0;
            const contentStartY = currentY + cellPadding + 1;

            // Calculate max height needed for this row
            currentX = margin;
            headers.forEach((header, i) => {
              const cellText = row[header] || '';
              doc.setFontSize(8);
              doc.setFont(COMPANY_CONFIG.font, 'normal');
              const lines = doc.splitTextToSize(cellText, columnWidths[i] - 2 * cellPadding);
              const contentHeight = lines.length * (8 * 1.2 * 0.35);
              maxCurrentRowContentHeight = Math.max(maxCurrentRowContentHeight, contentHeight);
            });

            const actualRowHeight = Math.max(minRowHeight, maxCurrentRowContentHeight + 2 * cellPadding);

            // Check for page break before drawing the row
            checkPageBreak(actualRowHeight + 5);

            // Draw the row content
            currentX = margin;
            doc.setDrawColor(...COMPANY_CONFIG.colors.lightGray);
            doc.setLineWidth(0.1);
            doc.rect(margin, currentY, pageWidth - 2 * margin, actualRowHeight);

            headers.forEach((header, i) => {
              const cellText = row[header] || '';
              addStyledText(cellText, currentX + cellPadding, currentY + cellPadding + 1, {
                fontSize: 8,
                maxWidth: columnWidths[i] - 2 * cellPadding,
              });
              currentX += columnWidths[i];
            });
            currentY += actualRowHeight;
          });
          return currentY + 5;
        };

        // Function to add a new page if necessary
        const checkPageBreak = (requiredSpace = 20) => {
          if (yPosition + requiredSpace > pageHeight - margin - footerHeight) {
            doc.addPage();
            addGenericHeader();
            yPosition = 35;
            return true;
          }
          return false;
        };

        // Initial header for the first page
        addFirstPageHeader();
        yPosition = 70; // Ajusté pour laisser de l'espace après l'en-tête étendu

        // General Information
        yPosition = addSectionTitle('GENERALS INFORMATIONS', yPosition);

        // Description
        addStyledText('Description:', margin, yPosition, { fontStyle: 'bold' });
        yPosition += 5;
        yPosition += addStyledText(product.description, margin + 5, yPosition, { maxWidth: pageWidth - 2 * margin - 5 }) + 5;

        // Product Lines
        if (product.productLines && product.productLines.length > 0) {
          addStyledText('Product Lines:', margin, yPosition, { fontStyle: 'bold' });
          yPosition += 5;
          product.productLines.forEach(line => {
            addStyledText(`• ${line.name}`, margin + 10, yPosition);
            yPosition += 6;
          });
          yPosition += 5;
        }

        // Modules du produit
        if (product.modules && product.modules.length > 0) {
          checkPageBreak(30);
          addStyledText('Product Modules:', margin, yPosition, { fontStyle: 'bold' });
          yPosition += 5;
          product.modules.forEach(mod => {
            addStyledText(`• ${mod.name} (${mod.description || 'N/A'})`, margin + 10, yPosition);
            yPosition += 6;
          });
          yPosition += 5;
        }

        // Product Versions Section
        const versionsRes = await productVersionService().retrieve();
        const productVersionsList = versionsRes.data.filter(pv => pv.product?.id === product.id);

        if (productVersionsList.length > 0) {
          checkPageBreak(40);
          yPosition = addSectionTitle('PRODUCT VERSIONS', yPosition);

          for (const version of productVersionsList) {
            checkPageBreak(50);
            addStyledText(`${product.name} - ${version.version}`, margin, yPosition, {
              fontSize: 12,
              fontStyle: 'bold',
              color: COMPANY_CONFIG.colors.darkBlue,
            });
            addStyledText(`(Created: ${formatDate(version.createDate)})`, pageWidth - margin, yPosition, {
              fontSize: 9,
              align: 'right',
            });
            yPosition += 10;

            // Modules de cette version
            if (version.moduleVersions && version.moduleVersions.length > 0) {
              checkPageBreak(30);
              addStyledText('Modules Version:', margin + 5, yPosition, { fontStyle: 'bold' });
              yPosition += 10;

              const moduleTableHeaders = ['Module Name', 'Version', 'Features'];
              const moduleTableData = await Promise.all(
                version.moduleVersions.map(async mv => {
                  const moduleDetails = getModuleVersionWithModuleCached(mv.id);
                  let featuresText = 'N/A';
                  try {
                    const moduleRes = await moduleVersionService().find(mv.id);
                    if (moduleRes.features && moduleRes.features.length > 0) {
                      featuresText = moduleRes.features.map(f => f.name).join('\n');
                    }
                  } catch (error) {
                    console.warn('Could not fetch features for module:', mv.id);
                  }
                  return {
                    'Module Name': moduleDetails?.module?.name || 'N/A',
                    Version: mv.version || 'N/A',
                    Features: featuresText,
                  };
                }),
              );
              const moduleColumnWidths = [70, 30, pageWidth - 2 * margin - 100];
              yPosition = drawTable(moduleTableHeaders, moduleTableData, yPosition, moduleColumnWidths);
            }

            // Infrastructure Components
            if (version.infraComponentVersions && version.infraComponentVersions.length > 0) {
              checkPageBreak(30);
              addStyledText('Infrastructures Components Version:', margin + 5, yPosition, { fontStyle: 'bold' });
              yPosition += 10;

              const infraTableHeaders = ['Component Name', 'Version', 'Type'];
              const infraTableData = version.infraComponentVersions.map(comp => {
                const compDetails = getIfraComponentVersionWithInfraCached(comp.id);
                return {
                  'Component Name': compDetails?.infraComponent?.name || 'N/A',
                  Version: comp.version || 'N/A',
                  Type: compDetails?.infraComponent?.componentType?.type || 'N/A',
                };
              });
              const infraColumnWidths = [70, 30, pageWidth - 2 * margin - 100];
              yPosition = drawTable(infraTableHeaders, infraTableData, yPosition, infraColumnWidths);
            }
            yPosition += 10;
          }
        }
        // Certifications
        const res = await clientCertificationService().retrieve();
        product.certifications = res.data.filter(clientCert => clientCert.product && clientCert.product.id === product.id);

        if (product.certifications && product.certifications.length > 0) {
          checkPageBreak(40);
          yPosition = addSectionTitle('CERTIFICATIONS', yPosition);

          // Préparer les données pour la table
          const certificationHeaders = ['Certification', 'Version', 'Added At'];
          const certificationData = [];

          product.certifications.forEach(cert => {
            certificationData.push({
              Certification: cert.certification || 'N/A',
              Version: cert.certificationVersion?.version || 'N/A',
              'Added At': cert.certificationDate ? new Date(cert.certificationDate).toLocaleDateString() : 'N/A',
            });
          });

          // Définir les largeurs des colonnes (ajustées pour la largeur de page)
          const certificationColumnWidths = [80, 40, 50]; // Total: 170px sur une largeur de page de ~170px

          // Dessiner la table des certifications
          if (certificationData.length > 0) {
            yPosition = drawTable(certificationHeaders, certificationData, yPosition, certificationColumnWidths) + 10;
          }
        }

        // Add footer to all pages
        const totalPages = doc.internal.getNumberOfPages();
        for (let i = 1; i <= totalPages; i++) {
          doc.setPage(i);
          addBottomHeader(product.name, i, totalPages);
        }

        // Save the PDF
        const fileName = `S2M ${product.name.replace(/[^a-z0-9]/gi, ' ')}_${new Date().toISOString().split('T')[0]}.pdf`;
        doc.save(fileName);
      } catch (error) {
        console.error("Erreur lors de l'export PDF:", error);
        alertService.showInfo("Erreur lors de l'export PDF", { variant: 'danger' });
      }
    };

    const router = useRouter();
    const viewDashboard = product => {
      router.push({ path: '/DashProducts', query: { selected: product.name } });
    };

    return {
      t$,
      accountService,
      hasAnyAuthorityValues,
      activeVersionSettingsSection,
      showConfigurationSection,
      showModulesSection,
      handleNewImageUpload,
      breadcrumb,
      selectVersion,
      navigateToBreadcrumb,
      returnToVersionsList,
      getIfraComponentVersionWithInfraCached,
      getModuleVersionWithModuleCached,
      getCertificationCached,
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
      viewTabs,
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
      certificationsOptions,
      certificationsOptionsVersions,
      moduleVersionOptions,
      selectedProductLineIds,
      editProductLineIds,
      showSettingsModal,
      showModuleSelector,
      showCertificationSelector,
      showInfraSelector,
      selectedModuleVersionId,
      selectedCertificationId,
      selectedInfraComponentId,
      productInfraComponents,
      productModules,
      productCertifications,
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
      moduleVersionSelected,
      totalVersionItems,
      moduleVersions,
      selectedModuleVersion,
      removeModuleId,
      removeModuleEntity,
      features,
      domaines,
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
      selectedModuleId,
      filteredModuleVersionOptions,
      fetchModuleVersionsForSelectedModule,
      openVersionSettings,
      retrieveProducts,
      fetchProductLineOptions,
      fetchInfraComponentVersionOptions,
      fetchModuleOptions,
      fetchModuleVersionOptions,
      handleSyncList,
      prepareRemove,
      closeDialog,
      removeProduct,
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
      openCertifications,
      showCertificationsModal,
      closeCertificationsModal,
      saveSettingsModal,
      saveCertificationsModal,
      openVersionSettingsFromEdit,
      openNewVersionSettings,
      closeVersionSettingsModal,
      saveVersionSettingsModal,
      addModuleToProduct,
      addCertificationToProduct,
      removeModuleFromProduct,
      removeCertificationFromProduct,
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
      showAddVersionLigne,
      saveNewVersion,
      cancelNewVersion,
      updateRootConfiguration,
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
      showAddModuleVersionForm,
      toggleAddModuleVersionForm,
      saveNewModuleVersionAndAssign,
      cancelAddModuleVersionForm,
      toggleAddModuleVersionRow,
      cancelAddModuleVersionRow,
      dataUtils,
      selectedProductLineFilter,
      isEditingModuleVersion,
      editingModuleVersionData,
      showVersionDeleteModal,
      showModuleVersionDeleteModal,
      versionToDelete,
      moduleVersionToDelete,
      prepareRemoveModuleVersion,
      closeModuleVersionDeleteModal,
      confirmRemoveModuleVersion,
      applyFilters,
      resetFilters,
      handleSearch,
      exportProductToPDF,
      viewDashboard,
    };
  },
  methods: {
    hasAnyAuthority(authorities: any): boolean {
      this.accountService.hasAnyAuthorityAndCheckAuth(authorities).then(value => {
        if (this.hasAnyAuthorityValues[authorities] !== value) {
          this.hasAnyAuthorityValues = { ...this.hasAnyAuthorityValues, [authorities]: value };
        }
      });
      return this.hasAnyAuthorityValues[authorities] ?? false;
    },
  },
});
