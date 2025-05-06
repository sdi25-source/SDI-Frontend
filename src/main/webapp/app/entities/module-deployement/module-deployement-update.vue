<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.moduleDeployement.home.createOrEditLabel"
          data-cy="ModuleDeployementCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.moduleDeployement.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="moduleDeployement.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="moduleDeployement.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.moduleDeployement.code')" for="module-deployement-code"></label>
            <input
              type="text"
              class="form-control"
              name="code"
              id="module-deployement-code"
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
            <label class="form-control-label" v-text="t$('sdiFrontendApp.moduleDeployement.notes')" for="module-deployement-notes"></label>
            <textarea
              class="form-control"
              name="notes"
              id="module-deployement-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.moduleDeployement.createDate')"
              for="module-deployement-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="module-deployement-createDate"
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
                id="module-deployement-createDate"
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
              v-text="t$('sdiFrontendApp.moduleDeployement.updateDate')"
              for="module-deployement-updateDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="module-deployement-updateDate"
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
                id="module-deployement-updateDate"
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
              v-text="t$('sdiFrontendApp.moduleDeployement.moduleVersion')"
              for="module-deployement-moduleVersion"
            ></label>
            <select
              class="form-control"
              id="module-deployement-moduleVersion"
              data-cy="moduleVersion"
              name="moduleVersion"
              v-model="moduleDeployement.moduleVersion"
            >
              <option :value="null"></option>
              <option
                :value="
                  moduleDeployement.moduleVersion && moduleVersionOption.id === moduleDeployement.moduleVersion.id
                    ? moduleDeployement.moduleVersion
                    : moduleVersionOption
                "
                v-for="moduleVersionOption in moduleVersions"
                :key="moduleVersionOption.id"
              >
                {{ moduleVersionOption.version }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.moduleDeployement.productDeployementDetail')"
              for="module-deployement-productDeployementDetail"
            ></label>
            <select
              class="form-control"
              id="module-deployement-productDeployementDetail"
              data-cy="productDeployementDetail"
              name="productDeployementDetail"
              v-model="moduleDeployement.productDeployementDetail"
            >
              <option :value="null"></option>
              <option
                :value="
                  moduleDeployement.productDeployementDetail &&
                  productDeployementDetailOption.id === moduleDeployement.productDeployementDetail.id
                    ? moduleDeployement.productDeployementDetail
                    : productDeployementDetailOption
                "
                v-for="productDeployementDetailOption in productDeployementDetails"
                :key="productDeployementDetailOption.id"
              >
                {{ productDeployementDetailOption.id }}
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
<script lang="ts" src="./module-deployement-update.component.ts"></script>
