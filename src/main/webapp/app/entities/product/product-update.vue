<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.product.home.createOrEditLabel"
          data-cy="ProductCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.product.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="product.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="product.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.product.name')" for="product-name"></label>
            <input
              type="text"
              class="form-control"
              name="name"
              id="product-name"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.product.logo')" for="product-logo"></label>
            <input
              type="text"
              class="form-control"
              name="logo"
              id="product-logo"
              data-cy="logo"
              :class="{ valid: !v$.logo.$invalid, invalid: v$.logo.$invalid }"
              v-model="v$.logo.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.product.description')" for="product-description"></label>
            <textarea
              class="form-control"
              name="description"
              id="product-description"
              data-cy="description"
              :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
              v-model="v$.description.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.product.createDate')" for="product-createDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="product-createDate"
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
                id="product-createDate"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.product.updateDate')" for="product-updateDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="product-updateDate"
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
                id="product-updateDate"
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
            <label v-text="t$('sdiFrontendApp.product.productLine')" for="product-productLine"></label>
            <select
              class="form-control"
              id="product-productLines"
              data-cy="productLine"
              multiple
              name="productLine"
              v-if="product.productLines !== undefined"
              v-model="product.productLines"
            >
              <option
                :value="getSelected(product.productLines, productLineOption, 'id')"
                v-for="productLineOption in productLines"
                :key="productLineOption.id"
              >
                {{ productLineOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label v-text="t$('sdiFrontendApp.product.module')" for="product-module"></label>
            <select
              class="form-control"
              id="product-modules"
              data-cy="module"
              multiple
              name="module"
              v-if="product.modules !== undefined"
              v-model="product.modules"
            >
              <option :value="getSelected(product.modules, moduleOption, 'id')" v-for="moduleOption in modules" :key="moduleOption.id">
                {{ moduleOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label v-text="t$('sdiFrontendApp.product.infraComponentVersion')" for="product-infraComponentVersion"></label>
            <select
              class="form-control"
              id="product-infraComponentVersions"
              data-cy="infraComponentVersion"
              multiple
              name="infraComponentVersion"
              v-if="product.infraComponentVersions !== undefined"
              v-model="product.infraComponentVersions"
            >
              <option
                :value="getSelected(product.infraComponentVersions, infraComponentVersionOption, 'id')"
                v-for="infraComponentVersionOption in infraComponentVersions"
                :key="infraComponentVersionOption.id"
              >
                {{ infraComponentVersionOption.id }}
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
<script lang="ts" src="./product-update.component.ts"></script>
