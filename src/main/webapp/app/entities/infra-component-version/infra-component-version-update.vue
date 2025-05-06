<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.infraComponentVersion.home.createOrEditLabel"
          data-cy="InfraComponentVersionCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.infraComponentVersion.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="infraComponentVersion.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="infraComponentVersion.id" readonly />
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.infraComponentVersion.version')"
              for="infra-component-version-version"
            ></label>
            <input
              type="text"
              class="form-control"
              name="version"
              id="infra-component-version-version"
              data-cy="version"
              :class="{ valid: !v$.version.$invalid, invalid: v$.version.$invalid }"
              v-model="v$.version.$model"
              required
            />
            <div v-if="v$.version.$anyDirty && v$.version.$invalid">
              <small class="form-text text-danger" v-for="error of v$.version.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.infraComponentVersion.description')"
              for="infra-component-version-description"
            ></label>
            <textarea
              class="form-control"
              name="description"
              id="infra-component-version-description"
              data-cy="description"
              :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
              v-model="v$.description.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.infraComponentVersion.createDate')"
              for="infra-component-version-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="infra-component-version-createDate"
                  v-model="v$.createDate.$model"
                  name="createDate"
                  class="form-control"
                  :locale="currentLanguage"
                  button-only
                  today-button
                  reset-button
                  close-button
                >
                </b-form-datepicker>
              </b-input-group-prepend>
              <b-form-input
                id="infra-component-version-createDate"
                data-cy="createDate"
                type="text"
                class="form-control"
                name="createDate"
                :class="{ valid: !v$.createDate.$invalid, invalid: v$.createDate.$invalid }"
                v-model="v$.createDate.$model"
              />
            </b-input-group>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.infraComponentVersion.updateDate')"
              for="infra-component-version-updateDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="infra-component-version-updateDate"
                  v-model="v$.updateDate.$model"
                  name="updateDate"
                  class="form-control"
                  :locale="currentLanguage"
                  button-only
                  today-button
                  reset-button
                  close-button
                >
                </b-form-datepicker>
              </b-input-group-prepend>
              <b-form-input
                id="infra-component-version-updateDate"
                data-cy="updateDate"
                type="text"
                class="form-control"
                name="updateDate"
                :class="{ valid: !v$.updateDate.$invalid, invalid: v$.updateDate.$invalid }"
                v-model="v$.updateDate.$model"
              />
            </b-input-group>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.infraComponentVersion.infraComponent')"
              for="infra-component-version-infraComponent"
            ></label>
            <select
              class="form-control"
              id="infra-component-version-infraComponent"
              data-cy="infraComponent"
              name="infraComponent"
              v-model="infraComponentVersion.infraComponent"
            >
              <option :value="null"></option>
              <option
                :value="
                  infraComponentVersion.infraComponent && infraComponentOption.id === infraComponentVersion.infraComponent.id
                    ? infraComponentVersion.infraComponent
                    : infraComponentOption
                "
                v-for="infraComponentOption in infraComponents"
                :key="infraComponentOption.id"
              >
                {{ infraComponentOption.name }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" @click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="v$.$invalid || isSaving"
            class="btn btn-primary"
          >
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>
<script lang="ts" src="./infra-component-version-update.component.ts"></script>
