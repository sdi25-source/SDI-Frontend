<template>
  <div class="client-edit">
    <div class="client-form-container border-5">
      <form name="editForm" novalidate @submit.prevent="save()">
        <div class="form-content">
          <div class="header">
            <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="back-button" @click="previousState()">
              <font-awesome-icon icon="arrow-left" />
            </button>
            <h1 class="welcome-title" v-if="!client.id">New Client</h1>
            <h1 class="welcome-title" v-if="client.id">Update Client</h1>
          </div>
          <div class="divider mt-2"></div>
          <div class="form-fields">
            <div class="logo-upload-container">
              <label class="label-c mb-2" v-text="t$('sdiFrontendApp.client.clientLogo')" for="client-clientLogo"></label>
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
              <div v-if="v$.clientLogo.$anyDirty && v$.clientLogo.$invalid">
                <small class="form-text text-danger" v-for="error of v$.clientLogo.$errors" :key="error.$uid">
                  {{ error.$message }}
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
              <label class="label-c" v-text="t$('sdiFrontendApp.client.country')"></label>
              <select class="form-control" id="country-select" v-model="client.country">
                <option value="" disabled selected></option>
                <option v-for="country in countries" :key="country.id" :value="country">
                  {{ country.countryFlag }} {{ country.countryname }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.size')"></label>
              <select v-model="client.size" class="form-control" id="size-select">
                <option value="" disabled selected v-text="t$('sdiFrontendApp.client.selectSize')"></option>
                <option v-for="size in clientSizes" :key="size.id" :value="size">
                  {{ size.sizeName }}
                </option>
              </select>
            </div>

            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.clientType')"></label>
              <select v-model="client.clientType" class="form-control" id="client-type-select">
                <option value="" disabled selected v-text="t$('sdiFrontendApp.client.selectType')"></option>
                <option v-for="clientType in clientTypes" :key="clientType.id" :value="clientType">
                  {{ clientType.type }}
                </option>
              </select>
            </div>

            <!-- RICH TEXT EDITOR FOR NOTES - SECTION MODIFIÉE -->
            <div class="form-group">
              <label class="label-c" v-text="t$('sdiFrontendApp.client.notes')" for="client-notes"></label>
              <div class="input-with-validation">
                <div class="rich-text-editor">
                  <!-- Toolbar -->
                  <div class="editor-toolbar">
                    <select class="toolbar-select" v-model="selectedHeading" @change="applyHeading">
                      <option value="">Heading</option>
                      <option value="h1">Heading 1</option>
                      <option value="h2">Heading 2</option>
                      <option value="h3">Heading 3</option>
                    </select>

                    <select class="toolbar-select" v-model="selectedFont" @change="applyFont">
                      <option value="">Sans Serif</option>
                      <option value="Arial">Arial</option>
                      <option value="Times New Roman">Times New Roman</option>
                      <option value="Courier New">Courier New</option>
                    </select>

                    <div class="toolbar-divider"></div>

                    <button type="button" class="toolbar-btn" @click="toggleBold" :class="{ active: isBold }">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 4h8a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                        <path d="M6 12h9a4 4 0 0 1 4 4 4 4 0 0 1-4 4H6z" />
                      </svg>
                    </button>
                    <button type="button" class="toolbar-btn" @click="toggleItalic" :class="{ active: isItalic }">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="19" y1="4" x2="10" y2="4" />
                        <line x1="14" y1="20" x2="5" y2="20" />
                        <line x1="15" y1="4" x2="9" y2="20" />
                      </svg>
                    </button>
                    <button type="button" class="toolbar-btn" @click="toggleUnderline" :class="{ active: isUnderline }">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <path d="M6 3v7a6 6 0 0 0 6 6 6 6 0 0 0 6-6V3" />
                        <line x1="4" y1="21" x2="20" y2="21" />
                      </svg>
                    </button>

                    <div class="toolbar-divider"></div>

                    <button type="button" class="toolbar-btn" @click="toggleBulletList">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="8" y1="6" x2="21" y2="6" />
                        <line x1="8" y1="12" x2="21" y2="12" />
                        <line x1="8" y1="18" x2="21" y2="18" />
                        <line x1="3" y1="6" x2="3.01" y2="6" />
                        <line x1="3" y1="12" x2="3.01" y2="12" />
                        <line x1="3" y1="18" x2="3.01" y2="18" />
                      </svg>
                    </button>
                    <button type="button" class="toolbar-btn" @click="toggleNumberedList">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <line x1="10" y1="6" x2="21" y2="6" />
                        <line x1="10" y1="12" x2="21" y2="12" />
                        <line x1="10" y1="18" x2="21" y2="18" />
                        <path d="M4 6h1v4" />
                        <path d="M4 10h2" />
                        <path d="M6 18H4c0-1 2-2 2-3s-1-1.5-2-1" />
                      </svg>
                    </button>

                    <div class="toolbar-divider"></div>
                    <button type="button" class="toolbar-btn" @click="insertCode">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                        <polyline points="16,18 22,12 16,6" />
                        <polyline points="8,6 2,12 8,18" />
                      </svg>
                    </button>
                  </div>

                  <!-- Editor Content -->
                  <div
                    ref="editorContent"
                    class="editor-content"
                    contenteditable="true"
                    :lang="'en'"
                    style="direction: ltr; text-align: left;"
                    @input="updateNotes"
                    @keyup="updateToolbarState"
                    @mouseup="updateToolbarState"
                    v-html="v$.notes.$model"
                    data-cy="notes"
                  ></div>
                </div>
                <span class="valid-check" v-if="v$.notes.$anyDirty && !v$.notes.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
            </div>
          </div>
          <div class="divider mt-3 mb-3"></div>
          <div class="action-buttons">
            <button
              type="button"
              id="cancel-save"
              data-cy="entityCreateCancelButton"
              class="button button-secondary pl-2 pr-2"
              @click="previousState()"
            >
              <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
            </button>
            <button
              type="submit"
              id="save-entity"
              data-cy="entityCreateSaveButton"
              :disabled="v$.$invalid || isSaving"
              class="login-button button button-primary"
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

.button-secondary {
  background-color: #6c757d;
  color: #fff;
}

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
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
  padding: 40px 20px;
}

