<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.productVersion.home.createOrEditLabel"
          data-cy="ProductVersionCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.productVersion.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="productVersion.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="productVersion.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.productVersion.version')" for="product-version-version"></label>
            <input
              type="text"
              class="form-control"
              name="version"
              id="product-version-version"
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
              v-text="t$('sdiFrontendApp.productVersion.createDate')"
              for="product-version-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="product-version-createDate"
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
                id="product-version-createDate"
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
              v-text="t$('sdiFrontendApp.productVersion.updateDate')"
              for="product-version-updateDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="product-version-updateDate"
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
                id="product-version-updateDate"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.productVersion.notes')" for="product-version-notes"></label>
            <textarea
              class="form-control"
              name="notes"
              id="product-version-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.productVersion.product')" for="product-version-product"></label>
            <select class="form-control" id="product-version-product" data-cy="product" name="product" v-model="productVersion.product">
              <option :value="null"></option>
              <option
                :value="productVersion.product && productOption.id === productVersion.product.id ? productVersion.product : productOption"
                v-for="productOption in products"
                :key="productOption.id"
              >
                {{ productOption.name }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label v-text="t$('sdiFrontendApp.productVersion.moduleVersion')" for="product-version-moduleVersion"></label>
            <select
              class="form-control"
              id="product-version-moduleVersions"
              data-cy="moduleVersion"
              multiple
              name="moduleVersion"
              v-if="productVersion.moduleVersions !== undefined"
              v-model="productVersion.moduleVersions"
            >
              <option
                :value="getSelected(productVersion.moduleVersions, moduleVersionOption, 'id')"
                v-for="moduleVersionOption in moduleVersions"
                :key="moduleVersionOption.id"
              >
                {{ moduleVersionOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label v-text="t$('sdiFrontendApp.productVersion.infraComponentVersion')" for="product-version-infraComponentVersion"></label>
            <select
              class="form-control"
              id="product-version-infraComponentVersions"
              data-cy="infraComponentVersion"
              multiple
              name="infraComponentVersion"
              v-if="productVersion.infraComponentVersions !== undefined"
              v-model="productVersion.infraComponentVersions"
            >
              <option
                :value="getSelected(productVersion.infraComponentVersions, infraComponentVersionOption, 'id')"
                v-for="infraComponentVersionOption in infraComponentVersions"
                :key="infraComponentVersionOption.id"
              >
                {{ infraComponentVersionOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.productVersion.root')" for="product-version-root"></label>
            <select class="form-control" id="product-version-root" data-cy="root" name="root" v-model="productVersion.root">
              <option :value="null"></option>
              <option
                :value="
                  productVersion.root && productVersionOption.id === productVersion.root.id ? productVersion.root : productVersionOption
                "
                v-for="productVersionOption in productVersions"
                :key="productVersionOption.id"
              >
                {{ productVersionOption.id }}
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
<script lang="ts" src="./product-version-update.component.ts"></script>
