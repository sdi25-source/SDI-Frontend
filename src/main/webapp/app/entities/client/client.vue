<template>
  <div class="client-container section pt-5">
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <!-- Dropdown Actions -->
        <div class="dropdown mr-3">
          <button
            class="btn button-primary btn-sm dropdown-toggle rounded-1"
            type="button"
            id="actionsDropdown"
            data-bs-toggle="dropdown"
            aria-expanded="false"
            @click="toggleActionsDropdown"
          >
            Actions
          </button>
          <ul class="dropdown-menu" :class="{ show: showActionsDropdown }" aria-labelledby="actionsDropdown">
            <li>
              <router-link :to="{ name: 'ClientCreate' }" custom v-slot="{ navigate }" v-if="hasAnyAuthority('ROLE_COMMERCIAL')">
                <button
                  @click="
                    navigate();
                    closeActionsDropdown();
                  "
                  class="dropdown-item"
                  data-cy="entityCreateButton"
                >
                  <i class="bi bi-plus mr-2"></i>
                  <span v-text="t$('global.new')"></span>
                </button>
              </router-link>
            </li>
            <li>
              <button
                @click="
                  exportToCSV();
                  closeActionsDropdown();
                "
                class="dropdown-item"
                :disabled="!clients || clients.length === 0 || isExporting"
              >
                <i class="bi bi-box-arrow-up mr-2"></i>
                <span>{{ isExporting ? 'Export in progress ...' : 'Export CSV' }}</span>
              </button>
            </li>
            <li>
              <button
                @click="
                  openImportModal();
                  closeActionsDropdown();
                "
                class="dropdown-item"
                v-if="hasAnyAuthority('ROLE_COMMERCIAL')"
              >
                <i :class="isExporting ? 'bi bi-arrow-clockwise spin' : 'bi bi-box-arrow-down'" class="mr-2"></i>
                <span>Importer CSV</span>
              </button>
            </li>
          </ul>
        </div>

        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="ClientHeading">
          <span v-text="t$('sdiFrontendApp.client.home.title')" id="client-heading"></span>
          <font-awesome-icon icon="cog" class="text-secondary" style="font-size: 0.8em"></font-awesome-icon>
        </h5>
      </div>

      <div class="search-container">
        <div class="input-group">
          <input type="text" class="form-control" placeholder="Search..." v-model="searchTerm" @input="handleSearch" />
          <div class="input-group-append">
            <button class="btn btn-outline-secondary" type="button">
              <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-search" viewBox="0 0 16 16">
                <path
                  d="M11.742 10.344a6.5 6.5 0 1 0-1.397 1.398h-.001c.03.04.062.078.098.115l3.85 3.85a1 1 0 0 0 1.415-1.414l-3.85-3.85a1.007 1.007 0 0 0-.115-.1zM12 6.5a5.5 5.5 0 1 1-11 0 5.5 5.5 0 0 1 11 0z"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>

      <div class="d-flex align-items-center">
        <!-- Filters -->
        <div class="filter-item mr-3">
          <span class="filter-label">Client Type</span>
          <select v-model="selectedClientTypeFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Client Types</option>
            <option v-for="clientType in clientTypes" :key="clientType.id" :value="clientType">
              {{ clientType.type }}
            </option>
          </select>
        </div>
        <div class="filter-item mr-3">
          <span class="filter-label">Client Size</span>
          <select v-model="selectedClientSizeFilter" @change="applyFilters" class="filter-select">
            <option :value="null">All Client Sizes</option>
            <option v-for="clientSize in clientSizes" :key="clientSize.id" :value="clientSize">
              {{ clientSize.sizeName }}
            </option>
          </select>
        </div>
        <button class="btn-reset mr-3" @click="resetFilters">
          <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-x-circle" viewBox="0 0 16 16">
            <path d="M8 15A7 7 0 1 1 8 1a7 7 0 0 1 0 14zm0 1A8 8 0 1 0 8 0a8 8 0 0 0 0 16z" />
            <path
              d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708z"
            />
          </svg>
          Reset
        </button>
        <div class="pagination-info mr-3">
          <span class="text-muted small">{{ paginationInfo }}</span>
        </div>
        <div class="pagination-arrows d-flex">
          <button class="btn btn-light btn-sm mr-1" :disabled="isPrevDisabled" @click="goToPrevPage">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-chevron-left"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M11.354 1.646a.5.5 0 0 1 0 .708L5.707 8l5.647 5.646a.5.5 0 0 1-.708.708l-6-6a.5.5 0 0 1 0-.708l6-6a.5.5 0 0 1 .708 0z"
              />
            </svg>
          </button>
          <button class="btn btn-light btn-sm" :disabled="isNextDisabled" @click="goToNextPage">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              fill="currentColor"
              class="bi bi-chevron-right"
              viewBox="0 0 16 16"
            >
              <path
                fill-rule="evenodd"
                d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
              />
            </svg>
          </button>
        </div>
      </div>
    </div>

    <!-- Data table (List View) -->
    <div class="card" v-if="clients && viewMode === 'list'">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="clients">
          <thead class="thead-light">
            <tr>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.clientLogo')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.name')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.code')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.mainContactName')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.mainContactEmail')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.mainContactPhoneNumber')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.clientType')"></span></th>
              <th scope="col"><span v-text="t$('sdiFrontendApp.client.size')"></span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="client in paginatedClients" :key="client.id" data-cy="entityTable" class="align-middle">
              <td>
                <img
                  v-if="client.clientLogo"
                  :src="client.clientLogo"
                  :alt="client.name + ' logo'"
                  class="client-logo"
                  width="60"
                  height="60"
                />
                <span v-else>-</span>
              </td>
              <td>{{ client.name }}</td>
              <td>{{ client.code }}</td>
              <td>{{ client.mainContactName }}</td>
              <td>{{ client.mainContactEmail }}</td>
              <td>{{ client.mainContactPhoneNumber }}</td>
              <td>
                <div v-if="client.clientType">
                  {{ client.clientType.type }}
                </div>
              </td>
              <td>
                <div v-if="client.size">
                  {{ client.size.sizeName }}
                </div>
              </td>
              <td class="text-center">
                <div class="action-icons">
                  <router-link
                    :to="{ name: 'ClientEdit', params: { clientId: client.id } }"
                    custom
                    v-slot="{ navigate }"
                    v-if="hasAnyAuthority('ROLE_COMMERCIAL')"
                  >
                    <div @click="navigate" class="icon-container edit-container" data-cy="entityEditButton">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-pencil-fill"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M12.854.146a.5.5 0 0 0-.707 0L10.5 1.793 14.207 5.5l1.647-1.646a.5.5 0 0 0 0-.708zm.646 6.061L9.793 2.5 3.293 9H3.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.5h.5a.5.5 0 0 1 .5.5v.207zm-7.468 7.468A.5.5 0 0 1 6 13.5V13h-.5a.5.5 0 0 1-.5-.5V12h-.5a.5.5 0 0 1-.5-.5V11h-.5a.5.5 0 0 1-.5-.5V10h-.5a.5.5 0 0 1-.175-.032l-.179.178a.5.5 0 0 0-.11.168l-2 5a.5.5 0 0 0 .65.65l5-2a.5.5 0 0 0 .168-.11z"
                        />
                      </svg>
                    </div>
                  </router-link>
                  <router-link :to="{ name: 'ClientView', params: { clientId: client.id } }" custom v-slot="{ navigate }">
                    <div @click="navigate" class="icon-container edit-container" data-cy="entityDetailsButton">
                      <font-awesome-icon icon="eye"></font-awesome-icon>
                    </div>
                  </router-link>
                  <div
                    class="icon-container delete-container"
                    @click="prepareRemove(client)"
                    title="Supprimer"
                    v-if="hasAnyAuthority('ROLE_COMMERCIAL')"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" fill="currentColor" class="bi bi-x" viewBox="0 0 16 16">
                      <path
                        d="M4.646 4.646a.5.5 0 0 1 .708 0L8 7.293l2.646-2.647a.5.5 0 0 1 .708.708L8.707 8l2.647 2.646a.5.5 0 0 1-.708.708L8 8.707l-2.646 2.647a.5.5 0 0 1-.708-.708L7.293 8 4.646 5.354a.5.5 0 0 1 0-.708"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
            <tr v-if="paginatedClients.length === 0">
              <td colspan="9" class="empty-message">No customers available</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal suppression -->
    <b-modal ref="removeEntity" id="removeEntity" centered title-class="text-danger">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <font-awesome-icon icon="exclamation-triangle" class="text-danger mr-2"></font-awesome-icon>
          <span
            id="sdiFrontendApp.client.delete.question"
            data-cy="clientDeleteDialogHeading"
            v-text="t$('entity.delete.title')"
            class="font-weight-bold"
          ></span>
        </div>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-client-heading" class="mb-0" v-text="t$('sdiFrontendApp.client.delete.question', {})"></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-client"
              data-cy="entityConfirmDeleteButton"
              v-text="t$('entity.action.delete')"
              @click="removeClient()"
            ></button>
          </div>
        </div>
      </template>
    </b-modal>

    <!-- Modal Import -->
    <b-modal ref="importModal" id="importModal" centered title="Importer des clients">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <font-awesome-icon icon="upload" class="text-primary mr-2"></font-awesome-icon>
          <span class="font-weight-bold">Importer des clients</span>
        </div>
      </template>
      <div class="modal-body">
        <div class="mb-3">
          <label for="csvFile" class="form-label">Sélectionner un fichier CSV</label>
          <input type="file" class="form-control" id="csvFile" accept=".csv" @change="handleFileSelect" ref="fileInput" />
          <small class="form-text text-muted">
            Le fichier doit contenir les colonnes : Nom, Code, Contact Principal, Email, Téléphone
          </small>
        </div>
        <div v-if="importPreview.length > 0" class="mt-3">
          <h6>Aperçu des données ({{ importPreview.length }} lignes) :</h6>
          <div class="table-responsive" style="max-height: 200px; overflow-y: auto">
            <table class="table table-sm">
              <thead>
                <tr>
                  <th>Nom</th>
                  <th>Code</th>
                  <th>Contact</th>
                  <th>Email</th>
                </tr>
              </thead>
              <tbody>
                <tr v-for="(row, index) in importPreview.slice(0, 5)" :key="index">
                  <td>{{ row.name }}</td>
                  <td>{{ row.code }}</td>
                  <td>{{ row.mainContactName }}</td>
                  <td>{{ row.mainContactEmail }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" @click="closeImportModal()">Annuler</button>
            <button type="button" class="btn btn-primary" :disabled="importPreview.length === 0 || isImporting" @click="processImport()">
              <font-awesome-icon
                :icon="isImporting ? 'spinner' : 'upload'"
                :class="{ 'fa-spin': isImporting }"
                class="mr-2"
              ></font-awesome-icon>
              {{ isImporting ? 'Import en cours...' : `Importer ${importPreview.length} clients` }}
            </button>
          </div>
        </div>
      </template>
    </b-modal>
  </div>
  <section class="section"></section>
  <section class="section"></section>
  <section class="section"></section>
  <section class="section"></section>
</template>

<script>
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
      const headers = [
        'Nom',
        'Code',
        'Contact Principal',
        'Email Contact',
        'Téléphone Contact',
        'Type Client',
        'Taille Client',
        'Date Création',
        'Date Modification',
        'Notes',
      ];

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
            escapeCSVField(client.updateDate),
            escapeCSVField(client.notes),
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
            notes: values[5] || '',
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
          alertService.showSuccess(`${successCount} clients importés avec succès`);
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
      removeEntity.value.show();
    };

    const closeDialog = () => {
      removeEntity.value.hide();
    };

    const removeClient = async () => {
      try {
        await clientService().delete(removeId.value);
        const message = t$('sdiFrontendApp.client.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
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
</script>

<style scoped>
/* Styles existants conservés */
.empty-message {
  padding: 1rem;
  text-align: center;
  color: #94a3b8;
  font-style: italic;
  background-color: #f8fafc;
  border-radius: 6px;
  border: 1px dashed #e2e8f0;
}

/* Styles pour le dropdown Actions */
.dropdown {
  position: relative;
}

.dropdown-menu {
  position: absolute;
  top: 100%;
  left: 0;
  z-index: 1000;
  display: none;
  min-width: 10rem;
  padding: 0.5rem 0;
  margin: 0.125rem 0 0;
  font-size: 0.875rem;
  color: #212529;
  text-align: left;
  list-style: none;
  background-color: #fff;
  background-clip: padding-box;
  border: 1px solid rgba(0, 0, 0, 0.15);
  border-radius: 0.375rem;
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.175);
}

.dropdown-menu.show {
  display: block;
}

.dropdown-item {
  display: block;
  width: 100%;
  padding: 0.375rem 1rem;
  clear: both;
  font-weight: 400;
  color: #212529;
  text-align: inherit;
  text-decoration: none;
  white-space: nowrap;
  background-color: transparent;
  border: 0;
  cursor: pointer;
}

.dropdown-item:hover,
.dropdown-item:focus {
  color: #1e2125;
  background-color: #e9ecef;
}

.dropdown-item:disabled {
  color: #6c757d;
  pointer-events: none;
  background-color: transparent;
}

.dropdown-item .mr-2 {
  margin-right: 0.5rem;
}

/* Styles pour les filtres et autres éléments existants */
.filter-item {
  display: inline-flex;
  align-items: center;
  position: relative;
}

.filter-label {
  margin-right: 8px;
  font-size: 0.875rem;
  color: #6c757d;
}

.filter-select {
  appearance: none;
  background: transparent;
  border: none;
  padding: 4px 20px 4px 0;
  font-size: 0.875rem;
  cursor: pointer;
  font-weight: 500;
  color: #343a40;
  background-image: url("data:image/svg+xml;charset=UTF-8,%3csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 24 24' fill='none' stroke='%23343a40' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3e%3cpolyline points='6 9 12 15 18 9'%3e%3c/polyline%3e%3c/svg%3e");
  background-repeat: no-repeat;
  background-position: right center;
  background-size: 16px;
}

.filter-select:focus {
  outline: none;
}

.btn-reset {
  background: none;
  border: none;
  padding: 0;
  font: inherit;
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  color: #6c757d;
  font-size: 0.875rem;
}

.btn-reset:hover {
  color: #000;
}

.btn-reset svg {
  margin-right: 4px;
}

/* Styles pour les modales */
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  z-index: 1000;
}

.modal-backdrop-blur {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(5px);
  z-index: 1040;
}

.content-blurred {
  filter: blur(3px);
  pointer-events: none;
  user-select: none;
}

.modal-improved {
  z-index: 1050;
  position: relative;
}

.modal-content {
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.2);
  border: none;
  border-radius: 8px;
}