.client-form-container {
  width: 100%;
  max-width: 750px;
  padding: 24px 0;
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
  position: relative; /* Ajouté pour positionner le bouton de retour */
}

.back-button {
  position: absolute;
  left: 0;
  top: 0;
  padding: 8px;
  background-color: #f8f9fa;
  color: #6c757d;
  font-weight: 500;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  cursor: pointer;
  transition: all 0.2s;
}

.back-button:hover {
  background-color: #e9ecef;
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
  z-index: 10;
}

.text-success {
  color: #28a745 !important;
}

/* Form control elements styling */
.form-control,
.b-form-select,
.date-picker,
.b-form-textarea,
.b-form-input {
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
.b-form-select:focus,
.date-picker:focus,
.b-form-textarea:focus,
.b-form-input:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 1px #94a3b8;
}

/* Rich Text Editor Styles */
.rich-text-editor {
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  overflow: hidden;
  width: 100%;
}

.editor-toolbar {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 8px 12px;
  background-color: #f8f9fa;
  border-bottom: 1px solid #e2e8f0;
  flex-wrap: wrap;
}

.toolbar-select {
  padding: 4px 8px;
  border: 1px solid #d1d5db;
  border-radius: 4px;
  background-color: white;
  font-size: 0.875rem;
  min-width: 100px;
}

.toolbar-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: 1px solid transparent;
  border-radius: 4px;
  background-color: transparent;
  cursor: pointer;
  transition: all 0.2s;
  color: #6b7280;
}

.toolbar-btn:hover {
  background-color: #e5e7eb;
  border-color: #d1d5db;
}

.toolbar-btn.active {
  background-color: #3b82f6;
  color: white;
  border-color: #3b82f6;
}

.toolbar-divider {
  width: 1px;
  height: 24px;
  background-color: #d1d5db;
  margin: 0 4px;
}

.editor-content {
  min-height: 120px;
  padding: 12px;
  outline: none;
  line-height: 1.5;
  font-size: 0.875rem;
  width: 100%;
}

.editor-content:empty::before {
  content: 'Enter your notes here...';
  color: #9ca3af;
  pointer-events: none;
}

.editor-content:focus {
  background-color: #fafafa;
}

/* Date picker styling */
.b-input-group {
  display: flex;
  width: 100%;
}

.date-picker {
  border-top-right-radius: 0;
  border-bottom-right-radius: 0;
  border-right: none;
}

/* Validation */
.form-text.text-danger {
  color: #dc3545 !important;
  font-size: 0.75rem;
  margin-top: 4px;
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
    padding: 15px;
  }

  .action-buttons {
    flex-direction: column;
  }

  .login-button,
  .cancel-button {
    width: 100%;
  }

  .back-button {
    left: 10px;
  }

  .editor-toolbar {
    gap: 2px;
    padding: 6px 8px;
  }

  .toolbar-btn {
    width: 28px;
    height: 28px;
  }
}
</style>
