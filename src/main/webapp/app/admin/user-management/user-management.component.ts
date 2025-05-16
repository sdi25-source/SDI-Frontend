import { defineComponent, inject, ref, type Ref, type ComputedRef, computed, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import UserManagementService from './user-management.service';
import { useAlertService } from '@/shared/alert/alert.service';
import { useDateFormat } from '@/shared/composables';
import JhiUserManagementView from './user-management-view.vue';
import JhiUserManagementEdit from './user-management-edit.vue';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'JhiUserManagementComponent',
  components: {
    JhiUserManagementView,
    JhiUserManagementEdit,
  },
  setup() {
    const alertService = inject('alertService', () => useAlertService(), true);
    const userManagementService = inject('userManagementService', () => new UserManagementService(), true);
    const username = inject<ComputedRef<string>>('currentUsername');
    const { formatDateShort: formatDate } = useDateFormat();
    const { t } = useI18n();

    const error = ref('');
    const success = ref('');
    const itemsPerPage = ref(20);
    const page = ref(1);
    const previousPage = ref(1);
    const propOrder = ref('id');
    const reverse = ref(false);
    const isLoading = ref(false);
    const removeId: Ref<string | null> = ref(null);
    const users = ref([]);
    const totalItems = ref(0);
    const queryCount = ref(0);
    const searchTerm = ref('');
    const searchTimeout = ref(null);
    const allUsers = ref([]);

    const removeUser = ref(null);

    // Modals
    const showDetailsModal = ref(false);
    const showCreateModal = ref(false);
    const showEditModal = ref(false);
    const selectedUserId = ref(null);

    // Computed properties pour la pagination
    const paginationInfo = computed(() => {
      if (totalItems.value === 0) return '0-0 / 0';

      const start = (page.value - 1) * itemsPerPage.value + 1;
      const end = Math.min(start + itemsPerPage.value - 1, totalItems.value);
      return `${start}-${end} / ${totalItems.value}`;
    });

    const totalPages = computed(() => {
      return Math.ceil(totalItems.value / itemsPerPage.value);
    });

    const isPrevDisabled = computed(() => {
      return page.value <= 1;
    });

    const isNextDisabled = computed(() => {
      return page.value >= totalPages.value;
    });

    // Méthode de recherche
    const handleSearch = () => {
      if (searchTimeout.value) {
        clearTimeout(searchTimeout.value);
      }

      searchTimeout.value = setTimeout(() => {
        if (searchTerm.value.trim() === '') {
          users.value = [...allUsers.value];
        } else {
          const searchTermLower = searchTerm.value.toLowerCase();
          users.value = allUsers.value.filter(
            user =>
              (user.login && user.login.toLowerCase().includes(searchTermLower)) ||
              (user.email && user.email.toLowerCase().includes(searchTermLower)) ||
              (user.firstName && user.firstName.toLowerCase().includes(searchTermLower)) ||
              (user.lastName && user.lastName.toLowerCase().includes(searchTermLower)),
          );
        }
        updateTotalItems();
        page.value = 1; // Retour à la première page après une recherche
      }, 300);
    };

    const updateTotalItems = () => {
      if (users.value) {
        totalItems.value = users.value.length;
        queryCount.value = users.value.length;
      } else {
        totalItems.value = 0;
        queryCount.value = 0;
      }
    };

    const loadAll = () => {
      isLoading.value = true;
      userManagementService
        .retrieve({
          sort: sort(),
          page: page.value - 1,
          size: itemsPerPage.value,
        })
        .then(res => {
          users.value = res.data;
          allUsers.value = [...res.data]; // Copie pour la recherche
          totalItems.value = parseInt(res.headers['x-total-count'], 10);
          queryCount.value = totalItems.value;
          isLoading.value = false;
        })
        .catch(() => {
          isLoading.value = false;
        });
    };

    const setActive = (user, isActivated) => {
      user.activated = isActivated;
      userManagementService
        .update(user)
        .then(() => {
          error.value = '';
          success.value = 'OK';
          loadAll();
        })
        .catch(() => {
          success.value = '';
          error.value = 'ERROR';
          user.activated = !isActivated;
        });
    };

    const sort = () => {
      const result = [`${propOrder.value},${reverse.value ? 'desc' : 'asc'}`];
      if (propOrder.value !== 'id') {
        result.push('id');
      }
      return result;
    };

    const loadPage = pageToLoad => {
      if (pageToLoad !== previousPage.value) {
        previousPage.value = pageToLoad;
        page.value = pageToLoad;
        transition();
      }
    };

    const transition = () => {
      loadAll();
    };

    const changeOrder = order => {
      propOrder.value = order;
      reverse.value = !reverse.value;
      transition();
    };

    const prepareRemove = user => {
      if (username.value === user.login) return;
      removeId.value = user.login;
      if (removeUser.value) {
        removeUser.value.show();
      }
    };

    const deleteUser = () => {
      userManagementService
        .remove(removeId.value)
        .then(response => {
          alertService.showInfo(
            t(response.headers['x-frontendapp-alert'].toString(), {
              param: decodeURIComponent(response.headers['x-frontendapp-params'].replace(/\+/g, ' ')),
            }),
            { variant: 'danger' },
          );

          removeId.value = null;
          loadAll();
          closeDialog();
        })
        .catch(error => {
          alertService.showHttpError(error.response);
        });
    };

    const closeDialog = () => {
      if (removeUser.value) {
        removeUser.value.hide();
      }
    };

    const handleSyncList = () => {
      loadAll();
    };

    // Méthodes pour les modals
    const openDetailsModal = userId => {
      selectedUserId.value = userId;
      showDetailsModal.value = true;
    };

    const openEditModal = userId => {
      selectedUserId.value = userId;
      showEditModal.value = true;
    };

    const handleUserSaved = () => {
      showCreateModal.value = false;
      showEditModal.value = false;
      loadAll();
    };

    onMounted(() => {
      loadAll();
    });

    return {
      alertService,
      userManagementService,
      formatDate,
      t$: t,
      username,
      error,
      success,
      itemsPerPage,
      page,
      previousPage,
      propOrder,
      reverse,
      isLoading,
      removeId,
      users,
      totalItems,
      queryCount,
      removeUser,
      // Pagination
      paginationInfo,
      totalPages,
      isPrevDisabled,
      isNextDisabled,
      // Recherche
      searchTerm,
      handleSearch,
      // Méthodes
      loadAll,
      setActive,
      sort,
      loadPage,
      transition,
      changeOrder,
      prepareRemove,
      deleteUser,
      closeDialog,
      handleSyncList,
      // Modals
      showDetailsModal,
      showCreateModal,
      showEditModal,
      selectedUserId,
      openDetailsModal,
      openEditModal,
      handleUserSaved,
    };
  },
});
