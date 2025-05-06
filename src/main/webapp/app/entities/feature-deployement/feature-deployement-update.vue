<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.featureDeployement.home.createOrEditLabel"
          data-cy="FeatureDeployementCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.featureDeployement.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="featureDeployement.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="featureDeployement.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.featureDeployement.code')" for="feature-deployement-code"></label>
            <input
              type="text"
              class="form-control"
              name="code"
              id="feature-deployement-code"
              data-cy="code"
              :class="{ valid: !v$.code.$invalid, invalid: v$.code.$invalid }"
              v-model="v$.code.$model"
              required
            />
            <div v-if="v$.code.$anyDirty && v$.code.$invalid">
              <small class="form-text text-danger" v-for="error of v$.code.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.featureDeployement.createDate')"
              for="feature-deployement-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="feature-deployement-createDate"
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
                id="feature-deployement-createDate"
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
              v-text="t$('sdiFrontendApp.featureDeployement.updateDate')"
              for="feature-deployement-updateDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="feature-deployement-updateDate"
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
                id="feature-deployement-updateDate"
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
              v-text="t$('sdiFrontendApp.featureDeployement.notes')"
              for="feature-deployement-notes"
            ></label>
            <textarea
              class="form-control"
              name="notes"
              id="feature-deployement-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.featureDeployement.feature')"
              for="feature-deployement-feature"
            ></label>
            <select
              class="form-control"
              id="feature-deployement-feature"
              data-cy="feature"
              name="feature"
              v-model="featureDeployement.feature"
            >
              <option :value="null"></option>
              <option
                :value="
                  featureDeployement.feature && featureOption.id === featureDeployement.feature.id
                    ? featureDeployement.feature
                    : featureOption
                "
                v-for="featureOption in features"
                :key="featureOption.id"
              >
                {{ featureOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.featureDeployement.moduleDeployement')"
              for="feature-deployement-moduleDeployement"
            ></label>
            <select
              class="form-control"
              id="feature-deployement-moduleDeployement"
              data-cy="moduleDeployement"
              name="moduleDeployement"
              v-model="featureDeployement.moduleDeployement"
            >
              <option :value="null"></option>
              <option
                :value="
                  featureDeployement.moduleDeployement && moduleDeployementOption.id === featureDeployement.moduleDeployement.id
                    ? featureDeployement.moduleDeployement
                    : moduleDeployementOption
                "
                v-for="moduleDeployementOption in moduleDeployements"
                :key="moduleDeployementOption.id"
              >
                {{ moduleDeployementOption.code }}
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
<script lang="ts" src="./feature-deployement-update.component.ts"></script>
