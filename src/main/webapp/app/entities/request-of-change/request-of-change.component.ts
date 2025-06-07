import { type Ref, defineComponent, ref, onMounted, computed, reactive, nextTick, inject, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
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
    const showAddModuleDropdown = ref(false);
    const selectedNewModuleVersion = ref(null);

    // Rich text editor refs
    const notesEditor = ref<HTMLElement | null>(null);
    const selectedHeading = ref('');
    const selectedFont = ref('');
    const isBold = ref(false);
    const isItalic = ref(false);
    const isUnderline = ref(false);

    // New request form
    const newRequest = ref(new RequestOfChange());
    const keywordInput = ref('');
    const keywordsList = ref<string[]>([]);

    // Validation rules
    const rules = computed(() => ({
      title: { required: true },
      type: { required: true },
      description: {}, // Optional field, no validation required
    }));

    const v$ = useVuelidate(rules, newRequest);

    // Tab navigation
    const activeTabIndex = ref(0);
    const hoveredIndex = ref(null);
    const tabRefs = ref([]);
    const hoverStyle = reactive({ left: 0, width: 0 });
    const activeStyle = reactive({ left: 0, width: 0 });

    // State
    const showNewProductVersionPopup = ref(false);

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

    // Rich text editor methods
    const updateNotes = () => {
      if (notesEditor.value) {
        v$.value.description.$model = notesEditor.value.innerHTML;
        v$.value.description.$touch();
      }
    };

    const updateToolbarState = () => {
      if (!notesEditor.value) return;
      isBold.value = document.queryCommandState('bold');
      isItalic.value = document.queryCommandState('italic');
      isUnderline.value = document.queryCommandState('underline');
    };

    const toggleBold = () => {
      document.execCommand('bold');
      updateToolbarState();
      updateNotes();
    };

    const toggleItalic = () => {
      document.execCommand('italic');
      updateToolbarState();
      updateNotes();
    };

    const toggleUnderline = () => {
      document.execCommand('underline');
      updateToolbarState();
      updateNotes();
    };

    const toggleBulletList = () => {
      document.execCommand('insertUnorderedList');
      updateNotes();
    };

    const toggleNumberedList = () => {
      document.execCommand('insertOrderedList');
      updateNotes();
    };

    const applyHeading = () => {
      if (selectedHeading.value) {
        document.execCommand('formatBlock', false, selectedHeading.value);
        selectedHeading.value = '';
        updateNotes();
      }
    };

    const applyFont = () => {
      if (selectedFont.value) {
        document.execCommand('fontName', false, selectedFont.value);
        selectedFont.value = '';
        updateNotes();
      }
    };

    const insertCode = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const code = document.createElement('code');
        code.style.backgroundColor = '#f1f5f9';
        code.style.padding = '2px 4px';
        code.style.borderRadius = '3px';
        code.style.fontFamily = 'monospace';
        try {
          range.surroundContents(code);
        } catch (e) {
          code.appendChild(range.extractContents());
          range.insertNode(code);
        }
        updateNotes();
      }
    };

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
          (request.description && request.description.toLowerCase().includes(term)) ||
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
      newRequest.value.type = request.type;
      newRequest.value.moduleVersions = request.moduleVersions
        ? request.moduleVersions.map(mv => {
          const fullModuleVersion = moduleVersions.value.find(opt => opt.id === mv.id);
          return fullModuleVersion ? fullModuleVersion : mv;
        })
        : [];
      if (newRequest.value.description) {
        v$.value.description.$model = newRequest.value.description;
      }
      if (newRequest.value.productVersion && newRequest.value.productVersion.id) {
        await loadModuleVersionsForProductVersion(newRequest.value.productVersion.id);
      }
      showCreateModal.value = true;
    };

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
        currentStep.value = request.status;
      }
    };

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
      newRequest.value.status = 'PENDING';
      newRequest.value.createDate = new Date().toISOString().split('T')[0];
      newRequest.value.moduleVersions = [];
      newRequest.value.description = '';
      newRequest.value.done = false;
      newRequest.value.type = 'EXTERNAL';
      showCreateModal.value = true;
    };

    const closeCreateModal = () => {
      showCreateModal.value = false;
      v$.value.$reset();
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
        selectedRequest.value.status = newStatus;
        currentStep.value = newStatus;
        await retrieveRequestOfChanges();
        alertService.showInfo(t$('sdiFrontendApp.requestOfChange.statusUpdated'));
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

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
      });
      return Object.values(grouped);
    });

    const filteredModuleVersions = computed(() => {
      if (!newRequest.value.productVersion || !newRequest.value.productVersion.id) {
        return [];
      }
      if (
        newRequest.value.productVersion.moduleVersions &&
        Array.isArray(newRequest.value.productVersion.moduleVersions) &&
        newRequest.value.productVersion.moduleVersions.length > 0
      ) {
        const enrichedModuleVersions = newRequest.value.productVersion.moduleVersions.map(mv => {
          const full = moduleVersions.value.find(opt => opt.id === mv.id);
          return full ? full : mv;
        });
        newRequest.value.moduleVersions = newRequest.value.moduleVersions.map(selectedMv => {
          const full = enrichedModuleVersions.find(opt => opt.id === selectedMv.id);
          return full ? full : selectedMv;
        });
        return enrichedModuleVersions;
      } else {
        return [];
      }
    });

    const loadModuleVersionsForProductVersion = async productVersionId => {
      if (!productVersionId) return;
      try {
        const response = await productVersionService.find(productVersionId);
        if (response && response.data) {
          newRequest.value.productVersion = response.data;
        }
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    watch(
      () => newRequest.value.productVersion,
      async newValue => {
        if (newValue && newValue.id) {
          await loadModuleVersionsForProductVersion(newValue.id);
          newRequest.value.moduleVersions = newRequest.value.moduleVersions.filter(mv =>
            newValue.moduleVersions?.some(opt => opt.id === mv.id),
          );
        } else {
          newRequest.value.moduleVersions = [];
        }
      },
      { immediate: true },
    );

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

    watch(
      keywordsList,
      newList => {
        newRequest.value.keywords = newList.join(', ');
      },
      { deep: true },
    );

    const addKeyword = () => {
      if (keywordInput.value.trim()) {
        keywordsList.value.push(keywordInput.value.trim());
        keywordInput.value = '';
      }
    };

    const handleKeywordInput = event => {
      if (event.key === ',') {
        event.preventDefault();
        addKeyword();
      }
    };

    const removeKeyword = index => {
      keywordsList.value.splice(index, 1);
    };

    const removeModule = async moduleId => {
      if (!selectedModuleRequest.value) return;
      try {
        selectedModuleRequest.value.moduleVersions = selectedModuleRequest.value.moduleVersions.filter(module => module.id !== moduleId);
        await requestOfChangeService.update(selectedModuleRequest.value);
        alertService.showSuccess(t$('sdiFrontendApp.requestOfChange.moduleRemoved').toString());
        const updatedRequestIndex = requestOfChanges.value.findIndex(request => request.id === selectedModuleRequest.value.id);
        if (updatedRequestIndex !== -1) {
          requestOfChanges.value[updatedRequestIndex].moduleVersions = [...selectedModuleRequest.value.moduleVersions];
        }
        if (selectedRequest.value && selectedRequest.value.id === selectedModuleRequest.value.id) {
          selectedRequest.value.moduleVersions = [...selectedModuleRequest.value.moduleVersions];
        }
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const viewRequestModules = async request => {
      selectedModuleRequest.value = { ...request };
      newRequest.value.productVersion = request.productVersion;
      showModulesModal.value = true;
    };

    const toggleAddModuleDropdown = () => {
      showAddModuleDropdown.value = !showAddModuleDropdown.value;
    };

    const addNewModuleVersion = async () => {
      if (!selectedNewModuleVersion.value || !selectedModuleRequest.value) return;
      try {
        const exists = selectedModuleRequest.value.moduleVersions.some(mv => mv.id === selectedNewModuleVersion.value.id);
        if (exists) {
          alertService.showInfo(t$('sdiFrontendApp.requestOfChange.moduleAlreadyAdded').toString());
          return;
        }
        selectedModuleRequest.value.moduleVersions.push(selectedNewModuleVersion.value);
        await requestOfChangeService.update(selectedModuleRequest.value);
        alertService.showSuccess(t$('sdiFrontendApp.requestOfChange.moduleAdded').toString());
        const updatedRequestIndex = requestOfChanges.value.findIndex(request => request.id === selectedModuleRequest.value.id);
        if (updatedRequestIndex !== -1) {
          requestOfChanges.value[updatedRequestIndex].moduleVersions = [...selectedModuleRequest.value.moduleVersions];
        }
        if (selectedRequest.value && selectedRequest.value.id === selectedModuleRequest.value.id) {
          selectedRequest.value.moduleVersions = [...selectedModuleRequest.value.moduleVersions];
        }
        selectedNewModuleVersion.value = null;
        showAddModuleDropdown.value = false;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

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
      retrieveRequestOfChanges();
    };

    const selectRequest = request => {
      selectedRequest.value = request;
    };

    onMounted(async () => {
      await loadRelationships();
      await retrieveRequestOfChanges();
      updateTabStyles();
      if (notesEditor.value) {
        notesEditor.value.addEventListener('paste', e => {
          e.preventDefault();
          const text = e.clipboardData?.getData('text/plain') || '';
          document.execCommand('insertText', false, text);
          updateNotes();
        });
      }
    });

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
      // Rich text editor
      notesEditor,
      selectedHeading,
      selectedFont,
      isBold,
      isItalic,
      isUnderline,
      updateNotes,
      updateToolbarState,
      toggleBold,
      toggleItalic,
      toggleUnderline,
      toggleBulletList,
      toggleNumberedList,
      applyHeading,
      applyFont,
      insertCode,
      v$,
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
