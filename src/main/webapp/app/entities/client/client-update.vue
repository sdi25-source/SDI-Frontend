<template>
  <div class="user-edit p-5">
    <div class="user-form-container">
      <form name="editForm" novalidate @submit.prevent="save()">
        <div class="form-content">
          <div class="header">
            <h1 class="welcome-title" v-if="!client.id">New Client</h1>
            <h1 class="welcome-title" v-if="client.id">Update Client</h1>
          </div>
          <div class="divider mt-3"></div>
          <div class="form-fields">
            <div class="logo-upload-container">
              <div class="input-with-validation">
                <input
                  type="file"
                  id="client-clientLogo"
                  name="clientLogo"
                  data-cy="clientLogo"
                  accept="image/*"
                  class="form-control"
                  @change="onLogoChange"
                />
                <span class="valid-check" v-if="v$.clientLogo.$anyDirty && !v$.clientLogo.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>

              <!-- Prévisualisation du logo -->
              <div v-if="logoPreview" class="logo-preview mt-2">
                <img :src="logoPreview" alt="Logo preview" class="preview-image" />
                <button type="button" class="remove-logo-btn" @click="removeLogo">
                  <font-awesome-icon icon="times" />
                </button>
              </div>

              <!-- Informations sur la compression -->
              <div v-if="compressionInfo" class="compression-info mt-2">
                <small class="text-muted">
                  {{ compressionInfo }}
                </small>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.name')" for="client-name"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="text"
                  name="name"
                  id="client-name"
                  data-cy="name"
                  :state="v$.name.$anyDirty ? !v$.name.$invalid : null"
                  v-model="v$.name.$model"
                  required
                ></b-form-input>
                <span class="valid-check" v-if="v$.name.$anyDirty && !v$.name.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
              <div v-if="v$.name.$anyDirty && v$.name.$invalid">
                <small class="form-text text-danger" v-for="error of v$.name.$errors" :key="error.$uid">{{ error.$message }}</small>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.code')" for="client-code"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="text"
                  name="code"
                  id="client-code"
                  data-cy="code"
                  :state="v$.code.$anyDirty ? !v$.code.$invalid : null"
                  v-model="v$.code.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.code.$anyDirty && !v$.code.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.mainContactName')" for="client-mainContactName"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="text"
                  name="mainContactName"
                  id="client-mainContactName"
                  data-cy="mainContactName"
                  :state="v$.mainContactName.$anyDirty ? !v$.mainContactName.$invalid : null"
                  v-model="v$.mainContactName.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.mainContactName.$anyDirty && !v$.mainContactName.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.mainContactEmail')" for="client-mainContactEmail"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="email"
                  name="mainContactEmail"
                  id="client-mainContactEmail"
                  data-cy="mainContactEmail"
                  :state="v$.mainContactEmail.$anyDirty ? !v$.mainContactEmail.$invalid : null"
                  v-model="v$.mainContactEmail.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.mainContactEmail.$anyDirty && !v$.mainContactEmail.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
              <div v-if="v$.mainContactEmail.$anyDirty && v$.mainContactEmail.$invalid">
                <small class="form-text text-danger" v-for="error of v$.mainContactEmail.$errors" :key="error.$uid">
                  {{ error.$message }}
                </small>
              </div>
            </div>

            <div class="form-group">
              <label
                class="label-c"
                v-text="t$('sdiFrontendApp.client.currentCardHolderNumber')"
                for="client-currentCardHolderNumber"
              ></label>
              <div class="input-with-validation">
                <b-form-input
                  type="number"
                  name="currentCardHolderNumber"
                  id="client-currentCardHolderNumber"
                  data-cy="currentCardHolderNumber"
                  :state="v$.currentCardHolderNumber.$anyDirty ? !v$.currentCardHolderNumber.$invalid : null"
                  v-model.number="v$.currentCardHolderNumber.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.currentCardHolderNumber.$anyDirty && !v$.currentCardHolderNumber.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.currentBruncheNumber')" for="client-currentBruncheNumber"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="number"
                  name="currentBruncheNumber"
                  id="client-currentBruncheNumber"
                  data-cy="currentBruncheNumber"
                  :state="v$.currentBruncheNumber.$anyDirty ? !v$.currentBruncheNumber.$invalid : null"
                  v-model.number="v$.currentBruncheNumber.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.currentBruncheNumber.$anyDirty && !v$.currentBruncheNumber.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label
                class="label-c"
                v-text="t$('sdiFrontendApp.client.currentCustomersNumber')"
                for="client-currentCustomersNumber"
              ></label>
              <div class="input-with-validation">
                <b-form-input
                  type="number"
                  name="currentCustomersNumber"
                  id="client-currentCustomersNumber"
                  data-cy="currentCustomersNumber"
                  :state="v$.currentCustomersNumber.$anyDirty ? !v$.currentCustomersNumber.$invalid : null"
                  v-model.number="v$.currentCustomersNumber.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.currentCustomersNumber.$anyDirty && !v$.currentCustomersNumber.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label
                class="label-c"
                v-text="t$('sdiFrontendApp.client.mainContactPhoneNumber')"
                for="client-mainContactPhoneNumber"
              ></label>
              <div class="input-with-validation">
                <b-form-input
                  type="text"
                  name="mainContactPhoneNumber"
                  id="client-mainContactPhoneNumber"
                  data-cy="mainContactPhoneNumber"
                  :state="v$.mainContactPhoneNumber.$anyDirty ? !v$.mainContactPhoneNumber.$invalid : null"
                  v-model="v$.mainContactPhoneNumber.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.mainContactPhoneNumber.$anyDirty && !v$.mainContactPhoneNumber.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.website')" for="client-url"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="url"
                  name="url"
                  id="client-url"
                  data-cy="url"
                  :state="v$.url.$anyDirty ? !v$.url.$invalid : null"
                  v-model="v$.url.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.url.$anyDirty && !v$.url.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.address')" for="client-address"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="text"
                  name="address"
                  id="client-address"
                  data-cy="address"
                  :state="v$.address.$anyDirty ? !v$.address.$invalid : null"
                  v-model="v$.address.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.address.$anyDirty && !v$.address.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.createDate')" for="client-createDate"></label>
              <div class="input-with-validation">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-form-datepicker
                      aria-controls="client-createDate"
                      v-model="v$.createDate.$model"
                      name="createDate"
                      class="date-picker"
                      :locale="currentLanguage"
                      button-only
                      today-button
                      reset-button
                      close-button
                    >
                    </b-form-datepicker>
                  </b-input-group-prepend>
                  <b-form-input
                    id="client-createDate"
                    data-cy="createDate"
                    type="text"
                    name="createDate"
                    :state="v$.createDate.$anyDirty ? !v$.createDate.$invalid : null"
                    v-model="v$.createDate.$model"
                  />
                </b-input-group>
                <span class="valid-check" v-if="v$.createDate.$anyDirty && !v$.createDate.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.updateDate')" for="client-updateDate"></label>
              <div class="input-with-validation">
                <b-input-group>
                  <b-input-group-prepend>
                    <b-form-datepicker
                      aria-controls="client-updateDate"
                      v-model="v$.updateDate.$model"
                      name="updateDate"
                      class="date-picker"
                      :locale="currentLanguage"
                      button-only
                      today-button
                      reset-button
                      close-button
                    >
                    </b-form-datepicker>
                  </b-input-group-prepend>
                  <b-form-input
                    id="client-updateDate"
                    data-cy="updateDate"
                    type="text"
                    name="updateDate"
                    :state="v$.updateDate.$anyDirty ? !v$.updateDate.$invalid : null"
                    v-model="v$.updateDate.$model"
                  />
                </b-input-group>
                <span class="valid-check" v-if="v$.updateDate.$anyDirty && !v$.updateDate.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.notes')" for="client-notes"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="text"
                  name="notes"
                  id="client-notes"
                  data-cy="notes"
                  :state="v$.notes.$anyDirty ? !v$.notes.$invalid : null"
                  v-model="v$.notes.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.notes.$anyDirty && !v$.notes.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.country')"></label>
              <div class="checkbox-group">
                <div v-for="country in countries" :key="country.id" class="profile-checkbox">
                  <b-form-checkbox
                    :id="'country-' + country.id"
                    :value="client.country && country.id === client.country.id ? client.country : country"
                    v-model="client.country"
                  >
                    <span class="authority-label">{{ country.countryname }}</span>
                  </b-form-checkbox>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.size')"></label>
              <div class="checkbox-group">
                <div v-for="size in clientSizes" :key="size.id" class="profile-checkbox">
                  <b-form-checkbox
                    :id="'size-' + size.id"
                    :value="client.size && size.id === client.size.id ? client.size : size"
                    v-model="client.size"
                  >
                    <span class="authority-label">{{ size.sizeName }}</span>
                  </b-form-checkbox>
                </div>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.clientType')"></label>
              <div class="checkbox-group">
                <div v-for="clientType in clientTypes" :key="clientType.id" class="profile-checkbox">
                  <b-form-checkbox
                    :id="'size-' + clientType.id"
                    :value="client.clientType && clientType.id === client.clientType.id ? client.clientType : clientType"
                    v-model="client.clientType"
                  >
                    <span class="authority-label">{{ clientType.type }}</span>
                  </b-form-checkbox>
                </div>
              </div>
            </div>
          </div>
          <div class="divider mt-3 mb-3"></div>
          <div class="action-buttons">
            <button type="button" class="cancel-button" @click="cancel">
              <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
            </button>
            <button
              type="submit"
              id="save-entity"
              data-cy="entityCreateSaveButton"
              :disabled="v$.$invalid || isSaving"
              class="login-button"
            >
              <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" src="./client-update.component.ts"></script>

