<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.customisationLevel.home.createOrEditLabel"
          data-cy="CustomisationLevelCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.customisationLevel.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="customisationLevel.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="customisationLevel.id" readonly />
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.customisationLevel.level')"
              for="customisation-level-level"
            ></label>
            <input
              type="text"
              class="form-control"
              name="level"
              id="customisation-level-level"
              data-cy="level"
              :class="{ valid: !v$.level.$invalid, invalid: v$.level.$invalid }"
              v-model="v$.level.$model"
              required
            />
            <div v-if="v$.level.$anyDirty && v$.level.$invalid">
              <small class="form-text text-danger" v-for="error of v$.level.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.customisationLevel.createDate')"
              for="customisation-level-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="customisation-level-createDate"
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
                id="customisation-level-createDate"
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
              v-text="t$('sdiFrontendApp.customisationLevel.updateDate')"
              for="customisation-level-updateDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="customisation-level-updateDate"
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
                id="customisation-level-updateDate"
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
              v-text="t$('sdiFrontendApp.customisationLevel.notes')"
              for="customisation-level-notes"
            ></label>
            <textarea
              class="form-control"
              name="notes"
              id="customisation-level-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
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
<script lang="ts" src="./customisation-level-update.component.ts"></script>
