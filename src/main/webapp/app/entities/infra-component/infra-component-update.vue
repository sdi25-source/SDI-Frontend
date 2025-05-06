<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.infraComponent.home.createOrEditLabel"
          data-cy="InfraComponentCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.infraComponent.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="infraComponent.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="infraComponent.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.infraComponent.name')" for="infra-component-name"></label>
            <input
              type="text"
              class="form-control"
              name="name"
              id="infra-component-name"
              data-cy="name"
              :class="{ valid: !v$.name.$invalid, invalid: v$.name.$invalid }"
              v-model="v$.name.$model"
              required
            />
            <div v-if="v$.name.$anyDirty && v$.name.$invalid">
              <small class="form-text text-danger" v-for="error of v$.name.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.infraComponent.vendor')" for="infra-component-vendor"></label>
            <input
              type="text"
              class="form-control"
              name="vendor"
              id="infra-component-vendor"
              data-cy="vendor"
              :class="{ valid: !v$.vendor.$invalid, invalid: v$.vendor.$invalid }"
              v-model="v$.vendor.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.infraComponent.notes')" for="infra-component-notes"></label>
            <textarea
              class="form-control"
              name="notes"
              id="infra-component-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.infraComponent.createDate')"
              for="infra-component-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="infra-component-createDate"
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
                id="infra-component-createDate"
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
              v-text="t$('sdiFrontendApp.infraComponent.componentType')"
              for="infra-component-componentType"
            ></label>
            <select
              class="form-control"
              id="infra-component-componentType"
              data-cy="componentType"
              name="componentType"
              v-model="infraComponent.componentType"
            >
              <option :value="null"></option>
              <option
                :value="
                  infraComponent.componentType && componentTypeOption.id === infraComponent.componentType.id
                    ? infraComponent.componentType
                    : componentTypeOption
                "
                v-for="componentTypeOption in componentTypes"
                :key="componentTypeOption.id"
              >
                {{ componentTypeOption.type }}
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
<script lang="ts" src="./infra-component-update.component.ts"></script>
