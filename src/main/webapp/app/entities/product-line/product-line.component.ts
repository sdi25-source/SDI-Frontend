import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';

import ProductLineService from './product-line.service';
import { type IProductLine } from '@/shared/model/product-line.model';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductLine',
  setup() {
    const { t: t$ } = useI18n();
    const productLineService = inject('productLineService', () => new ProductLineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const productLines: Ref<IProductLine[]> = ref([]);
    const allProductLines: Ref<IProductLine[]> = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);

    const isFetching = ref(false);
    const showAddRow = ref(false);

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);

    const newProductLine = ref({
      name: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
    });

    const paginatedProductLines = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return productLines.value.slice(start, end);
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
      totalItems.value = productLines.value?.length || 0;
    };

    const handleSearch = () => {
      if (searchTimeout.value) clearTimeout(searchTimeout.value);
      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          productLines.value = [...allProductLines.value];
        } else {
          const searchLower = searchTerm.value.toLowerCase();
          productLines.value = allProductLines.value.filter(pl =>
            Object.values(pl).some(val => typeof val === 'string' && val.toLowerCase().includes(searchLower)),
          );
        }
        updateTotalItems();
        currentPage.value = 1;
      }, 300);
    };

    const clear = () => {
      searchTerm.value = '';
      productLines.value = [...allProductLines.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    const retrieveProductLines = async () => {
      isFetching.value = true;
      try {
        const res = await productLineService().retrieve();
        productLines.value = res.data.map(pl => ({
          ...pl,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(pl)),
        }));
        allProductLines.value = [...productLines.value];
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => retrieveProductLines();

    const prepareRemove = (instance: IProductLine) => {
      productLines.value.forEach(pl => (pl.showDropdown = false));
      removeId.value = instance.id;
      removeEntity.value.show();
    };

    const closeDialog = () => removeEntity.value.hide();

    const removeProductLine = async () => {
      try {
        await productLineService().delete(removeId.value);
        alertService.showInfo(t$('sdiFrontendApp.productLine.deleted', { param: removeId.value }).toString(), { variant: 'danger' });

        productLines.value = productLines.value.filter(pl => pl.id !== removeId.value);
        allProductLines.value = allProductLines.value.filter(pl => pl.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const saveNewProductLine = async () => {
      if (!newProductLine.value.name) {
        alertService.showAlert('Le champ nom est requis.', 'danger');
        return;
      }

      try {
        const response = await productLineService().create(newProductLine.value);
        const added = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        productLines.value.push(added);
        allProductLines.value.push(added);
        updateTotalItems();

        showAddRow.value = false;
        newProductLine.value = {
          name: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
          notes: '',
        };

        alertService.showAlert('Ligne de produit ajoutée avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelNewProductLine = () => {
      showAddRow.value = false;
      newProductLine.value = {
        name: '',
        createDate: new Date().toISOString().split('T')[0],
        updateDate: new Date().toISOString().split('T')[0],
        notes: '',
      };
    };

    const editProductLine = productLine => {
      productLines.value.forEach(pl => (pl.showDropdown = false));
      productLine.originalData = JSON.parse(
        JSON.stringify({
          name: productLine.name,
          createDate: productLine.createDate,
          updateDate: productLine.updateDate,
          notes: productLine.notes,
        }),
      );
      productLine.isEditing = true;
    };

    const saveProductLine = async productLine => {
      try {
        const toSend = {
          id: productLine.id,
          name: productLine.name,
          createDate: productLine.createDate,
          updateDate: new Date().toISOString().split('T')[0],
          notes: productLine.notes,
        };

        const response = await productLineService().update(toSend);
        const updated = {
          ...response,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(response)),
        };

        const index = productLines.value.findIndex(pl => pl.id === productLine.id);
        if (index !== -1) productLines.value.splice(index, 1, updated);

        const allIndex = allProductLines.value.findIndex(pl => pl.id === productLine.id);
        if (allIndex !== -1) allProductLines.value.splice(allIndex, 1, updated);

        alertService.showAlert('Ligne de produit mise à jour avec succès.', 'success', { variant: 'success' });
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const cancelEdit = productLine => {
      productLine.name = productLine.originalData.name;
      productLine.createDate = productLine.originalData.createDate;
      productLine.updateDate = productLine.originalData.updateDate;
      productLine.notes = productLine.originalData.notes;
      productLine.isEditing = false;
    };

    const toggleDropdown = productLine => {
      productLines.value.forEach(pl => {
        if (pl.id !== productLine.id) pl.showDropdown = false;
      });
      productLine.showDropdown = !productLine.showDropdown;
    };

    watch(
      productLines,
      () => {
        updateTotalItems();
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    onMounted(async () => {
      await retrieveProductLines();
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown-menu-container')) {
          productLines.value.forEach(pl => (pl.showDropdown = false));
        }
      });
    });

    return {
      viewMode,
      showAddRow,
      newProductLine,
      cancelNewProductLine,
      saveNewProductLine,
      productLines,
      handleSyncList,
      isFetching,
      retrieveProductLines,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeProductLine,
      editProductLine,
      saveProductLine,
      cancelEdit,
      toggleDropdown,
      clear,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedProductLines,
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
