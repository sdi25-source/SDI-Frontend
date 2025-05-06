<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.clientSize.home.createOrEditLabel"
          data-cy="ClientSizeCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.clientSize.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="clientSize.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="clientSize.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientSize.sizeName')" for="client-size-sizeName"></label>
            <input
              type="text"
              class="form-control"
              name="sizeName"
              id="client-size-sizeName"
              data-cy="sizeName"
              :class="{ valid: !v$.sizeName.$invalid, invalid: v$.sizeName.$invalid }"
              v-model="v$.sizeName.$model"
              required
            />
            <div v-if="v$.sizeName.$anyDirty && v$.sizeName.$invalid">
              <small class="form-text text-danger" v-for="error of v$.sizeName.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientSize.sizeCode')" for="client-size-sizeCode"></label>
            <input
              type="text"
              class="form-control"
              name="sizeCode"
              id="client-size-sizeCode"
              data-cy="sizeCode"
              :class="{ valid: !v$.sizeCode.$invalid, invalid: v$.sizeCode.$invalid }"
              v-model="v$.sizeCode.$model"
            />
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.clientSize.sizeDescription')"
              for="client-size-sizeDescription"
            ></label>
            <input
              type="text"
              class="form-control"
              name="sizeDescription"
              id="client-size-sizeDescription"
              data-cy="sizeDescription"
              :class="{ valid: !v$.sizeDescription.$invalid, invalid: v$.sizeDescription.$invalid }"
              v-model="v$.sizeDescription.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientSize.createDate')" for="client-size-createDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="client-size-createDate"
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
                id="client-size-createDate"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientSize.updateDate')" for="client-size-updateDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="client-size-updateDate"
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
                id="client-size-updateDate"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientSize.notes')" for="client-size-notes"></label>
            <textarea
              class="form-control"
              name="notes"
              id="client-size-notes"
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
<script lang="ts" src="./client-size-update.component.ts"></script>
