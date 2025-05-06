<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.clientCertification.home.createOrEditLabel"
          data-cy="ClientCertificationCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.clientCertification.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="clientCertification.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="clientCertification.id" readonly />
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.clientCertification.certification')"
              for="client-certification-certification"
            ></label>
            <input
              type="text"
              class="form-control"
              name="certification"
              id="client-certification-certification"
              data-cy="certification"
              :class="{ valid: !v$.certification.$invalid, invalid: v$.certification.$invalid }"
              v-model="v$.certification.$model"
              required
            />
            <div v-if="v$.certification.$anyDirty && v$.certification.$invalid">
              <small class="form-text text-danger" v-for="error of v$.certification.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.clientCertification.certificationDate')"
              for="client-certification-certificationDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="client-certification-certificationDate"
                  v-model="v$.certificationDate.$model"
                  name="certificationDate"
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
                id="client-certification-certificationDate"
                data-cy="certificationDate"
                type="text"
                class="form-control"
                name="certificationDate"
                :class="{ valid: !v$.certificationDate.$invalid, invalid: v$.certificationDate.$invalid }"
                v-model="v$.certificationDate.$model"
              />
            </b-input-group>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.clientCertification.createDate')"
              for="client-certification-createDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="client-certification-createDate"
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
                id="client-certification-createDate"
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
              v-text="t$('sdiFrontendApp.clientCertification.updateDate')"
              for="client-certification-updateDate"
            ></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="client-certification-updateDate"
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
                id="client-certification-updateDate"
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
              v-text="t$('sdiFrontendApp.clientCertification.notes')"
              for="client-certification-notes"
            ></label>
            <textarea
              class="form-control"
              name="notes"
              id="client-certification-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.clientCertification.client')"
              for="client-certification-client"
            ></label>
            <select
              class="form-control"
              id="client-certification-client"
              data-cy="client"
              name="client"
              v-model="clientCertification.client"
            >
              <option :value="null"></option>
              <option
                :value="
                  clientCertification.client && clientOption.id === clientCertification.client.id
                    ? clientCertification.client
                    : clientOption
                "
                v-for="clientOption in clients"
                :key="clientOption.id"
              >
                {{ clientOption.code }}
              </option>
            </select>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('sdiFrontendApp.clientCertification.certif')"
              for="client-certification-certif"
            ></label>
            <select
              class="form-control"
              id="client-certification-certif"
              data-cy="certif"
              name="certif"
              v-model="clientCertification.certif"
            >
              <option :value="null"></option>
              <option
                :value="
                  clientCertification.certif && certificationOption.id === clientCertification.certif.id
                    ? clientCertification.certif
                    : certificationOption
                "
                v-for="certificationOption in certifications"
                :key="certificationOption.id"
              >
                {{ certificationOption.name }}
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
<script lang="ts" src="./client-certification-update.component.ts"></script>
