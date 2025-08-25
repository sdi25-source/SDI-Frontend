import { defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ClientService from './client.service';
import ClientTypeService from '../client-type/client-type.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';
import ClientSizeService from '@/entities/client-size/client-size.service';
import AccountService from '@/account/account.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Client',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const clientService = inject('clientService', () => new ClientService());
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const accountService = inject('accountService', () => new AccountService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const hasAnyAuthorityValues = ref({});
    const clients = ref([]);
    const allClients = ref([]);
    const clientTypes = ref([]);
    const clientSizes = ref([]);
    const viewMode = ref('list');
    const searchTerm = ref('');
    const searchTimeout = ref(null);
    const selectedClientTypeFilter = ref(null);
    const selectedClientSizeFilter = ref(null);

    // Actions dropdown
    const showActionsDropdown = ref(false);

    // Export/Import states
    const isExporting = ref(false);
    const isImporting = ref(false);
    const importPreview = ref([]);
    const fileInput = ref(null);
    const importModal = ref(null);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);
    const isFetching = ref(false);
    const showAddRow = ref(false);
    const showDetailseModal = ref(false);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const selectedClientId = ref(null);
    const removeId = ref(null);
    const removeEntity = ref(null);

    const newClient = ref({
      name: '',
      firstName: '',
      clientTypeId: null,
      email: '',
      phone: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
      notes: '',
    });

    // Actions dropdown methods
    const toggleActionsDropdown = () => {
      showActionsDropdown.value = !showActionsDropdown.value;
    };

    const closeActionsDropdown = () => {
      showActionsDropdown.value = false;
    };

    // Export methods
    const escapeCSVField = field => {
      if (field === null || field === undefined) return '';
      const stringField = String(field);
      if (stringField.includes(',') || stringField.includes('"') || stringField.includes('\n')) {
        return `"${stringField.replace(/"/g, '""')}"`;
      }
      return stringField;
    };

    const convertToCSV = data => {
      const headers = ['Name', 'Code', 'Main Contact', 'Main Email', 'Phone', 'Client type', 'Client size', 'Created at'];

      const csvContent = [
        headers.join(','),
        ...data.map(client =>
          [
            escapeCSVField(client.name),
            escapeCSVField(client.code),
            escapeCSVField(client.mainContactName),
            escapeCSVField(client.mainContactEmail),
            escapeCSVField(client.mainContactPhoneNumber),
            escapeCSVField(client.clientType?.type),
            escapeCSVField(client.size?.sizeName),
            escapeCSVField(client.createDate),
          ].join(','),
        ),
      ].join('\n');

      return csvContent;
    };

    const downloadCSV = (csvContent, filename) => {
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const link = document.createElement('a');
      const url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    };

    const exportToCSV = async () => {
      if (!clients.value || clients.value.length === 0) {
        alertService.showError('Aucune donnée à exporter');
        return;
      }

      isExporting.value = true;
      try {
        const dataToExport = clients.value;
        const csvContent = convertToCSV(dataToExport);
        const today = new Date().toISOString().split('T')[0];
        const filename = `clients_export_${today}.csv`;

        downloadCSV(csvContent, filename);
        alertService.showSuccess(`Export réussi : ${dataToExport.length} clients exportés`);
      } catch (error) {
        console.error("Erreur lors de l'export:", error);
        alertService.showError("Erreur lors de l'export des données");
      } finally {
        isExporting.value = false;
      }
    };

    // Import methods
    const openImportModal = () => {
      importModal.value.show();
    };

    const closeImportModal = () => {
      importModal.value.hide();
      importPreview.value = [];
      if (fileInput.value) {
        fileInput.value.value = '';
      }
    };

    const parseCSV = csvText => {
      const lines = csvText.split('\n').filter(line => line.trim());
      if (lines.length < 2) return [];

      const headers = lines[0].split(',').map(h => h.trim().replace(/"/g, ''));
      const data = [];

      for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim().replace(/"/g, ''));
        if (values.length >= 4) {
          data.push({
            name: values[0] || '',
            code: values[1] || '',
            mainContactName: values[2] || '',
            mainContactEmail: values[3] || '',
            mainContactPhoneNumber: values[4] || '',
            clientTypeId: null,
            sizeId: null,
          });
        }
      }

      return data;
    };

    const handleFileSelect = event => {
      const file = event.target.files[0];
      if (!file) return;

      if (!file.name.toLowerCase().endsWith('.csv')) {
        alertService.showError('Veuillez sélectionner un fichier CSV');
        return;
      }

      const reader = new FileReader();
      reader.onload = e => {
        try {
          const csvText = e.target.result;
          const parsedData = parseCSV(csvText);
          importPreview.value = parsedData;

          if (parsedData.length === 0) {
            alertService.showError('Le fichier CSV ne contient pas de données valides');
          }
        } catch (error) {
          console.error('Erreur lors de la lecture du fichier:', error);
          alertService.showError('Erreur lors de la lecture du fichier CSV');
        }
      };
      reader.readAsText(file);
    };

    const processImport = async () => {
      if (importPreview.value.length === 0) return;

      isImporting.value = true;
      try {
        let successCount = 0;
        let errorCount = 0;

        for (const clientData of importPreview.value) {
          try {
            await clientService().create(clientData);
            successCount++;
          } catch (error) {
            console.error('Erreur lors de la création du client:', error);
            errorCount++;
          }
        }

        if (successCount > 0) {
          // alertService.showSuccess(`${successCount} clients importés avec succès`);
          await retrieveClients();
        }

        if (errorCount > 0) {
          alertService.showWarning(`${errorCount} clients n'ont pas pu être importés`);
        }

        closeImportModal();
      } catch (error) {
        console.error("Erreur lors de l'import:", error);
        alertService.showError("Erreur lors de l'import des données");
      } finally {
        isImporting.value = false;
      }
    };

    // Computed properties pour la pagination
    const paginatedClients = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return clients.value.slice(start, end);
    });

    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / itemsPerPage.value);
    });

    const isPrevDisabled = computed(() => {
      return currentPage.value <= 1;
    });

    const isNextDisabled = computed(() => {
      return currentPage.value >= totalPages.value;
    });

    const paginationInfo = computed(() => {
      if (totalItems.value === 0) return '0-0 / 0';
      const start = (currentPage.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(start + itemsPerPage.value - 1, totalItems.value);
      return `${start}-${end} / ${totalItems.value}`;
    });

    // Méthodes de pagination
    const goToNextPage = () => {
      if (!isNextDisabled.value) {
        currentPage.value++;
      }
    };

    const goToPrevPage = () => {
      if (!isPrevDisabled.value) {
        currentPage.value--;
      }
    };

    const updateTotalItems = () => {
      if (clients.value) {
        totalItems.value = clients.value.length;
      } else {
        totalItems.value = 0;
      }
    };

    // Méthode pour appliquer les filtres
    const applyFilters = () => {
      let filteredClients = [...allClients.value];

      // Filtrer par clientType
      if (selectedClientTypeFilter.value) {
        filteredClients = filteredClients.filter(client => client.clientType?.id === selectedClientTypeFilter.value.id);
      }

      // Filtrer par clientSize
      if (selectedClientSizeFilter.value) {
        filteredClients = filteredClients.filter(client => client.size?.id === selectedClientSizeFilter.value.id);
      }

      // Appliquer la recherche
      if (searchTerm.value.trim() !== '') {
        const searchTermLower = searchTerm.value.toLowerCase();
        filteredClients = filteredClients.filter(
          client =>
            (client.name && client.name.toLowerCase().includes(searchTermLower)) ||
            (client.firstName && client.firstName.toLowerCase().includes(searchTermLower)) ||
            (client.email && client.email.toLowerCase().includes(searchTermLower)) ||
            (client.phone && client.phone.toLowerCase().includes(searchTermLower)) ||
            (client.notes && client.notes.toLowerCase().includes(searchTermLower)) ||
            (client.clientType && client.clientType.type.toLowerCase().includes(searchTermLower)),
        );
      }

      clients.value = filteredClients;
      updateTotalItems();
      currentPage.value = 1;
    };

    // Réinitialiser les filtres
    const resetFilters = () => {
      selectedClientTypeFilter.value = null;
      selectedClientSizeFilter.value = null;
      searchTerm.value = '';
      clients.value = [...allClients.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    // Méthode de recherche
    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }
      searchTimeout.value = setTimeout(() => {
        applyFilters();
      }, 300);
    };

    // Récupérer les types de clients
    const retrieveClientTypes = async () => {
      try {
        const res = await clientTypeService().retrieve();
        clientTypes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    // Récupérer les tailles de clients
    const retrieveClientSizes = async () => {
      try {
        const res = await clientSizeService().retrieve();
        clientSizes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    const retrieveClients = async () => {
      isFetching.value = true;
      try {
        const res = await clientService().retrieve();
        const loadedClients = res.data;
        const clientsWithDetails = await Promise.all(
          loadedClients.map(async client => {
            if (client.size?.id) {
              try {
                client.size = await clientSizeService().find(client.size.id);
              } catch (sizeError) {
                console.error('Erreur de chargement du client size:', sizeError);
              }
            }
            if (client.clientType?.id) {
              try {
                client.clientType = await clientTypeService().find(client.clientType.id);
              } catch (typeError) {
                console.error('Erreur de chargement du client type:', typeError);
              }
            }
            return client;
          }),
        );
        clients.value = clientsWithDetails;
        allClients.value = clientsWithDetails;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClients();
    };

    const prepareRemove = instance => {
      clients.value.forEach(c => {
        if (c.showDropdown) {
          c.showDropdown = false;
        }
      });
      removeId.value = instance.id;
      removeEntity.value = true;
    };

    const closeDialog = () => {
      removeEntity.value = false;
    };

    const removeClient = async () => {
      try {
        await clientService().delete(removeId.value);
        const message = t$('sdiFrontendApp.client.deleted', { param: removeId.value }).toString();
        // alertService.showInfo(message, { variant: 'danger' });
        clients.value = clients.value.filter(c => c.id !== removeId.value);
        allClients.value = allClients.value.filter(c => c.id !== removeId.value);
        updateTotalItems();
        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    watch(
      clients,
      () => {
        updateTotalItems();
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    onMounted(async () => {
      await retrieveClientTypes();
      await retrieveClientSizes();
      await retrieveClients();

      // Close dropdown when clicking outside
      document.addEventListener('click', event => {
        if (!event.target.closest('.dropdown')) {
          showActionsDropdown.value = false;
        }
        if (!event.target.closest('.dropdown-menu-container')) {
          clients.value.forEach(item => {
            item.showDropdown = false;
          });
        }
      });
    });

    return {
      showDetailseModal,
      showCreateModal,
      selectedClientId,
      showEditModal,
      viewMode,
      showAddRow,
      newClient,
      clients,
      clientTypes,
      clientSizes,
      handleSyncList,
      isFetching,
      retrieveClients,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClient,
      t$,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedClients,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      goToNextPage,
      goToPrevPage,
      searchTerm,
      handleSearch,
      selectedClientTypeFilter,
      selectedClientSizeFilter,
      applyFilters,
      resetFilters,
      accountService,
      hasAnyAuthorityValues,
      // Actions dropdown
      showActionsDropdown,
      toggleActionsDropdown,
      closeActionsDropdown,
      // Export/Import
      isExporting,
      isImporting,
      exportToCSV,
      openImportModal,
      closeImportModal,
      handleFileSelect,
      processImport,
      importPreview,
      fileInput,
      importModal,
      ...dataUtils,
    };
  },
  methods: {
    openDetailsModal(id) {
      this.selectedClientId = id;
      this.showDetailseModal = true;
    },
    openEditModal(id) {
      this.selectedClientId = id;
      this.showEditModal = true;
    },
    hasAnyAuthority(authorities) {
      this.accountService.hasAnyAuthorityAndCheckAuth(authorities).then(value => {
        if (this.hasAnyAuthorityValues[authorities] !== value) {
          this.hasAnyAuthorityValues = { ...this.hasAnyAuthorityValues, [authorities]: value };
        }
      });
      return this.hasAnyAuthorityValues[authorities] ?? false;
    },
  },
});