<style scoped>
.user-form-container {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

.label-c {
  color: #012970ff;
  font-weight: 500;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Layout principal */
.client-edit {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 0;
}

.client-form-container {
  width: 100%;
  max-width: 100%;
  padding: 0;
}

/* Form content */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header section */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  text-align: center;
}

.welcome-title {
  font-size: 1.5rem;
  font-weight: 700;
  color: #012970;
  margin-bottom: 5px;
}

.header p {
  color: #6c757d;
  font-size: 0.95rem;
}

/* Form fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
}

/* Divider */
.divider {
  position: relative;
  height: 1px;
  background-color: #e2e8f0;
  margin: 15px 0;
}

/* Input with validation styling */
.input-with-validation {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-validation .b-form-input,
.input-with-validation input[type='file'] {
  width: 100%;
}

.valid-check {
  position: absolute;
  right: 10px;
  color: #28a745;
  font-size: 0.875rem;
}

.text-success {
  color: #28a745 !important;
}

/* Logo preview styling */
.logo-upload-container {
  width: 100%;
}

.logo-preview {
  position: relative;
  display: inline-block;
  margin-top: 10px;
}

.preview-image {
  max-width: 150px;
  max-height: 150px;
  border: 1px solid #e2e8f0;
  border-radius: 4px;
  padding: 5px;
}

.remove-logo-btn {
  position: absolute;
  top: -10px;
  right: -10px;
  background-color: #dc3545;
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
}

/* Compression info styling */
.compression-info {
  font-size: 0.75rem;
  color: #6c757d;
}

/* Custom BS Form elements styling */
.form-control,
.custom-select {
  padding: 10px 12px;
  height: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 100%;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
}

.form-control:focus,
.custom-select:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 1px #94a3b8;
}

/* Checkbox group styling */
.checkbox-group {
  display: flex;
  flex-direction: column;
  gap: 10px;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  padding: 10px;
  max-height: 200px;
  overflow-y: auto;
  background-color: #f8f9fa;
}

.profile-checkbox {
  display: flex;
  align-items: center;
  margin-bottom: 1px;
  margin-left: 39px;
}

.authority-label {
  font-size: 14px;
  color: #333;
  margin-left: 5px;
}

/* Validation */
.form-text.text-danger {
  color: #dc3545 !important;
  font-size: 0.75rem;
  margin-top: 4px;
}

.form-text.text-muted {
  color: #6c757d;
  font-size: 0.75rem;
  margin-top: 4px;
}

/* Checkbox styling */
.custom-checkbox {
  margin: 10px 0;
}

.custom-checkbox label {
  display: flex;
  align-items: center;
  cursor: pointer;
}

/* Button styling */
.action-buttons {
  display: flex;
  justify-content: space-between;
  margin-top: 10px;
  gap: 15px;
}

.login-button {
  flex: 1;
  padding: 10px 16px;
  background-color: #0d83fd;
  color: #ffffff;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #4154f1;
}

.cancel-button {
  padding: 10px 16px;
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.cancel-button:hover {
  background-color: #e9ecef;
}

/* Make elements the same height */
.b-form-input,
.b-form-select,
button {
  min-height: 42px;
}

/* For responsive design */
@media (max-width: 768px) {
  .client-form-container {
    padding: 0;
  }

  .action-buttons {
    flex-direction: column;
  }

  .login-button,
  .cancel-button {
    width: 100%;
  }
}
</style>
