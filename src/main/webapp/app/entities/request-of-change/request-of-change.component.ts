import { defineComponent, ref, onMounted, computed, reactive, nextTick, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { RequestOfChange } from '@/shared/model/request-of-change.model';
import { RequestStatus } from '@/shared/model/enumerations/request-status.model';
import RequestOfChangeService from '@/entities/request-of-change/request-of-change.service';
import ProductVersionService from '@/entities/product-version/product-version.service';
import ClientService from '@/entities/client/client.service';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import CustomisationLevelService from '@/entities/customisation-level/customisation-level.service';
import { useAlertService } from '@/shared/alert/alert.service';
import type { IModuleVersion } from '@/shared/model/module-version.model.ts';
import NewProductVersionPopup from './new-product-version/new-product-version-popup.vue';

export default defineComponent({
  name: 'RequestOfChangeManager',
  components: {
    NewProductVersionPopup,
  },
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const requestOfChangeService = new RequestOfChangeService();
    const productVersionService = new ProductVersionService();
    const clientService = new ClientService();
    const moduleVersionService = new ModuleVersionService();
    const customisationLevelService = new CustomisationLevelService();
    const alertService = useAlertService();

    // Data
    const requestOfChanges = ref<RequestOfChange[]>([]);
    const productVersions = ref([]);
    const clients = ref([]);
    const moduleVersions = ref<IModuleVersion[]>([]);
    const customisationLevels = ref([]);
    const searchTerm = ref('');
    const filteredRequests = ref([]);
    const isFetching = ref(false);
    const isSaving = ref(false);
    const showCreateModal = ref(false);
    const showModulesModal = ref(false);
    const showDeleteModal = ref(false);
    const selectedRequest = ref(null);
    const selectedModuleRequest = ref(null);
    const requestToDelete = ref(null);
    const currentStep = ref('');

    // Tab navigation
    const activeTabIndex = ref(0);
    const hoveredIndex = ref(null);
    const tabRefs = ref([]);
    const hoverStyle = reactive({ left: 0, width: 0 });
    const activeStyle = reactive({ left: 0, width: 0 });

    // New request form
    const newRequest = ref(new RequestOfChange());

    // State
    const showNewProductVersionPopup = ref(false);

    // Méthodes pour gérer le popup
    const openNewProductVersionPopup = () => {
      if (!selectedRequest.value) {
        alertService.showError('Aucune demande sélectionnée');
        return;
      }

      if (selectedRequest.value.status !== 'COMPLETED') {
        alertService.showError("La demande doit être à l'état COMPLETED pour créer une nouvelle version du produit");
        return;
      }

      if (!selectedRequest.value.productVersion || !selectedRequest.value.productVersion.product) {
        alertService.showError('Impossible de créer une nouvelle version du produit : informations manquantes');
        return;
      }

      showNewProductVersionPopup.value = true;
    };

    const closeNewProductVersionPopup = () => {
      showNewProductVersionPopup.value = false;
    };

    const handleProductCreated = product => {
      alertService.showInfo('Nouvelle version du produit créée avec succès', { variant: 'success' });
      closeNewProductVersionPopup();
      // Rafraîchir les données si nécessaire
      retrieveRequestOfChanges();
    };

    // Méthode pour sélectionner une demande
    const selectRequest = request => {
      selectedRequest.value = request;
    };

    // Tab configuration
    const statusTabs = [
      { label: 'Pending', value: 'PENDING' },
      { label: 'Approved', value: 'APPROVED' },
      { label: 'Rejected', value: 'REJECTED' },
      { label: 'Completed', value: 'COMPLETED' },
    ];

    // Computed
    const progressPercentage = computed(() => {
      if (!selectedRequest.value) return 0;

      switch (selectedRequest.value.status) {
        case 'PENDING':
          return 33;
        case 'APPROVED':
        case 'REJECTED':
          return 66;
        case 'COMPLETED':
          return 100;
        default:
          return 0;
      }
    });

    // Methods for tab navigation
    const updateTabStyles = () => {
      nextTick(() => {
        if (hoveredIndex.value !== null && tabRefs.value[hoveredIndex.value]) {
          const hoveredRect = tabRefs.value[hoveredIndex.value].getBoundingClientRect();
          const containerRect = tabRefs.value[0].parentElement.getBoundingClientRect();
          hoverStyle.left = hoveredRect.left - containerRect.left;
          hoverStyle.width = hoveredRect.width;
        }

        if (tabRefs.value[activeTabIndex.value]) {
          const activeRect = tabRefs.value[activeTabIndex.value].getBoundingClientRect();
          const containerRect = tabRefs.value[0].parentElement.getBoundingClientRect();
          activeStyle.left = activeRect.left - containerRect.left;
          activeStyle.width = activeRect.width;
        }
      });
    };

    const setHoveredIndex = index => {
      hoveredIndex.value = index;
      updateTabStyles();
    };

    const setActiveTabIndex = index => {
      activeTabIndex.value = index;
      updateTabStyles();
      selectedRequest.value = null;
    };

    // Methods for requests
    const retrieveRequestOfChanges = async () => {
      isFetching.value = true;
      try {
        const res = await requestOfChangeService.retrieve();
        requestOfChanges.value = res.data;

        requestOfChanges.value.forEach(request => {
          if (request.moduleVersions) {
            request.moduleVersions = request.moduleVersions.map(mv => {
              const full = moduleVersions.value.find(opt => opt.id === mv.id);
              return full ? full : mv;
            });
          }
        });
        requestOfChanges.value.forEach(request => {
          if (request.customisationLevel && request.customisationLevel.id) {
            const full = customisationLevels.value.find(cl => cl.id === request.customisationLevel.id);
            if (full) {
              request.customisationLevel = full;
            }
          }
        });
        requestOfChanges.value.forEach(request => {
          request.productVersion = productVersions.value.find(pv => pv.id === request.productVersion?.id);
        });
        filteredRequests.value = [...requestOfChanges.value];
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const getRequestsByStatus = status => {
      return (filteredRequests.value.length > 0 ? filteredRequests.value : requestOfChanges.value).filter(
        request => request.status === status,
      );
    };

    const getRequestCountByStatus = status => {
      return getRequestsByStatus(status).length;
    };

    const handleSearch = () => {
      if (!searchTerm.value.trim()) {
        filteredRequests.value = [...requestOfChanges.value];
        return;
      }

      const term = searchTerm.value.toLowerCase();
      filteredRequests.value = requestOfChanges.value.filter(
        request =>
          request.title.toLowerCase().includes(term) ||
          request.description.toLowerCase().includes(term) ||
          (request.client && request.client.code.toLowerCase().includes(term)),
      );
    };

    const handleSyncList = () => {
      retrieveRequestOfChanges();
    };

    const viewRequest = request => {
      router.push({ name: 'RequestOfChangeView', params: { requestOfChangeId: request.id } });
    };

    const editRequest = request => {
      newRequest.value = { ...request };
      showCreateModal.value = true;
    };

    // Toggle request selection with checkbox
    const toggleRequestSelection = async request => {
      if (selectedRequest.value && selectedRequest.value.id === request.id) {
        selectedRequest.value = null;
      } else {
        selectedRequest.value = request;
        const res = await productVersionService.retrieve();
        const matchedVersion = res.data.find(pv => pv.id === request.productVersion?.id);

        if (matchedVersion) {
          request.productVersion.product = matchedVersion.product;
        }

        console.log(request.productVersion);

        currentStep.value = request.status;
      }
    };

    // Deselect request
    const deselectRequest = () => {
      selectedRequest.value = null;
    };

    const viewRequestModules = request => {
      selectedModuleRequest.value = { ...request };
      showModulesModal.value = true;
    };

    const closeModulesModal = () => {
      showModulesModal.value = false;
      selectedModuleRequest.value = null;
    };

    const prepareRemove = request => {
      requestToDelete.value = request;
      showDeleteModal.value = true;
    };

    const closeDeleteModal = () => {
      showDeleteModal.value = false;
      requestToDelete.value = null;
    };

    const confirmDelete = async () => {
      if (!requestToDelete.value) return;

      try {
        await requestOfChangeService.delete(requestToDelete.value.id);
        alertService.showSuccess(t$('sdiFrontendApp.requestOfChange.deleted', { param: requestToDelete.value.title }).toString());
        await retrieveRequestOfChanges();
        closeDeleteModal();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const openCreateRequestModal = () => {
      newRequest.value = new RequestOfChange();
      // Définir des valeurs par défaut
      newRequest.value.status = 'PENDING';
      newRequest.value.createDate = new Date().toISOString().split('T')[0];
      newRequest.value.moduleVersions = [];
      newRequest.value.done = false;
      showCreateModal.value = true;
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
    };

    const saveNewRequest = async () => {
      isSaving.value = true;

      try {
        newRequest.value.moduleVersions = newRequest.value.moduleVersions.map(mv => {
          const full = moduleVersions.value.find(opt => opt.id === mv.id);
          return full ? full : mv;
        });
        if (newRequest.value.id) {
          await requestOfChangeService.update(newRequest.value);
          alertService.showSuccess(t$('sdiFrontendApp.requestOfChange.updated', { param: newRequest.value.title }).toString());
        } else {
          await requestOfChangeService.create(newRequest.value);
          alertService.showSuccess(t$('sdiFrontendApp.requestOfChange.created', { param: newRequest.value.title }).toString());
        }

        closeCreateModal();
        await retrieveRequestOfChanges();
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isSaving.value = false;
      }
    };

    const formatDate = dateString => {
      if (!dateString) return '-';

      const date = new Date(dateString);
      return new Intl.DateTimeFormat('fr-FR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
      }).format(date);
    };

    // Méthode pour obtenir la classe de couleur en fonction du statut
    const getStatusColorClass = status => {
      switch (status) {
        case 'PENDING':
          return 'text-warning border-warning';
        case 'APPROVED':
          return 'text-success border-success';
        case 'REJECTED':
          return 'text-danger border-danger';
        case 'COMPLETED':
          return 'text-primary border-primary';
        default:
          return '';
      }
    };

    // Méthode pour obtenir le texte du statut
    const getStatusText = status => {
      switch (status) {
        case 'PENDING':
          return 'Pending';
        case 'APPROVED':
          return 'Approved';
        case 'REJECTED':
          return 'Rejected';
        case 'COMPLETED':
          return 'Completed';
        default:
          return status;
      }
    };

    const isStepActive = step => {
      return selectedRequest.value && selectedRequest.value.status === step;
    };

    const isStepCompleted = step => {
      if (!selectedRequest.value) return false;

      const statusOrder = ['PENDING', 'APPROVED', 'REJECTED', 'COMPLETED'];
      const currentIndex = statusOrder.indexOf(selectedRequest.value.status);
      const stepIndex = statusOrder.indexOf(step);

      return stepIndex < currentIndex;
    };

    const changeRequestStatus = async newStatus => {
      try {
        const updatedRequest = { ...selectedRequest.value, status: newStatus };
        await requestOfChangeService.update(updatedRequest);

        // Mettre à jour la liste locale et l'état actuel
        selectedRequest.value.status = newStatus;
        currentStep.value = newStatus;

        // Rafraîchir la liste pour refléter les changements
        await retrieveRequestOfChanges();

        alertService.showInfo(t$('sdiFrontendApp.requestOfChange.statusUpdated'));
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    // Load relationships
    const loadRelationships = async () => {
      try {
        const [productVersionRes, clientRes, moduleVersionRes, customisationLevelRes] = await Promise.all([
          productVersionService.retrieve(),
          clientService.retrieve(),
          moduleVersionService.retrieve(),
          customisationLevelService.retrieve(),
        ]);

        productVersions.value = productVersionRes.data;
        clients.value = clientRes.data;
        moduleVersions.value = moduleVersionRes.data;
        customisationLevels.value = customisationLevelRes.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    // Lifecycle hooks
    onMounted(async () => {
      await loadRelationships();
      await retrieveRequestOfChanges();
      updateTabStyles();
    });

    // Fonction pour regrouper les versions par produit
    const groupedProductVersions = computed(() => {
      const grouped = {};

      productVersions.value.forEach(version => {
        if (!version.product) return;
        const productId = version.product.id;
        if (!grouped[productId]) {
          grouped[productId] = {
            product: version.product,
            versions: [],
          };
        }

        grouped[productId].versions.push(version);
        console.log(grouped);
      });
      return Object.values(grouped);
    });

    // Filtrer les moduleVersions en fonction du productVersion sélectionné
    const filteredModuleVersions = computed(() => {
      if (!newRequest.value.productVersion || !newRequest.value.productVersion.id) {
        return [];
      }

      if (
        newRequest.value.productVersion.moduleVersions &&
        Array.isArray(newRequest.value.productVersion.moduleVersions) &&
        newRequest.value.productVersion.moduleVersions.length > 0
      ) {
        console.log('Module versions disponibles:', newRequest.value.productVersion.moduleVersions);

        // Enrichir les moduleVersions avec les données complètes si nécessaire
        // Cette opération ne doit pas être effectuée dans un computed car elle modifie l'état
        // Déplacée dans une fonction séparée appelée lors du changement de productVersion

        return newRequest.value.productVersion.moduleVersions;
      } else {
        console.log('Aucun moduleVersion trouvé pour cette version de produit');
        return [];
      }
    });

    // Fonction pour enrichir les moduleVersions avec les données complètes
    const enrichModuleVersions = () => {
      if (
        !newRequest.value.productVersion ||
        !newRequest.value.productVersion.moduleVersions ||
        !Array.isArray(newRequest.value.productVersion.moduleVersions) ||
        newRequest.value.productVersion.moduleVersions.length === 0
      ) {
        return;
      }

      // Enrichir chaque moduleVersion avec les données complètes disponibles
      newRequest.value.productVersion.moduleVersions = newRequest.value.productVersion.moduleVersions.map(mv => {
        const full = moduleVersions.value.find(opt => opt.id === mv.id);
        return full ? full : mv;
      });
    };

    const loadModuleVersionsForProductVersion = async productVersionId => {
      if (!productVersionId) return;

      try {
        // Appel à l'API pour récupérer la productVersion avec ses moduleVersions
        const response = await productVersionService.find(productVersionId);
        if (response && response.data) {
          // Si la réponse contient la productVersion complète
          // Assurez-vous que les modules sont correctement chargés dans chaque moduleVersion
          const productVersion = response.data;

          // Si les moduleVersions existent mais n'ont pas leurs modules chargés,
          // nous devons peut-être les charger séparément
          if (productVersion.moduleVersions && productVersion.moduleVersions.length > 0) {
            // Optionnel: charger les détails des modules si nécessaire
            productVersion.moduleVersions = await loadModuleDetails(productVersion.moduleVersions);
          }

          // Mise à jour de la productVersion dans la requête
          newRequest.value.productVersion = productVersion;
        }
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Mettre à jour le watcher pour appeler enrichModuleVersions
    const watchProductVersionChange = () => {
      watch(
        () => newRequest.value.productVersion,
        newValue => {
          // Réinitialiser les moduleVersions sélectionnés lorsque la productVersion change
          if (newValue) {
            newRequest.value.moduleVersions = [];

            // Enrichir les moduleVersions si disponibles
            enrichModuleVersions();

            // Charger les moduleVersions associés à cette productVersion si nécessaire
            if (newValue.id && (!newValue.moduleVersions || newValue.moduleVersions.length === 0)) {
              loadModuleVersionsForProductVersion(newValue.id);
            }
          }
        },
        { immediate: true },
      );
    };

    // Appelez cette fonction dans le setup()
    watchProductVersionChange();

    return {
      filteredModuleVersions,
      loadModuleVersionsForProductVersion,
      groupedProductVersions,
      requestOfChanges,
      productVersions,
      clients,
      moduleVersions,
      customisationLevels,
      searchTerm,
      filteredRequests,
      isFetching,
      isSaving,
      showCreateModal,
      showModulesModal,
      showDeleteModal,
      selectedRequest,
      selectedModuleRequest,
      requestToDelete,
      currentStep,
      newRequest,
      activeTabIndex,
      hoveredIndex,
      tabRefs,
      hoverStyle,
      activeStyle,
      statusTabs,
      progressPercentage,
      retrieveRequestOfChanges,
      getRequestsByStatus,
      getRequestCountByStatus,
      handleSearch,
      handleSyncList,
      viewRequest,
      editRequest,
      toggleRequestSelection,
      deselectRequest,
      viewRequestModules,
      closeModulesModal,
      prepareRemove,
      closeDeleteModal,
      confirmDelete,
      openCreateRequestModal,
      closeCreateModal,
      saveNewRequest,
      formatDate,
      getStatusColorClass,
      getStatusText,
      isStepActive,
      isStepCompleted,
      changeRequestStatus,
      setHoveredIndex,
      setActiveTabIndex,
      showNewProductVersionPopup,
      openNewProductVersionPopup,
      closeNewProductVersionPopup,
      handleProductCreated,
      selectRequest,
      t$,
      RequestStatus,
    };
  },
});
