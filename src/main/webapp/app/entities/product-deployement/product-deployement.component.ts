import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

import ProductDeploymentService from './product-deployement.service';
import ProductDeployementDetailService from '../product-deployement-detail/product-deployement-detail.service';
import ClientService from '../client/client.service';
import { type IProductDeployment } from '@/shared/model/product-deployement.model';
import { type IClient } from '@/shared/model/client.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductDeployment',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const productDeploymentService = inject('productDeploymentService', () => new ProductDeploymentService());
    const productDeployementDetailService = inject('productDeployementDetailService', () => new ProductDeployementDetailService());
    const clientService = inject('clientService', () => new ClientService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productDeployments: Ref<IProductDeployment[]> = ref([]);
    const allProductDeployments: Ref<IProductDeployment[]> = ref([]);
    const clients: Ref<IClient[]> = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    const currentPage = ref(1);
    const itemsPerPage = ref(5);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);

    const newProductDeployment = ref({
      refContract: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
      client: null,
    });

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

    // Nouvelle fonction pour naviguer vers les détails du déploiement
    const viewProductDeploymentDetails = (productDeployment) => {
      router.push({
        name: 'ProductDeployementDetail',
        query: {
          'productDeployementId.equals': productDeployment.id
        }
      });
    };

    watch(productDeployments, () => {
      updateTotalItems();
      if (currentPage.value > totalPages.value && totalPages.value > 0) {
        currentPage.value = totalPages.value;
      }
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

    return {
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
      viewProductDeploymentDetails, // Exposer la nouvelle fonction
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
    };
  },
});