.modal-header {
  border-bottom: 1px solid #e9ecef;
  padding: 1rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.close {
  font-size: 1.5rem;
  font-weight: 700;
  color: #6c757d;
  opacity: 0.5;
  transition: opacity 0.15s;
}

.close:hover {
  opacity: 1;
  color: #343a40;
}

.scrollable-form {
  max-height: 80vh;
  overflow-y: auto;
  padding-right: 0rem;
}

/* Styles existants conservés */
.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #012970;
  margin-bottom: 5px;
}

.client-container {
  padding: 1.5rem;
}

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.button-primary:hover {
  background-color: #26538a;
}

.navigation-bar {
  padding: 0.5rem 0;
  border-bottom: 1px solid #e9ecef;
}

.search-container {
  width: 40%;
  max-width: 500px;
}

.card {
  border-radius: 0.5rem;
  overflow: hidden;
  border: none;
  margin-top: 1.5rem;
}

.table th {
  border-top: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #6c757d;
}

.table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
}

.btn-group .btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
}

.action-icons {
  display: flex;
  justify-content: center;
  gap: 16px;
}

.icon-container {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 4px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.icon-container:active {
  background-color: rgba(0, 0, 0, 0.1);
}

.icon-container:hover {
  background-color: rgba(0, 0, 0, 0.05);
}

.save-container {
  color: #0c2d57;
}

.cancel-container {
  color: #6c757d;
}

.edit-container {
  color: #0c2d57;
}

.delete-container {
  color: #0c2d57;
}

.view-container {
  color: #0c2d57;
}

.icon-save,
.icon-cancel {
  width: 20px;
  height: 20px;
}

.form-control-borderless {
  display: block;
  width: 100%;
  height: calc(1.5em + 0.75rem + 2px);
  padding: 0.375rem 0;
  font-size: 1rem;
  font-weight: 400;
  line-height: 1.5;
  color: #495057;
  background-color: transparent;
  border: none;
  border-bottom: 1px solid #ced4da;
  border-radius: 0;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-control-borderless:focus {
  outline: none;
  box-shadow: none;
  border-bottom: 2px solid #007bff;
}

.add-row {
  background-color: rgba(0, 123, 255, 0.03);
}

.view-toggle .btn.active {
  background-color: #e9ecef;
  border-color: #dee2e6;
}

.pagination-info {
  color: #6c757d;
}

.pagination-arrows .btn {
  padding: 0.25rem 0.5rem;
  font-size: 0.875rem;
  line-height: 1.5;
  border-radius: 0.2rem;
}

.card {
  background-color: white;
  border-radius: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  border: 1px solid #e2e8f0;
  overflow: hidden;
  display: flex;
  flex-direction: column;
}

.card-view-container {
  margin-top: 1.5rem;
}

.client-card {
  box-shadow: 0 0.125rem 0.25rem rgba(0, 0, 0, 0.075);
  transition:
    transform 0.2s ease,
    box-shadow 0.2s ease;
}

.client-card:hover {
  transform: translateY(-3px);
  box-shadow: 0 0.5rem 1rem rgba(0, 0, 0, 0.1);
}

.client-type-card .card-header {
  background-color: #f8f9fa;
  border-bottom: 1px solid rgba(0, 0, 0, 0.05);
  padding: 0.75rem 1rem;
}

.client-info {
  display: flex;
  flex-direction: column;
  gap: 0.75rem;
}

.info-row {
  display: flex;
  flex-direction: column;
}

.info-label {
  font-weight: 600;
  font-size: 0.8rem;
  color: #6c757d;
  margin-bottom: 0.25rem;
}

.info-value {
  color: #212529;
}

.notes-text {
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.new-card {
  border: 1px dashed #dee2e6;
  background-color: #f8f9fa;
}

.user-form-container {
  padding: 0;
  max-width: 100%;
}

.user-edit {
  padding: 0;
  background-color: transparent;
}
</style>
