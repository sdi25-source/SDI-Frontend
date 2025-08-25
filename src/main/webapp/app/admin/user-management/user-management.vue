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
    <div class="modal-backdrop" v-if="removeUser" @click="closeDialog()"></div>
    <div class="modal-container" v-if="removeUser" role="dialog" aria-modal="true">
      <div class="modal-content">
        <div class="modal-header">
          <h5 class="modal-title text-danger">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              fill="currentColor"
              class="bi bi-exclamation-triangle mr-2"
              viewBox="0 0 16 16"
            >
              <path
                d="M7.938 2.016A.13.13 0 0 1 8.002 2a.13.13 0 0 1 .063.016.146.146 0 0 1 .054.057l6.857 11.667c.036.06.035.124.002.183a.163.163 0 0 1-.054.06.116.116 0 0 1-.066.017H1.146a.115.115 0 0 1-.066-.017.163.163 0 0 1-.054-.06.176.176 0 0 1 .002-.183L7.884 2.073a.147.147 0 0 1 .054-.057zm1.044-.45a1.13 1.13 0 0 0-1.96 0L.165 13.233c-.457.778.091 1.767.98 1.767h13.713c.889 0 1.438-.99.98-1.767L8.982 1.566z"
              />
              <path d="M7.002 12a1 1 0 1 1 2 0 1 1 0 0 1-2 0zM7.1 5.995a.905.905 0 1 1 1.8 0l-.35 3.507a.552.552 0 0 1-1.1 0L7.1 5.995z" />
            </svg>
            <span v-text="t$('entity.delete.title')"></span>
          </h5>
          <button type="button" class="close-button" @click="closeDialog()" aria-label="Fermer">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              class="icon"
            >
              <line x1="18" y1="6" x2="6" y2="18"></line>
              <line x1="6" y1="6" x2="18" y2="18"></line>
            </svg>
          </button>
        </div>

        <div class="modal-body">
          <p>
            <strong v-text="t$('userManagement.delete.question', { login: removeId })"></strong>
          </p>
          <p v-text="t$('entity.delete.irreversible')"></p>
        </div>

        <div class="modal-footer">
          <button
            type="button"
            class="btn btn-secondary rounded-2"
            @click="closeDialog()"
            v-text="t$('sdiFrontendApp.requestOfChange.delete.cancel')"
          ></button>
          <button
            type="button"
            class="btn btn-danger rounded-2"
            @click="deleteUser()"
            v-text="t$('sdiFrontendApp.requestOfChange.delete.delete')"
          ></button>
        </div>
      </div>
    </div>
  </div>
  <div class="section"></div>
  <div class="section"></div>
  <div class="section"></div>
</template>

<script lang="ts" src="./user-management.component.ts"></script>

<style scoped>
.modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  backdrop-filter: blur(2px);
  z-index: 1000;
}

.modal-container {
  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
  z-index: 1001;
  width: 90%;
  max-width: 1000px;
  max-height: 80vh;
  display: flex;
  flex-direction: column;
}

.modal-content {
  background-color: white;
  border-radius: 12px;
  box-shadow:
    0 10px 25px -5px rgba(0, 0, 0, 0.1),
    0 10px 10px -5px rgba(0, 0, 0, 0.04);
  overflow: hidden;
  display: flex;
  flex-direction: column;
  max-height: 90vh;
}

.modal-header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 1rem 1.25rem;
  border-bottom: 1px solid #f1f5f9;
  background-color: #f8fafc;
}

.modal-title {
  font-size: 1.25rem;
  font-weight: 600;
  color: #0f172a;
  margin: 0;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.875rem;
}

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.button-primary:hover {
  background-color: #26538a;
}

.button-secondary {
  background-color: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

.button-secondary:hover {
  background-color: #e2e8f0;
}

.close-button {
  background: transparent;
  border: none;
  color: #64748b;
  cursor: pointer;
  padding: 0.5rem;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition:
    background-color 0.2s,
    color 0.2s;
}

.close-button:hover {
  background-color: #f1f5f9;
  color: #0f172a;
}

.modal-body {
  padding: 1.25rem;
  overflow-y: auto;
}

.modal-footer {
  padding: 1rem 1.25rem;
  display: flex;
  justify-content: flex-end;
  gap: 0.75rem;
  border-top: 1px solid #f1f5f9;
  background-color: #f8fafc;
}
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
