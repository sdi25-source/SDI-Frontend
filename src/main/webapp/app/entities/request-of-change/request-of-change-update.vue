<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.requestOfChange.home.createOrEditLabel"
          data-cy="RequestOfChangeCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.requestOfChange.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="requestOfChange.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="requestOfChange.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.requestOfChange.title')" for="request-of-change-title"></label>
            <input
              type="text"
              class="form-control"
              name="title"
              id="request-of-change-title"
              data-cy="title"
              :class="{ valid: !v$.title.$invalid, invalid: v$.title.$invalid }"
              v-model="v$.title.$model"
              required
            />
            <div v-if="v$.title.$anyDirty && v$.title.$invalid">
              <small class="form-text text-danger" v-for="error of v$.title.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.requestOfChange.keywords')"
              for="request-of-change-keywords"
            ></label>
            <textarea
              class="form-control"
              name="keywords"
              id="request-of-change-keywords"
              data-cy="keywords"
              :class="{ valid: !v$.keywords.$invalid, invalid: v$.keywords.$invalid }"
              v-model="v$.keywords.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.requestOfChange.status')" for="request-of-change-status"></label>
            <select
              class="form-control"
              name="status"
              :class="{ valid: !v$.status.$invalid, invalid: v$.status.$invalid }"
              v-model="v$.status.$model"
              id="request-of-change-status"
              data-cy="status"
              required
            >
              <option
                v-for="requestStatus in requestStatusValues"
                :key="requestStatus"
                :value="requestStatus"
                :label="t$('sdiFrontendApp.RequestStatus.' + requestStatus)"
              >
                {{ requestStatus }}
              </option>
            </select>
            <div v-if="v$.status.$anyDirty && v$.status.$invalid">
              <small class="form-text text-danger" v-for="error of v$.status.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.requestOfChange.createDate')"
              for="request-of-change-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="request-of-change-createDate"
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
                id="request-of-change-createDate"
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
              v-text="t$('sdiFrontendApp.requestOfChange.description')"
              for="request-of-change-description"
            ></label>
            <textarea
              class="form-control"
              name="description"
              id="request-of-change-description"
              data-cy="description"
              :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
              v-model="v$.description.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.requestOfChange.productVersion')"
              for="request-of-change-productVersion"
            ></label>
            <select
              class="form-control"
              id="request-of-change-productVersion"
              data-cy="productVersion"
              name="productVersion"
              v-model="requestOfChange.productVersion"
            >
              <option :value="null"></option>
              <option
                :value="
                  requestOfChange.productVersion && productVersionOption.id === requestOfChange.productVersion.id
                    ? requestOfChange.productVersion
                    : productVersionOption
                "
                v-for="productVersionOption in productVersions"
                :key="productVersionOption.id"
              >
                {{ productVersionOption.version }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.requestOfChange.client')" for="request-of-change-client"></label>
            <select class="form-control" id="request-of-change-client" data-cy="client" name="client" v-model="requestOfChange.client">
              <option :value="null"></option>
              <option
                :value="requestOfChange.client && clientOption.id === requestOfChange.client.id ? requestOfChange.client : clientOption"
                v-for="clientOption in clients"
                :key="clientOption.id"
              >
                {{ clientOption.code }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label v-text="t$('sdiFrontendApp.requestOfChange.moduleVersion')" for="request-of-change-moduleVersion"></label>
            <select
              class="form-control"
              id="request-of-change-moduleVersions"
              data-cy="moduleVersion"
              multiple
              name="moduleVersion"
              v-if="requestOfChange.moduleVersions !== undefined"
              v-model="requestOfChange.moduleVersions"
            >
              <option
                :value="getSelected(requestOfChange.moduleVersions, moduleVersionOption, 'id')"
                v-for="moduleVersionOption in moduleVersions"
                :key="moduleVersionOption.id"
              >
                {{ moduleVersionOption.id }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.requestOfChange.customisationLevel')"
              for="request-of-change-customisationLevel"
            ></label>
            <select
              class="form-control"
              id="request-of-change-customisationLevel"
              data-cy="customisationLevel"
              name="customisationLevel"
              v-model="requestOfChange.customisationLevel"
            >
              <option :value="null"></option>
              <option
                :value="
                  requestOfChange.customisationLevel && customisationLevelOption.id === requestOfChange.customisationLevel.id
                    ? requestOfChange.customisationLevel
                    : customisationLevelOption
                "
                v-for="customisationLevelOption in customisationLevels"
                :key="customisationLevelOption.id"
              >
                {{ customisationLevelOption.id }}
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
<script lang="ts" src="./request-of-change-update.component.ts"></script>
