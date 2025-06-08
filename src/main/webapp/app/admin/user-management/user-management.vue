<template>
  <div class="user-management-container section pt-5">
    <div class="navigation-bar d-flex align-items-center justify-content-between mb-4">
      <div class="d-flex align-items-center">
        <router-link :to="{ name: 'JhiUserCreate' }" custom v-slot="{ navigate }">
          <button @click="navigate" id="jh-create-entity" data-cy="entityCreateButton" class="btn button-primary btn-sm mr-3 rounded-1">
            <font-awesome-icon icon="plus"></font-awesome-icon>
            <span v-text="t$('global.new')"></span>
          </button>
        </router-link>
        <h5 id="page-heading" class="m-0 font-weight-bold" data-cy="UserManagementHeading">
          <span v-text="t$('userManagement.home.title')" id="user-management-heading"></span>
          <font-awesome-icon icon="cog" class="text-secondary ml-2" style="font-size: 0.8em"></font-awesome-icon>
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
        <div class="pagination-info mr-3">
          <span class="text-muted small">{{ paginationInfo }}</span>
        </div>
        <div class="pagination-arrows d-flex">
          <button class="btn btn-light btn-sm mr-1" :disabled="isPrevDisabled" @click="loadPage(page - 1)">
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
          <button class="btn btn-light btn-sm" :disabled="isNextDisabled" @click="loadPage(page + 1)">
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
        <button class="btn btn-light btn-sm ml-3" @click="handleSyncList" :disabled="isLoading">
          <font-awesome-icon icon="sync" :spin="isLoading"></font-awesome-icon>
          <span v-text="t$('userManagement.home.refreshListLabel')"></span>
        </button>
      </div>
    </div>

    <div class="card" v-if="users">
      <div class="table-responsive">
        <table class="table table-hover mb-0" aria-describedby="users">
          <thead class="thead-light">
            <tr>
              <th scope="col" @click="changeOrder('login')">
                <span v-text="t$('userManagement.login')" class="pl-3"></span>
                <jhi-sort-indicator :current-order="propOrder" :reverse="reverse" field-name="login" />
              </th>
              <th scope="col" @click="changeOrder('email')">
                <span v-text="t$('userManagement.email')"></span>
              </th>
              <th scope="col"><span v-text="t$('userManagement.profiles')"></span></th>
              <th scope="col" @click="changeOrder('lastModifiedBy')">
                {{ t$('userManagement.lastModifiedBy') }}
              </th>
              <th scope="col"><span>Status</span></th>
              <th scope="col" width="160" class="text-center">Actions</th>
            </tr>
          </thead>
          <tbody>
            <tr v-for="user in users" :key="user.id" :id="user.login" data-cy="entityTable" class="align-middle">
              <td>
                <span class="pl-3">{{ user.login }}</span>
              </td>
              <td>{{ user.email }}</td>
              <td>
                <div v-for="authority in user.authorities" :key="authority">
                  <span class="badge bg-info text-dark rounded-2">
                    {{ authority === 'ROLE_USER' ? 'DELIVERY MANAGER' : authority.replace('ROLE_', '') }}
                  </span>
                </div>
              </td>
              <td>
                <span v-if="user.lastModifiedBy">{{ user.lastModifiedBy }}</span>
                <span v-else>-</span>
              </td>
              <td>
                <button
                  class="btn btn-danger btn-sm deactivated rounded-1"
                  @click="setActive(user, true)"
                  v-if="!user.activated"
                  v-text="t$('userManagement.deactivated')"
                ></button>
                <button
                  class="btn btn-success btn-sm rounded-1"
                  @click="setActive(user, false)"
                  v-if="user.activated"
                  :disabled="username === user.login"
                  v-text="t$('userManagement.activated')"
                ></button>
              </td>
              <td class="text-center">
                <div class="action-icons">
                  <router-link :to="{ name: 'JhiUserEdit', params: { userId: user.login } }" custom v-slot="{ navigate }">
                    <div class="icon-container edit-container" title="Modifier" @click="navigate">
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
                  <router-link :to="{ name: 'JhiUserView', params: { userId: user.login } }" custom v-slot="{ navigate }">
                    <div class="icon-container view-container" title="Voir" @click="navigate">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="16"
                        height="16"
                        fill="currentColor"
                        class="bi bi-eye"
                        viewBox="0 0 16 16"
                      >
                        <path
                          d="M16 8s-3-5.5-8-5.5S0 8 0 8s3 5.5 8 5.5S16 8 16 8M1.173 8a13.133 13.133 0 0 1 1.66-2.043C4.12 4.668 5.88 3.5 8 3.5c2.12 0 3.879 1.168 5.168 2.457A13.133 13.133 0 0 1 14.828 8c-.058.087-.122.183-.195.288-.335.48-.83 1.12-1.465 1.755C11.879 11.332 10.119 12.5 8 12.5c-2.12 0-3.879-1.168-5.168-2.457A13.134 13.134 0 0 1 1.172 8z"
                        />
                        <path d="M8 5.5a2.5 2.5 0 1 0 0 5 2.5 2.5 0 0 0 0-5M4.5 8a3.5 3.5 0 1 1 7 0 3.5 3.5 0 0 1-7 0" />
                      </svg>
                    </div>
                  </router-link>
                  <div
                    class="icon-container delete-container"
                    @click="prepareRemove(user)"
                    title="Supprimer"
                    :class="{ disabled: username === user.login }"
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 384 512" class="icon-cancel" width="14" height="14">
                      <path
                        d="M342.6 150.6c12.5-12.5 12.5-32.8 0-45.3s-32.8-12.5-45.3 0L192 210.7 86.6 105.4c-12.5-12.5-32.8-12.5-45.3 0s-12.5 32.8 0 45.3L146.7 256 41.4 361.4c-12.5 12.5-12.5 32.8 0 45.3s32.8 12.5 45.3 0L192 301.3 297.4 406.6c12.5 12.5 32.8 12.5 45.3 0s12.5-32.8 0-45.3L237.3 256 342.6 150.6z"
                        fill="currentColor"
                      />
                    </svg>
                  </div>
                </div>
              </td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>

    <!-- Modal suppression -->
    <b-modal ref="removeUser" id="removeUser" centered title-class="text-danger" @hidden="onModalHidden">
      <template #modal-title>
        <div class="d-flex align-items-center">
          <font-awesome-icon icon="exclamation-triangle" class="text-danger mr-2"></font-awesome-icon>
          <span
            id="sdiFrontendApp.client.delete.question"
            data-cy="userDeleteDialogHeading"
            v-text="t$('entity.delete.title')"
            class="font-weight-bold"
          ></span>
        </div>
      </template>
      <div class="modal-body">
        <p id="jhi-delete-user-heading" class="mb-0" v-text="t$('userManagement.delete.question', { login: removeId })"></p>
      </div>
      <template #modal-footer>
        <div class="w-100">
          <div class="d-flex justify-content-between">
            <button type="button" class="btn btn-secondary" v-text="t$('entity.action.cancel')" @click="closeDialog()"></button>
            <button
              type="button"
              class="btn btn-danger"
              id="jhi-confirm-delete-user"
              data-cy="entityConfirmDeleteButton"
              v-text="t$('entity.action.delete')"
              @click="deleteUser()"
              :disabled="isDeleting"
            ></button>
          </div>
        </div>
      </template>
    </b-modal>

    <!-- Modal détails utilisateur -->
    <div class="modal fade show" v-if="showDetailsModal" style="display: block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <button type="button" class="close" @click="showDetailsModal = false">
              <span>&times;</span>
            </button>
          </div>
          <div class="scrollable-form">
            <JhiUserManagementView :user-id="selectedUserId" @close="showDetailsModal = false" />
          </div>
        </div>
      </div>
    </div>

    <!-- Modal d'ajout utilisateur -->
    <div class="modal fade show" v-if="showCreateModal" style="display: block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-body scrollable-form">
            <div class="user-edit">
              <div class="user-form-container">
                <button type="button" class="close" @click="showCreateModal = false">
                  <span>&times;</span>
                </button>
                <JhiUserManagementEdit @close="showCreateModal = false" @user-saved="handleUserSaved" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal mise à jour utilisateur -->
    <div class="modal fade show" v-if="showEditModal" style="display: block" tabindex="-1" role="dialog">
      <div class="modal-dialog modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-body scrollable-form">
            <div class="user-edit">
              <div class="user-form-container">
                <button type="button" class="close" @click="showEditModal = false">
                  <span>&times;</span>
                </button>
                <JhiUserManagementEdit :user-id="selectedUserId" @close="showEditModal = false" @user-saved="handleUserSaved" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div class="section"></div>
  <div class="section"></div>
  <div class="section"></div>
