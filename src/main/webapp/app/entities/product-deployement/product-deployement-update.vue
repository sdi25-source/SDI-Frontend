<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.productDeployement.home.createOrEditLabel"
          data-cy="ProductDeployementCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.productDeployement.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="productDeployement.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="productDeployement.id" readonly />
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployement.refContract')"
              for="product-deployement-refContract"
            ></label>
            <input
              type="text"
              class="form-control"
              name="refContract"
              id="product-deployement-refContract"
              data-cy="refContract"
              :class="{ valid: !v$.refContract.$invalid, invalid: v$.refContract.$invalid }"
              v-model="v$.refContract.$model"
              required
            />
            <div v-if="v$.refContract.$anyDirty && v$.refContract.$invalid">
              <small class="form-text text-danger" v-for="error of v$.refContract.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployement.createDate')"
              for="product-deployement-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="product-deployement-createDate"
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
                id="product-deployement-createDate"
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
              v-text="t$('sdiFrontendApp.productDeployement.updateDate')"
              for="product-deployement-updateDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="product-deployement-updateDate"
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
                id="product-deployement-updateDate"
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
              v-text="t$('sdiFrontendApp.productDeployement.notes')"
              for="product-deployement-notes"
            ></label>
            <textarea
              class="form-control"
              name="notes"
              id="product-deployement-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.productDeployement.client')"
              for="product-deployement-client"
            ></label>
            <select class="form-control" id="product-deployement-client" data-cy="client" name="client" v-model="productDeployement.client">
              <option :value="null"></option>
              <option
                :value="
                  productDeployement.client && clientOption.id === productDeployement.client.id ? productDeployement.client : clientOption
                "
                v-for="clientOption in clients"
                :key="clientOption.id"
              >
                {{ clientOption.code }}
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
<script lang="ts" src="./product-deployement-update.component.ts"></script>
