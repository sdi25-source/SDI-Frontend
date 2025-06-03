import { type Ref, defineComponent, ref, onMounted, computed, reactive, nextTick, inject, watch } from 'vue';
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
import type AccountService from '@/account/account.service.ts';

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
    const accountService = inject<AccountService>('accountService');
    const hasAnyAuthorityValues: Ref<any> = ref({});

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
    const showDetailsModal = ref(false);
    const showDeleteModal = ref(false);
    const selectedRequest = ref(null);
    const selectedModuleRequest = ref(null);
    const requestToDelete = ref(null);
    const currentStep = ref('');

    // Add new data properties
    const showAddModuleDropdown = ref(false);
    const selectedNewModuleVersion = ref(null);

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

    const keywordInput = ref(''); // Champ temporaire pour la saisie
    const keywordsList = ref<string[]>([]); // Liste des mots-clés sous forme de badges

    // Méthodes pour gérer le popup
    const openNewProductVersionPopup = () => {
      if (!selectedRequest.value) {
        alertService.showError('No selected request');
        return;
      }

      if (!selectedRequest.value.productVersion || !selectedRequest.value.productVersion.product) {
        alertService.showError('Unable to create a new product version: missing information');
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

    const typesRequest = [
      { label: 'Internal', value: 'INTERNAL' },
      { label: 'External', value: 'EXTERNAL' },
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
        console.log('result data', filteredRequests.value);
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

    const editRequest = async request => {
      newRequest.value = { ...request };
      newRequest.value.type = request.type.value;
      // S'assurer que les moduleVersions utilisent les références complètes
      newRequest.value.moduleVersions = request.moduleVersions
        ? request.moduleVersions.map(mv => {
            const fullModuleVersion = moduleVersions.value.find(opt => opt.id === mv.id);
            return fullModuleVersion ? fullModuleVersion : mv;
          })
        : [];
      // Charger les moduleVersions pour la productVersion sélectionnée
      if (newRequest.value.productVersion && newRequest.value.productVersion.id) {
        await loadModuleVersionsForProductVersion(newRequest.value.productVersion.id);
      }
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
        request.productVersionResult = res.data.find(pv => pv.id === request.productVersionResult?.id);

        console.log(request.productVersion);

        currentStep.value = request.status;
      }
    };

    // Deselect request
    const deselectRequest = () => {
      selectedRequest.value = null;
    };

    const viewRequestDetails = request => {
      selectedRequest.value = { ...request };
      showDetailsModal.value = true;
    };

    const closeModulesModal = () => {
      showModulesModal.value = false;
      selectedModuleRequest.value = null;
    };

    const closeDetailsModal = () => {
      showDetailsModal.value = false;
      selectedRequest.value = null;
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
      newRequest.value.type = 'EXTERNAL'; // Valeur par défaut
      showCreateModal.value = true;
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
    };

    const saveNewRequest = async () => {
      isSaving.value = true;

      try {
        newRequest.value.productVersionResult = newRequest.value.productVersion;
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
        // Enrichir les moduleVersions avec les données complètes
        const enrichedModuleVersions = newRequest.value.productVersion.moduleVersions.map(mv => {
          const full = moduleVersions.value.find(opt => opt.id === mv.id);
          return full ? full : mv;
        });

        // S'assurer que les moduleVersions déjà sélectionnées sont marquées
        newRequest.value.moduleVersions = newRequest.value.moduleVersions.map(selectedMv => {
          const full = enrichedModuleVersions.find(opt => opt.id === selectedMv.id);
          return full ? full : selectedMv;
        });

        return enrichedModuleVersions;
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
        async newValue => {
          if (newValue && newValue.id) {
            // Charger les moduleVersions pour la nouvelle productVersion
            await loadModuleVersionsForProductVersion(newValue.id);
            // Conserver les moduleVersions déjà sélectionnées si elles sont valides
            newRequest.value.moduleVersions = newRequest.value.moduleVersions.filter(mv =>
              newValue.moduleVersions?.some(opt => opt.id === mv.id),
            );
          } else {
            // Réinitialiser si aucune productVersion n'est sélectionnée
            newRequest.value.moduleVersions = [];
          }
        },
        { immediate: true },
      );
    };

    // Appelez cette fonction dans le setup()
    watchProductVersionChange();

    watch(
      () => newRequest.value.keywords,
      newValue => {
        if (newValue) {
          keywordsList.value = newValue
            .split(',')
            .map(word => word.trim())
            .filter(word => word !== '');
        } else {
          keywordsList.value = [];
        }
      },
      { immediate: true },
    );

    // Synchroniser newRequest.keywords avec la liste des badges
    watch(
      keywordsList,
      newList => {
        newRequest.value.keywords = newList.join(', ');
      },
      { deep: true },
    );

    // Ajouter un mot-clé
    const addKeyword = () => {
      if (keywordInput.value.trim()) {
        keywordsList.value.push(keywordInput.value.trim());
        keywordInput.value = ''; // Vider l'input après ajout
      }
    };

    // Gérer l'entrée pour permettre l'ajout par virgule ou Entrée
    const handleKeywordInput = event => {
      if (event.key === ',') {
        event.preventDefault();
        addKeyword();
      }
    };

    // Supprimer un mot-clé
    const removeKeyword = index => {
      keywordsList.value.splice(index, 1);
    };

    // Add this method inside the setup function
    const removeModule = async moduleId => {
      if (!selectedModuleRequest.value) return;

      try {
        // Filter out the module with the given moduleId
        selectedModuleRequest.value.moduleVersions = selectedModuleRequest.value.moduleVersions.filter(module => module.id !== moduleId);

        // Update the request in the backend
        await requestOfChangeService.update(selectedModuleRequest.value);
        alertService.showSuccess(t$('sdiFrontendApp.requestOfChange.moduleRemoved').toString());

        // Optionally, update the local requestOfChanges to reflect the change
        const updatedRequestIndex = requestOfChanges.value.findIndex(request => request.id === selectedModuleRequest.value.id);
        if (updatedRequestIndex !== -1) {
          requestOfChanges.value[updatedRequestIndex].moduleVersions = [...selectedModuleRequest.value.moduleVersions];
        }

        // If the selected request is the same as the module request, update it too
        if (selectedRequest.value && selectedRequest.value.id === selectedModuleRequest.value.id) {
          selectedRequest.value.moduleVersions = [...selectedModuleRequest.value.moduleVersions];
        }
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Modify viewRequestModules to set newRequest.productVersion
    const viewRequestModules = async request => {
      selectedModuleRequest.value = { ...request };
      // Set newRequest.productVersion to trigger filteredModuleVersions computation
      newRequest.value.productVersion = request.productVersion;
      showModulesModal.value = true;
    };

    // Toggle the dropdown
    const toggleAddModuleDropdown = () => {
      showAddModuleDropdown.value = !showAddModuleDropdown.value;
    };

    // Add new module version to the request
    const addNewModuleVersion = async () => {
      if (!selectedNewModuleVersion.value || !selectedModuleRequest.value) return;

      try {
        // Ensure the module version is not already in the list
        const exists = selectedModuleRequest.value.moduleVersions.some(mv => mv.id === selectedNewModuleVersion.value.id);
        if (exists) {
          alertService.showInfo(t$('sdiFrontendApp.requestOfChange.moduleAlreadyAdded').toString());
          return;
        }

        // Add the new module version to the request
        selectedModuleRequest.value.moduleVersions.push(selectedNewModuleVersion.value);

        // Update the request in the backend
        await requestOfChangeService.update(selectedModuleRequest.value);
        alertService.showSuccess(t$('sdiFrontendApp.requestOfChange.moduleAdded').toString());

        // Update the local requestOfChanges to reflect the change
        const updatedRequestIndex = requestOfChanges.value.findIndex(request => request.id === selectedModuleRequest.value.id);
        if (updatedRequestIndex !== -1) {
          requestOfChanges.value[updatedRequestIndex].moduleVersions = [...selectedModuleRequest.value.moduleVersions];
        }

        // If the selected request is the same as the module request, update it too
        if (selectedRequest.value && selectedRequest.value.id === selectedModuleRequest.value.id) {
          selectedRequest.value.moduleVersions = [...selectedModuleRequest.value.moduleVersions];
        }

        // Reset the dropdown
        selectedNewModuleVersion.value = null;
        showAddModuleDropdown.value = false;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      keywordInput,
      keywordsList,
      addKeyword,
      handleKeywordInput,
      removeKeyword,
      filteredModuleVersions,
      loadModuleVersionsForProductVersion,
      groupedProductVersions,
      requestOfChanges,
      productVersions,
      clients,
      removeModule,
      moduleVersions,
      customisationLevels,
      searchTerm,
      filteredRequests,
      isFetching,
      isSaving,
      showCreateModal,
      showModulesModal,
      showDetailsModal,
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
      typesRequest,
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
      closeDetailsModal,
      prepareRemove,
      closeDeleteModal,
      confirmDelete,
      viewRequestDetails,
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
      accountService,
      hasAnyAuthorityValues,
      showAddModuleDropdown,
      selectedNewModuleVersion,
      toggleAddModuleDropdown,
      addNewModuleVersion,
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
