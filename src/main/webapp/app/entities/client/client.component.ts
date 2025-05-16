import { defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ClientService from './client.service';
import ClientTypeService from '../client-type/client-type.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';
import ClientSizeService from '@/entities/client-size/client-size.service.ts';
import ClientUpdate from '@/entities/client/client-update.vue';
import ClientDetails from '@/entities/client/client-details.vue';
import JhiUserManagementEdit from '@/admin/user-management/user-management-edit.component.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Client',
  components: {
    JhiUserManagementEdit,
    ClientUpdate,
    ClientDetails,
  },
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const clientService = inject('clientService', () => new ClientService());
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clients = ref([]);
    const allClients = ref([]); // Pour stocker tous les clients non filtrés
    const clientTypes = ref([]); // Pour les types de clients
    const viewMode = ref('list'); // 'list' ou 'card'
    const searchTerm = ref('');
    const searchTimeout = ref(null);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(5);
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

    // Méthode de recherche
    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          clients.value = [...allClients.value];
        } else {
          const searchTermLower = searchTerm.value.toLowerCase();
          clients.value = allClients.value.filter(
            client =>
              (client.name && client.name.toLowerCase().includes(searchTermLower)) ||
              (client.firstName && client.firstName.toLowerCase().includes(searchTermLower)) ||
              (client.email && client.email.toLowerCase().includes(searchTermLower)) ||
              (client.phone && client.phone.toLowerCase().includes(searchTermLower)) ||
              (client.notes && client.notes.toLowerCase().includes(searchTermLower)) ||
              (client.clientType && client.clientType.type.toLowerCase().includes(searchTermLower)),
          );
        }
        updateTotalItems();
        currentPage.value = 1; // Retour à la première page après une recherche
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

    const retrieveClients = async () => {
      isFetching.value = true;
      try {
        const res = await clientService().retrieve();
        const loadedClients = res.data;
        const clientsWithDetails = await Promise.all(
          loadedClients.map(async client => {
            // Charger le size complet
            if (client.size?.id) {
              try {
                client.size = await clientSizeService().find(client.size.id);
              } catch (sizeError) {
                console.error('Erreur de chargement du client size:', sizeError);
              }
            }
            // Charger le type complet
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

        // Mettre à jour les listes
        clients.value = clients.value.filter(c => c.id !== removeId.value);
        allClients.value = allClients.value.filter(c => c.id !== removeId.value);
        updateTotalItems();

        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const toggleDropdown = client => {
      clients.value.forEach(item => {
        if (item.id !== client.id) {
          item.showDropdown = false;
        }
      });
      client.showDropdown = !client.showDropdown;
    };

    watch(
      clients,
      () => {
        updateTotalItems();
        // Si la page actuelle est supérieure au nombre total de pages, revenir à la dernière page
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    onMounted(async () => {
      await retrieveClientTypes();
      await retrieveClients();

      // Fermer les dropdowns quand on clique ailleurs
      document.addEventListener('click', event => {
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
      handleSyncList,
      isFetching,
      retrieveClients,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeClient,
      toggleDropdown,
      t$,
      // Pagination
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
      // Recherche
      searchTerm,
      handleSearch,
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
    handleClientUpdated() {
      this.showEditModal = false;
      this.retrieveClients();
    },
  },
});
