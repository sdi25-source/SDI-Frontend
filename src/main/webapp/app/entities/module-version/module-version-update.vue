<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.moduleVersion.home.createOrEditLabel"
          data-cy="ModuleVersionCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.moduleVersion.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="moduleVersion.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="moduleVersion.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.moduleVersion.version')" for="module-version-version"></label>
            <input
              type="text"
              class="form-control"
              name="version"
              id="module-version-version"
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
              v-text="t$('sdiFrontendApp.moduleVersion.createDate')"
              for="module-version-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="module-version-createDate"
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
                id="module-version-createDate"
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
              v-text="t$('sdiFrontendApp.moduleVersion.updateDate')"
              for="module-version-updateDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="module-version-updateDate"
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
                id="module-version-updateDate"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.moduleVersion.notes')" for="module-version-notes"></label>
            <textarea
              class="form-control"
              name="notes"
              id="module-version-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.moduleVersion.module')" for="module-version-module"></label>
            <select class="form-control" id="module-version-module" data-cy="module" name="module" v-model="moduleVersion.module">
              <option :value="null"></option>
              <option
                :value="moduleVersion.module && moduleOption.id === moduleVersion.module.id ? moduleVersion.module : moduleOption"
                v-for="moduleOption in modules"
                :key="moduleOption.id"
              >
                {{ moduleOption.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label v-text="t$('sdiFrontendApp.moduleVersion.feature')" for="module-version-feature"></label>
            <select
              class="form-control"
              id="module-version-features"
              data-cy="feature"
              multiple
              name="feature"
              v-if="moduleVersion.features !== undefined"
              v-model="moduleVersion.features"
            >
              <option
                :value="getSelected(moduleVersion.features, featureOption, 'id')"
                v-for="featureOption in features"
                :key="featureOption.id"
              >
                {{ featureOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.moduleVersion.domaine')" for="module-version-domaine"></label>
            <select class="form-control" id="module-version-domaine" data-cy="domaine" name="domaine" v-model="moduleVersion.domaine">
              <option :value="null"></option>
              <option
                :value="moduleVersion.domaine && domaineOption.id === moduleVersion.domaine.id ? moduleVersion.domaine : domaineOption"
                v-for="domaineOption in domaines"
                :key="domaineOption.id"
              >
                {{ domaineOption.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.moduleVersion.root')" for="module-version-root"></label>
            <select class="form-control" id="module-version-root" data-cy="root" name="root" v-model="moduleVersion.root">
              <option :value="null"></option>
              <option
                :value="moduleVersion.root && moduleVersionOption.id === moduleVersion.root.id ? moduleVersion.root : moduleVersionOption"
                v-for="moduleVersionOption in moduleVersions"
                :key="moduleVersionOption.id"
              >
                {{ moduleVersionOption.id }}
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
<script lang="ts" src="./module-version-update.component.ts"></script>
