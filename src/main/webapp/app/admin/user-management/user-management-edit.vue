<template>
  <div class="user-edit p-5">
    <div class="user-form-container">
      <form name="editForm" novalidate @submit.prevent="save()" v-if="userAccount">
        <div class="form-content">
          <div class="header">
            <h1 class="welcome-title" v-if="!userAccount.id" v-text="t$('userManagement.home.createUserTitle')"></h1>
            <h1 class="welcome-title" v-if="userAccount.id" v-text="t$('userManagement.home.updateUserTitle')"></h1>
          </div>
          <div class="divider mt-3"></div>
          <div class="form-fields">
            <div class="form-group">
              <label class="label-c" v-text="t$('userManagement.login')"></label>
              <div class="input-with-validation">
                <b-form-input
                  type="text"
                  name="login"
                  :state="v$.userAccount.login.$anyDirty ? !v$.userAccount.login.$invalid : null"
                  v-model="v$.userAccount.login.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.userAccount.login.$anyDirty && !v$.userAccount.login.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
              <div v-if="v$.userAccount.login.$anyDirty && v$.userAccount.login.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.login.required"
                  v-text="t$('entity.validation.required')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.login.maxLength"
                  v-text="t$('entity.validation.maxlength', { max: 50 })"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.login.pattern"
                  v-text="t$('entity.validation.patternLogin')"
                ></small>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" for="firstName" v-text="t$('userManagement.firstName')"></label>
              <div class="input-with-validation">
                <b-form-input
                  id="firstName"
                  name="firstName"
                  :placeholder="t$('settings.form[\'firstname.placeholder\']')"
                  :state="v$.userAccount.firstName.$anyDirty ? !v$.userAccount.firstName.$invalid : null"
                  v-model="v$.userAccount.firstName.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.userAccount.firstName.$anyDirty && !v$.userAccount.firstName.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
              <div v-if="v$.userAccount.firstName.$anyDirty && v$.userAccount.firstName.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.firstName.maxLength"
                  v-text="t$('entity.validation.maxlength', { max: 50 })"
                ></small>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" for="lastName" v-text="t$('userManagement.lastName')"></label>
              <div class="input-with-validation">
                <b-form-input
                  id="lastName"
                  name="lastName"
                  :placeholder="t$('settings.form[\'lastname.placeholder\']')"
                  :state="v$.userAccount.lastName.$anyDirty ? !v$.userAccount.lastName.$invalid : null"
                  v-model="v$.userAccount.lastName.$model"
                ></b-form-input>
                <span class="valid-check" v-if="v$.userAccount.lastName.$anyDirty && !v$.userAccount.lastName.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
              <div v-if="v$.userAccount.lastName.$anyDirty && v$.userAccount.lastName.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.lastName.maxLength"
                  v-text="t$('entity.validation.maxlength', { max: 50 })"
                ></small>
              </div>
            </div>

            <div class="form-group">
              <label class="label-c" for="email" v-text="t$('userManagement.email')"></label>
              <div class="input-with-validation">
                <b-form-input
                  id="email"
                  name="email"
                  :placeholder="t$('global.form[\'email.placeholder\']')"
                  :state="v$.userAccount.email.$anyDirty ? !v$.userAccount.email.$invalid : null"
                  v-model="v$.userAccount.email.$model"
                  type="email"
                ></b-form-input>
                <span class="valid-check" v-if="v$.userAccount.email.$anyDirty && !v$.userAccount.email.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
              <div v-if="v$.userAccount.email.$anyDirty && v$.userAccount.email.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.email.required"
                  v-text="t$('global.messages.validate.email.required')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.email.email"
                  v-text="t$('global.messages.validate.email.invalid')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.email.minLength"
                  v-text="t$('global.messages.validate.email.minlength')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.userAccount.email.maxLength"
                  v-text="t$('global.messages.validate.email.maxlength')"
                ></small>
              </div>
            </div>

            <div class="form-check custom-checkbox pl-4">
              <b-form-checkbox id="activated" :disabled="userAccount.id === null" name="activated" v-model="userAccount.activated">
                <span class="label-c" v-text="t$('userManagement.activated')"></span>
              </b-form-checkbox>
            </div>

            <div class="form-group" v-if="languages && Object.keys(languages).length > 0">
              <label for="langKey" class="label-c" v-text="t$('userManagement.langKey')"></label>
              <select class="form-control" id="langKey" name="langKey" v-model="userAccount.langKey">
                <option v-for="(language, key) in languages" :value="key" :key="key">{{ language.name }}</option>
              </select>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('userManagement.profiles')"></label>
              <div class="checkbox-group">
                <div v-for="authority in authorities" :key="authority" class="profile-checkbox">
                  <b-form-checkbox :id="'authority-' + authority" :value="authority" v-model="userAccount.authorities">
                    <span class="authority-label">{{ authority.replace('ROLE_', '') }}</span>
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
            <button type="submit" :disabled="v$.userAccount.$invalid || isSaving" class="login-button">
              <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
            </button>
          </div>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" src="./user-management-edit.component.ts"></script>

<style scoped>
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
.user-edit {
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #ffffff;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 0;
}

.user-form-container {
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

.input-with-validation .b-form-input {
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
  .user-form-container {
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
