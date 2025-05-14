import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios';

import ProductDeploymentService from '../product-deployement/product-deployement.service';
import ProductDeployementDetailService from './product-deployement-detail.service';
import DeployementTypeService from '../deployement-type/deployement-type.service';
import ProductVersionService from '../product-version/product-version.service';
import { type IProductDeployment } from '@/shared/model/product-deployement.model';
import { type IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployementDetailView',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const productDeploymentService = inject('productDeploymentService', () => new ProductDeploymentService());
    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());
    const deployementTypeService = inject('deployementTypeService', () => new DeployementTypeService());
    const productVersionService = inject('productVersionService', () => new ProductVersionService());
    const alertService = inject('alertService', () => useAlertService(), true);

    // État principal
    const productDeployment = ref(null);
    const productDeployementDetails = ref([]);
    const allProductDeployementDetails = ref([]);
    const deployementTypes = ref([]);
    const productVersions = ref([]);
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    // Pagination pour les détails
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);

    // État pour l'ajout/édition
    const showAddRow = ref(false);
    const removeId = ref(null);
    const removeEntity = ref(null);

    const newProductDeployementDetail = ref({
      startDeployementDate: new Date().toISOString().split('T')[0],
      endDeployementDate: '',
      notes: '',
      productDeployement: null,
      deployementType: null,
      productVersion: null,
      infraComponentVersions: [],
      allowedModuleVersions: []
    });

    // Computed properties
    const productDeployementInfo = computed(() => {
      if (productDeployment.value) {
        return `${productDeployment.value.refContract} (Client: ${productDeployment.value.client?.code || 'N/A'})`;
      }
      return '';
    });

    const paginatedProductDeployementDetails = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return productDeployementDetails.value.slice(start, end);
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

    // Fonctions utilitaires
    const formatDate = (dateString) => {
      if (!dateString) return '';
      const date = new Date(dateString);
      return date.toLocaleDateString('fr-FR');
    };

    // Fonctions de navigation
    const goBack = () => {
      router.go(-1);
    };

    const goToNextPage = () => {
      if (!isNextDisabled.value) currentPage.value++;
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) currentPage.value--;
    };

    // Fonctions pour les détails
    const updateTotalItems = () => {
      totalItems.value = productDeployementDetails.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          productDeployementDetails.value = [...allProductDeployementDetails.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          productDeployementDetails.value = allProductDeployementDetails.value.filter(detail => {
            return (
              (detail.notes && detail.notes.toLowerCase().includes(searchLower)) ||
              (detail.deployementType && detail.deployementType.type && detail.deployementType.type.toLowerCase().includes(searchLower)) ||
              (detail.productVersion && detail.productVersion.version && detail.productVersion.version.toLowerCase().includes(searchLower))
            );
          });
        }
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    const retrieveProductDeployement = async () => {
      try {
        const productDeployementId = router.currentRoute.value.query['productDeployementId.equals'];
        if (productDeployementId) {
          const res = await productDeploymentService().find(productDeployementId);
          productDeployment.value = res;
        }
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveProductDeployementDetails = async () => {
      try {
        const productDeployementId = router.currentRoute.value.query['productDeployementId.equals'];
        if (productDeployementId) {
          const res = await axios.get(`api/product-deployement-details?productDeployementId.equals=${productDeployementId}`);
          productDeployementDetails.value = res.data.map(detail => ({
            ...detail,
            isEditing: false,
            originalData: JSON.parse(JSON.stringify(detail))
          }));
          allProductDeployementDetails.value = [...productDeployementDetails.value];
          updateTotalItems();
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

    const prepareRemove = (instance) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeProductDeployementDetail = async () => {
      try {
        await productDeployementDetailService().delete(removeId.value);
        alertService.showInfo(
          'Détail supprimé avec succès',
          { variant: 'success' }
        );

        productDeployementDetails.value = productDeployementDetails.value.filter(detail => detail.id !== removeId.value);
        allProductDeployementDetails.value = allProductDeployementDetails.value.filter(detail => detail.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
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
          id: productDeployment.value.id,
          refContract: productDeployment.value.refContract
        };

        const response = await productDeployementDetailService().create(newProductDeployementDetail.value);
        const added = {
          ...response,
          isEditing: false,
          originalData: JSON.parse(JSON.stringify(response))
        };

        productDeployementDetails.value.push(added);
        allProductDeployementDetails.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newProductDeployementDetail.value = {
          startDeployementDate: new Date().toISOString().split('T')[0],
          endDeployementDate: '',
          notes: '',
          productDeployement: {
            id: productDeployment.value.id,
            refContract: productDeployment.value.refContract
          },
          deployementType: null,
          productVersion: null,
          infraComponentVersions: [],
          allowedModuleVersions: []
        };

        alertService.showAlert('Détail ajouté avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewProductDeployementDetail = () => {
      showAddRow.value = false;
      newProductDeployementDetail.value = {
        startDeployementDate: new Date().toISOString().split('T')[0],
        endDeployementDate: '',
        notes: '',
        productDeployement: productDeployment.value ? {
          id: productDeployment.value.id,
          refContract: productDeployment.value.refContract
        } : null,
        deployementType: null,
        productVersion: null,
        infraComponentVersions: [],
        allowedModuleVersions: []
      };
    };

    const editProductDeployementDetail = detail => {
      detail.originalData = JSON.parse(JSON.stringify({
        startDeployementDate: detail.startDeployementDate,
        endDeployementDate: detail.endDeployementDate,
        notes: detail.notes,
        deployementType: detail.deployementType,
        productVersion: detail.productVersion
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
          isEditing: false,
          originalData: null
        };

        const index = productDeployementDetails.value.findIndex(d => d.id === detail.id);
        if (index !== -1) productDeployementDetails.value.splice(index, 1, updated);

        const allIndex = allProductDeployementDetails.value.findIndex(d => d.id === detail.id);
        if (allIndex !== -1) allProductDeployementDetails.value.splice(allIndex, 1, updated);

        alertService.showAlert('Détail mis à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = detail => {
      detail.startDeployementDate = detail.originalData.startDeployementDate;
      detail.endDeployementDate = detail.originalData.endDeployementDate;
      detail.notes = detail.originalData.notes;
      detail.deployementType = detail.originalData.deployementType;
      detail.productVersion = detail.originalData.productVersion;
      detail.isEditing = false;
    };

    // Surveiller les changements dans les détails
    watch(productDeployementDetails, () => {
      updateTotalItems();
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
      }
    }, { deep: true });

    onMounted(async () => {
      await retrieveProductDeployement();
      await retrieveDeployementTypes();
      await retrieveProductVersions();
      await retrieveProductDeployementDetails();
    });

    return {
      // État principal
      productDeployment,
      productDeployementDetails,
      deployementTypes,
      productVersions,
      searchTerm,

      // Pagination pour les détails
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedProductDeployementDetails,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,

      // État pour l'ajout/édition
      showAddRow,
      removeId,
      removeEntity,
      newProductDeployementDetail,

      // Computed properties
      productDeployementInfo,

      // Fonctions utilitaires
      formatDate,

      // Fonctions de navigation
      goBack,
      goToNextPage,
      goToPrevPage,

      // Fonctions pour les détails
      handleSearch,
      prepareRemove,
      closeDialog,
      removeProductDeployementDetail,
      saveNewProductDeployementDetail,
      cancelNewProductDeployementDetail,
      editProductDeployementDetail,
      saveProductDeployementDetail,
      cancelEdit,

      // i18n
      t$
    };
  }
});
