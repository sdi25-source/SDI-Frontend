<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.country.home.createOrEditLabel"
          data-cy="CountryCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.country.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="country.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="country.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.country.countryname')" for="country-countryname"></label>
            <input
              type="text"
              class="form-control"
              name="countryname"
              id="country-countryname"
              data-cy="countryname"
              :class="{ valid: !v$.countryname.$invalid, invalid: v$.countryname.$invalid }"
              v-model="v$.countryname.$model"
              required
            />
            <div v-if="v$.countryname.$anyDirty && v$.countryname.$invalid">
              <small class="form-text text-danger" v-for="error of v$.countryname.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.country.countryCode')" for="country-countryCode"></label>
            <input
              type="text"
              class="form-control"
              name="countryCode"
              id="country-countryCode"
              data-cy="countryCode"
              :class="{ valid: !v$.countryCode.$invalid, invalid: v$.countryCode.$invalid }"
              v-model="v$.countryCode.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.country.countryFlag')" for="country-countryFlag"></label>
            <input
              type="text"
              class="form-control"
              name="countryFlag"
              id="country-countryFlag"
              data-cy="countryFlag"
              :class="{ valid: !v$.countryFlag.$invalid, invalid: v$.countryFlag.$invalid }"
              v-model="v$.countryFlag.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.country.notes')" for="country-notes"></label>
            <textarea
              class="form-control"
              name="notes"
              id="country-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.country.createDate')" for="country-createDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="country-createDate"
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
                id="country-createDate"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.country.updateDate')" for="country-updateDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="country-updateDate"
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
                id="country-updateDate"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.country.region')" for="country-region"></label>
            <select class="form-control" id="country-region" data-cy="region" name="region" v-model="country.region">
              <option :value="null"></option>
              <option
                :value="country.region && regionOption.id === country.region.id ? country.region : regionOption"
                v-for="regionOption in regions"
                :key="regionOption.id"
              >
                {{ regionOption.name }}
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
<script lang="ts" src="./country-update.component.ts"></script>
