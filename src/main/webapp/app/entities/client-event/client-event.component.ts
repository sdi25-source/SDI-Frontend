import { type Ref, defineComponent, inject, onMounted, ref, computed, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import ClientEventService from './client-event.service';
import ClientService from '@/entities/client/client.service.ts';
import ClientEventTypeService from '../client-event-type/client-event-type.service';
import { type IClientEvent } from '@/shared/model/client-event.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';
import type AccountService from '@/account/account.service.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEvent',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const clientEventService = inject('clientEventService', () => new ClientEventService());
    const clientService = inject('clientService', () => new ClientService());
    const clientEventTypeService = inject('clientEventTypeService', () => new ClientEventTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);
    const accountService = inject<AccountService>('accountService');

    const hasAnyAuthorityValues: Ref<any> = ref({});
    const clientEvents = ref<IClientEvent[]>([]);
    const allClientEvents = ref<IClientEvent[]>([]);
    const clients = ref([]);
    const clientEventTypes = ref([]);
    const searchTerm = ref('');
    const searchTimeout = ref<NodeJS.Timeout | null>(null);
    const selectedClientFilter = ref(null);
    const selectedEventTypeFilter = ref(null);

    // Pagination
    const currentPage = ref(1);
    const itemsPerPage = ref(10);
    const totalItems = ref(0);
    const isFetching = ref(false);
    const removeId = ref<number | null>(null);
    const removeEntity = ref<any>(null);

    // Computed properties for pagination
    const paginatedClientEvents = computed(() => {
      const start = (currentPage.value - 1) * itemsPerPage.value;
      const end = start + itemsPerPage.value;
      return clientEvents.value.slice(start, end);
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

    // Pagination methods
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
      if (clientEvents.value) {
        totalItems.value = clientEvents.value.length;
      } else {
        totalItems.value = 0;
      }
    };

    // Apply filters
    const applyFilters = () => {
      let filteredEvents = [...allClientEvents.value];

      // Filter by client
      if (selectedClientFilter.value) {
        filteredEvents = filteredEvents.filter(event => event.client?.id === selectedClientFilter.value.id);
      }

      // Filter by event type
      if (selectedEventTypeFilter.value) {
        filteredEvents = filteredEvents.filter(event => event.clientEventType?.id === selectedEventTypeFilter.value.id);
      }

      // Apply search
      if (searchTerm.value.trim() !== '') {
        const searchTermLower = searchTerm.value.toLowerCase();
        filteredEvents = filteredEvents.filter(
          event =>
            (event.event && event.event.toLowerCase().includes(searchTermLower)) ||
            (event.description && event.description.toLowerCase().includes(searchTermLower)) ||
            (event.notes && event.notes.toLowerCase().includes(searchTermLower)) ||
            (event.client?.code && event.client.code.toLowerCase().includes(searchTermLower)) ||
            (event.clientEventType?.type && event.clientEventType.type.toLowerCase().includes(searchTermLower)),
        );
      }

      clientEvents.value = filteredEvents;
      updateTotalItems();
      currentPage.value = 1;
    };

    // Reset filters
    const resetFilters = () => {
      selectedClientFilter.value = null;
      selectedEventTypeFilter.value = null;
      searchTerm.value = '';
      clientEvents.value = [...allClientEvents.value];
      updateTotalItems();
      currentPage.value = 1;
    };

    // Search method
    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      searchTimeout.value = setTimeout(() => {
        applyFilters();
      }, 300);
    };

    // Fetch clients
    const retrieveClients = async () => {
      try {
        const res = await clientService().retrieve();
        clients.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    // Fetch client event types
    const retrieveClientEventTypes = async () => {
      try {
        const res = await clientEventTypeService().retrieve();
        clientEventTypes.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      }
    };

    // Fetch client events
    const retrieveClientEvents = async () => {
      isFetching.value = true;
      try {
        const res = await clientEventService().retrieve();
        clientEvents.value = res.data;
        allClientEvents.value = res.data;
        updateTotalItems();
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveClientEvents();
    };

    const prepareRemove = (instance: IClientEvent) => {
      removeId.value = instance.id;
      removeEntity.value = true;
    };

    const closeDialog = () => {
      removeEntity.value = false;
      removeId.value = null;
    };

    const removeClientEvent = async () => {
      try {
        await clientEventService().delete(removeId.value);
        const message = t$('sdiFrontendApp.clientEvent.deleted', { param: removeId.value }).toString();
        // alertService.showInfo(message, { variant: 'danger' });
        clientEvents.value = clientEvents.value.filter(c => c.id !== removeId.value);
        allClientEvents.value = allClientEvents.value.filter(c => c.id !== removeId.value);
        updateTotalItems();
        removeId.value = null;
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    // Watch for changes in clientEvents to update pagination
    watch(
      clientEvents,
      () => {
        updateTotalItems();
        if (currentPage.value > totalPages.value && totalPages.value > 0) {
          currentPage.value = totalPages.value;
        }
      },
      { deep: true },
    );

    onMounted(async () => {
      await retrieveClients();
      await retrieveClientEventTypes();
      await retrieveClientEvents();
    });

    return {
      clientEvents,
      allClientEvents,
      clients,
      clientEventTypes,
      isFetching,
      removeId,
      removeEntity,
      searchTerm,
      searchTimeout,
      selectedClientFilter,
      selectedEventTypeFilter,
      currentPage,
      itemsPerPage,
      totalItems,
      paginatedClientEvents,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      paginationInfo,
      handleSyncList,
      retrieveClientEvents,
      prepareRemove,
      closeDialog,
      removeClientEvent,
      handleSearch,
      applyFilters,
      resetFilters,
      goToNextPage,
      goToPrevPage,
      accountService,
      hasAnyAuthorityValues,
      t$,
      ...dataUtils,
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
