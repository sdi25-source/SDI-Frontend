<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate @submit.prevent="save()">
        <h2
          id="sdiFrontendApp.clientEvent.home.createOrEditLabel"
          data-cy="ClientEventCreateUpdateHeading"
          v-text="t$('sdiFrontendApp.clientEvent.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="clientEvent.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="clientEvent.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientEvent.event')" for="client-event-event"></label>
            <input
              type="text"
              class="form-control"
              name="event"
              id="client-event-event"
              data-cy="event"
              :class="{ valid: !v$.event.$invalid, invalid: v$.event.$invalid }"
              v-model="v$.event.$model"
              required
            />
            <div v-if="v$.event.$anyDirty && v$.event.$invalid">
              <small class="form-text text-danger" v-for="error of v$.event.$errors" :key="error.$uid">{{ error.$message }}</small>
            </div>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientEvent.description')" for="client-event-description"></label>
            <input
              type="text"
              class="form-control"
              name="description"
              id="client-event-description"
              data-cy="description"
              :class="{ valid: !v$.description.$invalid, invalid: v$.description.$invalid }"
              v-model="v$.description.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientEvent.eventDate')" for="client-event-eventDate"></label>
            <b-input-group class="mb-3">
              <b-input-group-prepend>
                <b-form-datepicker
                  aria-controls="client-event-eventDate"
                  v-model="v$.eventDate.$model"
                  name="eventDate"
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
                id="client-event-eventDate"
                data-cy="eventDate"
                type="text"
                class="form-control"
                name="eventDate"
                :class="{ valid: !v$.eventDate.$invalid, invalid: v$.eventDate.$invalid }"
                v-model="v$.eventDate.$model"
              />
            </b-input-group>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientEvent.notes')" for="client-event-notes"></label>
            <textarea
              class="form-control"
              name="notes"
              id="client-event-notes"
              data-cy="notes"
              :class="{ valid: !v$.notes.$invalid, invalid: v$.notes.$invalid }"
              v-model="v$.notes.$model"
            ></textarea>
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('sdiFrontendApp.clientEvent.client')" for="client-event-client"></label>
            <select class="form-control" id="client-event-client" data-cy="client" name="client" v-model="clientEvent.client">
              <option :value="null"></option>
              <option
                :value="clientEvent.client && clientOption.id === clientEvent.client.id ? clientEvent.client : clientOption"
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
              v-text="t$('sdiFrontendApp.clientEvent.clientEventType')"
              for="client-event-clientEventType"
            ></label>
            <select
              class="form-control"
              id="client-event-clientEventType"
              data-cy="clientEventType"
              name="clientEventType"
              v-model="clientEvent.clientEventType"
            >
              <option :value="null"></option>
              <option
                :value="
                  clientEvent.clientEventType && clientEventTypeOption.id === clientEvent.clientEventType.id
                    ? clientEvent.clientEventType
                    : clientEventTypeOption
                "
                v-for="clientEventTypeOption in clientEventTypes"
                :key="clientEventTypeOption.id"
              >
                {{ clientEventTypeOption.type }}
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
<script lang="ts" src="./client-event-update.component.ts"></script>