</template>

<script lang="ts">
import { defineComponent, inject, ref, type Ref, type ComputedRef, computed, onMounted, nextTick } from 'vue';
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
    const isDeleting = ref(false); // Nouvel état pour éviter les clics multiples
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

    // Méthode de recherche améliorée
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
        page.value = 1;
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
          allUsers.value = [...res.data];
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

    // Méthode de suppression corrigée
    const deleteUser = async () => {
      if (isDeleting.value) return; // Éviter les clics multiples

      isDeleting.value = true;

      try {
        const response = await userManagementService.remove(removeId.value);

        // Afficher le message de succès
        if (response?.headers?.['x-frontendapp-alert']) {
          alertService.showInfo(
            t(response.headers['x-frontendapp-alert'].toString(), {
              param: decodeURIComponent(response.headers['x-frontendapp-params']?.replace(/\+/g, ' ') || ''),
            }),
            { variant: 'danger' },
          );
        } else {
          // Message de succès par défaut
          alertService.showInfo(t('userManagement.deleted', { param: removeId.value }) || 'Utilisateur supprimé avec succès', {
            variant: 'success',
          });
        }

        // Fermer le modal immédiatement
        closeDialog();

        // Attendre que le modal soit fermé avant de recharger
        await nextTick();

        // Recharger les données
        await loadAll();

        // Réinitialiser l'ID de suppression
        removeId.value = null;
      } catch (error) {
        console.error('Erreur lors de la suppression:', error);

        // Gestion d'erreur plus robuste
        if (error?.response?.status) {
          // Erreur HTTP avec response
          alertService.showHttpError(error.response);
        } else if (error?.message) {
          // Erreur avec message
          alertService.showError(error.message);
        } else {
          // Erreur générique
          alertService.showError(t('error.server.not.reachable') || "Erreur lors de la suppression de l'utilisateur");
        }

        closeDialog(); // Fermer le modal même en cas d'erreur
      } finally {
        isDeleting.value = false;
      }
    };

    const closeDialog = () => {
      if (removeUser.value) {
        removeUser.value.hide();
      }
    };

    // Gestionnaire pour quand le modal est complètement fermé
    const onModalHidden = () => {
      removeId.value = null;
      isDeleting.value = false;
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
      isDeleting,
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
      onModalHidden,
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
</script>

<style scoped>
.user-management-container {
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
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}

.table th {
  border-top: none;
  font-weight: 600;
  text-transform: uppercase;
  font-size: 0.8rem;
  color: #6c757d;
  background-color: #f9fafb;
}

.table td {
  padding: 0.75rem 1rem;
  vertical-align: middle;
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

.icon-container.disabled {
  opacity: 0.5;
  cursor: not-allowed;
}

.view-container,
.edit-container,
.delete-container {
  color: #0c2d57;
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

.badge {
  padding: 0.35em 0.65em;
  font-size: 0.75em;
}

.modal-content {
  border-radius: 0.5rem;
  border: none;
  box-shadow:
    0 10px 15px -3px rgba(0, 0, 0, 0.1),
    0 4px 6px -2px rgba(0, 0, 0, 0.05);
}

.modal-header {
  border-bottom: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

.modal-body {
  padding: 1.5rem;
}

.modal-footer {
  border-top: 1px solid #e5e7eb;
  padding: 1rem 1.5rem;
}

.scrollable-form {
  max-height: 90vh;
  overflow-y: auto;
  padding: 1.5rem;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #012970;
  margin-bottom: 5px;
}

.modal.fade.show {
  background-color: rgba(0, 0, 0, 0.5);
}

.close {
  font-size: 1.5rem;
  font-weight: 700;
  line-height: 1;
  color: #000;
  text-shadow: 0 1px 0 #fff;
  opacity: 0.5;
  background-color: transparent;
  border: 0;
  padding: 0;
  cursor: pointer;
}

.close:hover {
  color: #000;
  opacity: 0.75;
}

.user-edit {
  padding: 0;
  background-color: transparent;
}

.user-form-container {
  padding: 0;
  max-width: 100%;
}
</style>
