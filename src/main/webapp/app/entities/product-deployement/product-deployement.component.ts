import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';

import ProductDeploymentService from './product-deployement.service';
import ProductDeployementDetailService from '../product-deployement-detail/product-deployement-detail.service';
import ClientService from '../client/client.service';
import DeployementTypeService from '../deployement-type/deployement-type.service';
import ProductVersionService from '../product-version/product-version.service';
import { type IProductDeployment } from '@/shared/model/product-deployement.model';
import { type IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';
import { type IClient } from '@/shared/model/client.model';
import { useAlertService } from '@/shared/alert/alert.service';
import ProductService from '../product/product.service';
export default defineComponent({
  computed: {
    IProductDeployementDetail() {
      return IProductDeployementDetail
    }
  },
  compatConfig: { MODE: 3 },
  name: 'ProductDeployment',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const productDeploymentService = inject('productDeploymentService', () => new ProductDeploymentService());
    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());
    const clientService = inject('clientService', () => new ClientService());
    const deployementTypeService = inject('deployementTypeService', () => new DeployementTypeService());
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);
    const productService = inject('productService', () => new ProductService());
    // État principal
    const productDeployments: Ref<IProductDeployment[]> = ref([]);
    const allProductDeployments: Ref<IProductDeployment[]> = ref([]);
    const clients: Ref<IClient[]> = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    // Pagination pour la liste principale
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);

    // État pour la sélection et les onglets
    const selectedDetails = ref<IProductDeployementDetail[]>([]);
    const activeTab = ref('productDeployement'); // Changé pour correspondre à la vue
    const showTabs = ref(false);

    // Computed properties pour la sélection
    const hasSelection = computed(() => selectedDetails.value.length > 0);

    // Méthode pour gérer les changements de checkbox
    const handleCheckboxChange = (detail: IProductDeployementDetail) => {
      // Vérifier si le détail est déjà sélectionné
      const isSelected = detail.isSelected;

      if (isSelected) {
        // Ajouter à la sélection s'il n'y est pas déjà
        const exists = selectedDetails.value.some(d => d.id === detail.id);
        if (!exists) {
          selectedDetails.value.push(detail);
        }
      } else {
        // Retirer de la sélection
        selectedDetails.value = selectedDetails.value.filter(d => d.id !== detail.id);
      }

      // Mettre à jour l'affichage des onglets
      showTabs.value = selectedDetails.value.length > 0;
    };

    // Méthode pour effacer la sélection
    const clearSelection = () => {
      // Réinitialiser l'état isSelected pour tous les détails
      productDeployementDetails.value.forEach(d => {
        d.isSelected = false;
      });

      // Vider le tableau des détails sélectionnés
      selectedDetails.value = [];

      // Masquer les onglets
      showTabs.value = false;
    };

    const newProductDeployment = ref({
      refContract: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
      client: null,
    });

    // État pour les détails
    const selectedProductDeployment = ref(null);
    const productDeployementDetails: Ref<IProductDeployementDetail[]> = ref([]);
    const allProductDeployementDetails = ref([]);
    const deployementTypes = ref([]);
    const productVersions = ref([]);
    const detailSearchTerm = ref('');
    const detailSearchTimeout = ref(null);
    const showAddDetailRow = ref(false);
    const removeDetailId = ref(null);
    const removeDetailEntity = ref<any>(null);

    // Pagination pour les détails
    const detailCurrentPage = ref(1);
    const detailItemsPerPage = ref(10);
    const detailTotalItems = ref(0);

    const newProductDeployementDetail = ref({
      startDeployementDate: new Date().toISOString().split('T')[0],
      endDeployementDate: '',
      notes: '',
      productDeployement: null,
      deployementType: null,
      productVersion: null,
      infraComponentVersions: [],
      allowedModuleVersions: [],
      isSelected: false // Ajout de la propriété isSelected
    });

    // Computed properties pour la liste principale
    const paginatedProductDeployments = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return productDeployments.value.slice(start, end);
    });

    const totalPages = computed(() => Math.ceil(totalItems.value / itemsPerPage.value));

    const isPrevDisabled = computed(() => currentPage.value <= 1);
    const isNextDisabled = computed(() => currentPage.value >= totalPages.value);

    const paginationInfo = computed(() => {
      if (totalItems.value === 0) return '0-0 / 0';
      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(start + itemsPerPage.value - 1, totalItems.value);
      return `${start}-${end} / ${totalItems.value}`;
    });

    // Computed properties pour les détails
    const productDeployementInfo = computed(() => {
      if (selectedProductDeployment.value) {
        return `${selectedProductDeployment.value.refContract} (Client: ${selectedProductDeployment.value.client?.code || 'N/A'})`;
      }
      return '';
    });

    const paginatedProductDeployementDetails = computed(() => {
      const start = (detailCurrentPage.value - 1) * detailItemsPerPage.value;
      const end = start + detailItemsPerPage.value;
      return productDeployementDetails.value.slice(start, end);
    });

    const detailTotalPages = computed(() => Math.ceil(detailTotalItems.value / detailItemsPerPage.value));

    const isDetailPrevDisabled = computed(() => detailCurrentPage.value <= 1);
    const isDetailNextDisabled = computed(() => detailCurrentPage.value >= detailTotalPages.value);

    const detailPaginationInfo = computed(() => {
      if (detailTotalItems.value === 0) return '0-0 / 0';
      const start = (detailCurrentPage.value - 1) * detailItemsPerPage.value + 1;
      const end = Math.min(start + detailItemsPerPage.value - 1, detailTotalItems.value);
      return `${start}-${end} / ${detailTotalItems.value}`;
    });

    // Fonctions pour la liste principale
    const goToNextPage = () => {
      if (!isNextDisabled.value) currentPage.value++;
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) currentPage.value--;
    };

    const updateTotalItems = () => {
      totalItems.value = productDeployments.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          productDeployments.value = [...allProductDeployments.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          productDeployments.value = allProductDeployments.value.filter(pd => {
            return (
              (pd.refContract && pd.refContract.toLowerCase().includes(searchLower)) ||
              (pd.notes && pd.notes.toLowerCase().includes(searchLower)) ||
              (pd.client && pd.client.code && pd.client.code.toLowerCase().includes(searchLower))
            );
          });
        }
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    const clear = () => {
      searchTerm.value = '';
      productDeployments.value = [...allProductDeployments.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveProductDeployments = async () => {
      isFetching.value = true;
      try {
        const res = await productDeploymentService().retrieve();
        productDeployments.value = res.data.map(pd => ({
          ...pd,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(pd)),
        }));
        allProductDeployments.value = [...productDeployments.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const retrieveClients = async () => {
      try {
        const res = await clientService().retrieve();
        clients.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const handleSyncList = () => retrieveProductDeployments();

    const prepareRemove = (instance: IProductDeployment) => {
      productDeployments.value.forEach(pd => (pd.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => removeEntity.value.hide();

    const removeProductDeployment = async () => {
      try {
        await productDeploymentService().delete(removeId.value);
        alertService.showInfo(
          t$('sdiFrontendApp.productDeployment.deleted', { param: removeId.value }).toString(),
          { variant: 'danger' }
        );

        productDeployments.value = productDeployments.value.filter(pd => pd.id !== removeId.value);
        allProductDeployments.value = allProductDeployments.value.filter(pd => pd.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewProductDeployment = async () => {
      if (!newProductDeployment.value.refContract) {
        alertService.showAlert('Le champ référence contrat est requis.', 'danger');
        return;
      }

      if (!newProductDeployment.value.client) {
        alertService.showAlert('Le champ client est requis.', 'danger');
        return;
      }

      try {
        const response = await productDeploymentService().create(newProductDeployment.value);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        productDeployments.value.push(added);
        allProductDeployments.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newProductDeployment.value = {
          refContract: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
          client: null,
        };

        alertService.showAlert('Déploiement ajouté avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewProductDeployment = () => {
      showAddRow.value = false;
      newProductDeployment.value = {
        refContract: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
        client: null,
      };
    };

    const editProductDeployment = productDeployment => {
      productDeployments.value.forEach(pd => (pd.showDropdown = false));
      productDeployment.originalData = JSON.parse(JSON.stringify({
        refContract: productDeployment.refContract,
        createDate: productDeployment.createDate,
        updateDate: productDeployment.updateDate,
        notes: productDeployment.notes,
        client: productDeployment.client
      }));
      productDeployment.isEditing = true;
    };

    const saveProductDeployment = async productDeployment => {
      if (!productDeployment.refContract) {
        alertService.showAlert('Le champ référence contrat est requis.', 'danger');
        return;
      }

      if (!productDeployment.client) {
        alertService.showAlert('Le champ client est requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: productDeployment.id,
          refContract: productDeployment.refContract,
          createDate: productDeployment.createDate,
          updateDate: new Date().toISOString().split('T')[0],
          notes: productDeployment.notes,
          client: productDeployment.client
        };

        const response = await productDeploymentService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = productDeployments.value.findIndex(pd => pd.id === productDeployment.id);
        if (index !== -1) productDeployments.value.splice(index, 1, updated);

        const allIndex = allProductDeployments.value.findIndex(pd => pd.id === productDeployment.id);
        if (allIndex !== -1) allProductDeployments.value.splice(allIndex, 1, updated);

        alertService.showAlert('Déploiement mis à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = productDeployment => {
      productDeployment.refContract = productDeployment.originalData.refContract;
      productDeployment.createDate = productDeployment.originalData.createDate;
      productDeployment.updateDate = productDeployment.originalData.updateDate;
      productDeployment.notes = productDeployment.originalData.notes;
      productDeployment.client = productDeployment.originalData.client;
      productDeployment.isEditing = false;
    };

    const toggleDropdown = productDeployment => {
      productDeployments.value.forEach(pd => {
        if (pd.id !== productDeployment.id) pd.showDropdown = false;
      });
      productDeployment.showDropdown = !productDeployment.showDropdown;
    };

    // Fonctions pour les détails
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    };

    const goToDetailNextPage = () => {
      if (!isDetailNextDisabled.value) detailCurrentPage.value++;
    };

    const goToDetailPrevPage = () => {
      if (!isDetailPrevDisabled.value) detailCurrentPage.value--;
    };

    const updateDetailTotalItems = () => {
      detailTotalItems.value = productDeployementDetails.value?.length || 0;
    };

    const handleDetailSearch = () => {
      if (detailSearchTimeout.value) clearTimeout(detailSearchTimeout.value);
      detailSearchTimeout.value = setTimeout(() => {
        if (detailSearchTerm.value.trim() === '') {
          productDeployementDetails.value = [...allProductDeployementDetails.value];
        } else {
          const searchLower = detailSearchTerm.value.toLowerCase();
          productDeployementDetails.value = allProductDeployementDetails.value.filter(detail => {
            return (
              (detail.notes && detail.notes.toLowerCase().includes(searchLower)) ||
              (detail.deployementType && detail.deployementType.type && detail.deployementType.type.toLowerCase().includes(searchLower)) ||
              (detail.productVersion && detail.productVersion.version && detail.productVersion.version.toLowerCase().includes(searchLower))
            );
          });
        }
        updateDetailTotalItems();
        detailCurrentPage.value = 1;
      }, 300);
    };

    const findDetailsByProductDeployementId = async (id) => {
      try {
        const response = await axios.get(`api/product-deployement-details?productDeployementId.equals=${id}`);
        return response;
      } catch (error) {
        throw error;
      }
    };

    // Modifiez retrieveProductDeployementDetails pour réinitialiser la sélection
    const retrieveProductDeployementDetails = async () => {
      try {
        if (selectedProductDeployment.value) {
          const res = await findDetailsByProductDeployementId(selectedProductDeployment.value.id);
          productDeployementDetails.value = res.data.map(detail => ({
            ...detail,
            isSelected: false, // Initialisation explicite
            isEditing: false,
            originalData: JSON.parse(JSON.stringify(detail))
          } as IProductDeployementDetail)); // Cast explicite

          // Réinitialiser la sélection
          selectedDetails.value = [];
          showTabs.value = false;

          // Mettre à jour allProductDeployementDetails
          allProductDeployementDetails.value = [...productDeployementDetails.value];
          updateDetailTotalItems();
        }
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveDeployementTypes = async () => {
      try {
        const res = await deployementTypeService().retrieve();
        deployementTypes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveProductVersions = async () => {
      try {
        const res = await productVersionService().retrieve();
        productVersions.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const prepareRemoveDetail = (instance) => {
      removeDetailId.value = instance.id;
      removeDetailEntity.value.show();
    };

    const closeDetailDialog = () => removeDetailEntity.value.hide();

    const removeProductDeployementDetail = async () => {
      try {
        await productDeployementDetailService().delete(removeDetailId.value);
        alertService.showInfo(
          'Détail supprimé avec succès',
          { variant: 'success' }
        );

        // Retirer le détail de la sélection si nécessaire
        selectedDetails.value = selectedDetails.value.filter(detail => detail.id !== removeDetailId.value);
        showTabs.value = selectedDetails.value.length > 0;

        productDeployementDetails.value = productDeployementDetails.value.filter(detail => detail.id !== removeDetailId.value);
        allProductDeployementDetails.value = allProductDeployementDetails.value.filter(detail => detail.id !== removeDetailId.value);
        updateDetailTotalItems();

        removeDetailId.value = null;
        closeDetailDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewProductDeployementDetail = async () => {
      if (!newProductDeployementDetail.value.startDeployementDate) {
        alertService.showAlert('Le champ date de début est requis.', 'danger');
        return;
      }

      if (!newProductDeployementDetail.value.deployementType) {
        alertService.showAlert('Le champ type de déploiement est requis.', 'danger');
        return;
      }

      if (!newProductDeployementDetail.value.productVersion) {
        alertService.showAlert('Le champ version du produit est requis.', 'danger');
        return;
      }

      try {
        // Assurez-vous que le productDeployement est défini
        newProductDeployementDetail.value.productDeployement = {
          id: selectedProductDeployment.value.id,
          refContract: selectedProductDeployment.value.refContract
        };

        const response = await productDeployementDetailService().create(newProductDeployementDetail.value);
        const added = {
          ...response,
          isSelected: false,
          isEditing: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        productDeployementDetails.value.push(added);
        allProductDeployementDetails.value.push(added);
        updateDetailTotalItems();

        showAddDetailRow.value = false;
        newProductDeployementDetail.value = {
          startDeployementDate: new Date().toISOString().split('T')[0],
          endDeployementDate: '',
          notes: '',
          productDeployement: {
            id: selectedProductDeployment.value.id,
            refContract: selectedProductDeployment.value.refContract
          },
          deployementType: null,
          productVersion: null,
          infraComponentVersions: [],
          allowedModuleVersions: [],
          isSelected: false
        };

        alertService.showAlert('Détail ajouté avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewProductDeployementDetail = () => {
      showAddDetailRow.value = false;
      newProductDeployementDetail.value = {
        startDeployementDate: new Date().toISOString().split('T')[0],
        endDeployementDate: '',
        notes: '',
        productDeployement: selectedProductDeployment.value ? {
          id: selectedProductDeployment.value.id,
          refContract: selectedProductDeployment.value.refContract
        } : null,
        deployementType: null,
        productVersion: null,
        infraComponentVersions: [],
        allowedModuleVersions: [],
        isSelected: false
      };
    };

    const editProductDeployementDetail = detail => {
      detail.originalData = JSON.parse(JSON.stringify({
        startDeployementDate: detail.startDeployementDate,
        endDeployementDate: detail.endDeployementDate,
        notes: detail.notes,
        deployementType: detail.deployementType,
        productVersion: detail.productVersion,
        isSelected: detail.isSelected
      }));
      detail.isEditing = true;
    };

    const saveProductDeployementDetail = async detail => {
      if (!detail.startDeployementDate) {
        alertService.showAlert('Le champ date de début est requis.', 'danger');
        return;
      }

      if (!detail.deployementType) {
        alertService.showAlert('Le champ type de déploiement est requis.', 'danger');
        return;
      }

      if (!detail.productVersion) {
        alertService.showAlert('Le champ version du produit est requis.', 'danger');
        return;
      }

      try {
        const toSend = {
          id: detail.id,
          startDeployementDate: detail.startDeployementDate,
          endDeployementDate: detail.endDeployementDate,
          notes: detail.notes,
          productDeployement: detail.productDeployement,
          deployementType: detail.deployementType,
          productVersion: detail.productVersion,
          infraComponentVersions: detail.infraComponentVersions || [],
          allowedModuleVersions: detail.allowedModuleVersions || []
        };

        const response = await productDeployementDetailService().update(toSend);
        const updated = {
          ...response,
          isSelected: detail.isSelected, // Conserver l'état de sélection
          isEditing: false,
          originalData: null,
        };

        const index = productDeployementDetails.value.findIndex(d => d.id === detail.id);
        if (index !== -1) productDeployementDetails.value.splice(index, 1, updated);

        const allIndex = allProductDeployementDetails.value.findIndex(d => d.id === detail.id);
        if (allIndex !== -1) allProductDeployementDetails.value.splice(allIndex, 1, updated);

        // Mettre à jour la sélection si nécessaire
        if (detail.isSelected) {
          const selIndex = selectedDetails.value.findIndex(d => d.id === detail.id);
          if (selIndex !== -1) selectedDetails.value.splice(selIndex, 1, updated);
        }

        alertService.showAlert('Détail mis à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEditDetail = detail => {
      detail.startDeployementDate = detail.originalData.startDeployementDate;
      detail.endDeployementDate = detail.originalData.endDeployementDate;
      detail.notes = detail.originalData.notes;
      detail.deployementType = detail.originalData.deployementType;
      detail.productVersion = detail.originalData.productVersion;
      detail.isSelected = detail.originalData.isSelected;
      detail.isEditing = false;
    };

    // Fonction pour afficher les détails d'un déploiement
    const viewProductDeploymentDetails = async (productDeployment) => {
      selectedProductDeployment.value = productDeployment;

      // Initialiser le nouveau détail avec le productDeployement sélectionné
      newProductDeployementDetail.value.productDeployement = {
        id: productDeployment.id,
        refContract: productDeployment.refContract
      };

      // Charger les données nécessaires
      await retrieveDeployementTypes();
      await retrieveProductVersions();
      await retrieveProductDeployementDetails();

      // Réinitialiser les onglets
      activeTab.value = 'productDeployement';
      showTabs.value = false;
    };

    // Fonction pour revenir à la liste des déploiements
    const goBackToList = () => {
      selectedProductDeployment.value = null;
      productDeployementDetails.value = [];
      allProductDeployementDetails.value = [];
      selectedDetails.value = [];
      showTabs.value = false;
      detailSearchTerm.value = '';
      detailCurrentPage.value = 1;
    };

    watch(productDeployments, () => {
      updateTotalItems();
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
      }
    }, { deep: true });

    watch(productDeployementDetails, () => {
      updateDetailTotalItems();
      if (detailCurrentPage.value > detailTotalPages.value && detailTotalPages.value > 0) {
        detailCurrentPage.value = detailTotalPages.value;
      }
    }, { deep: true });

    // Observer les changements dans selectedDetails pour mettre à jour showTabs
    watch(selectedDetails, (newVal) => {
      showTabs.value = newVal.length > 0;
    }, { deep: true });

    onMounted(async () => {
      await retrieveClients();
      await retrieveProductDeployments();
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          productDeployments.value.forEach(pd => (pd.showDropdown = false));
        }
      });
    });

    // Computed property pour vérifier si tous les détails sont sélectionnés
    const allDetailsSelected = computed(() => {
      return productDeployementDetails.value.length > 0 &&
        productDeployementDetails.value.every(detail => detail.isSelected);
    });

    // Méthode pour sélectionner/désélectionner tous les détails
    const toggleAllDetails = (event) => {
      const isChecked = event.target.checked;
      productDeployementDetails.value.forEach(detail => {
        detail.isSelected = isChecked;
        handleCheckboxChange(detail);
      });
    };

    return {
      // État principal
      viewMode,
      showAddRow,
      newProductDeployment,
      cancelNewProductDeployment,
      saveNewProductDeployment,
      productDeployments,
      clients,
      handleSyncList,
      isFetching,
      retrieveProductDeployments,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductDeployment,
      editProductDeployment,
      saveProductDeployment,
      cancelEdit,
      toggleDropdown,
      clear,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedProductDeployments,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      searchTerm,
      handleSearch,

      // État des détails
      selectedProductDeployment,
      productDeployementDetails,
      deployementTypes,
      productVersions,
      showAddDetailRow,
      newProductDeployementDetail,
      detailCurrentPage,
      detailItemsPerPage,
      detailTotalItems,
      paginatedProductDeployementDetails,
      detailTotalPages,
      isDetailPrevDisabled,
      isDetailNextDisabled,
      detailPaginationInfo,
      detailSearchTerm,
      productDeployementInfo,

      // Fonctions des détails
      viewProductDeploymentDetails,
      goBackToList,
      formatDate,
      goToDetailNextPage,
      goToDetailPrevPage,
      handleDetailSearch,
      saveNewProductDeployementDetail,
      cancelNewProductDeployementDetail,
      editProductDeployementDetail,
      saveProductDeployementDetail,
      cancelEditDetail,
      prepareRemoveDetail,
      closeDetailDialog,
      removeProductDeployementDetail,
      removeDetailId,
      removeDetailEntity,

      // Sélection et onglets
      selectedDetails,
      activeTab,
      showTabs,
      hasSelection,
      clearSelection,
      handleCheckboxChange,

      // Ajoutez ces nouvelles propriétés et méthodes
      allDetailsSelected,
      toggleAllDetails,
    };
  },
});
