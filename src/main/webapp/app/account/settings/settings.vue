<template>
  <div class="profile-settings">
    <div class="content-header pb-2">
      <div class="user-header pb-1">
        <div class="avatar-circle" v-if="username">{{ username.charAt(0).toUpperCase() }}</div>
        <h1 v-if="username">{{ username }}</h1>
      </div>
      <p class="content-subtitle">{{ t$('settings.title') }}</p>
    </div>

    <div class="content-body">
      <div class="alert alert-success" v-if="success">
        {{ t$('settings.messages.success') }}
        <button class="close-button" @click="closeAlert('success')" aria-label="Close alert">
          <span>×</span>
        </button>
      </div>
      <div class="alert alert-danger" v-if="errorEmailExists">
        {{ t$('register.messages.error.emailexists') }}
        <button class="close-button" @click="closeAlert('errorEmailExists')" aria-label="Close alert">
          <span>×</span>
        </button>
      </div>

      <form @submit.prevent="saveProfile()" v-if="settingsAccount">
        <div class="form-row">
          <div class="form-group">
            <label class="form-label">{{ t$('settings.form.firstname') }}</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'form-control-readonly': !isEditing,
                valid: !v$.settingsAccount.firstName.$invalid,
                invalid: v$.settingsAccount.firstName.$invalid,
              }"
              v-model="v$.settingsAccount.firstName.$model"
              :readonly="!isEditing"
              :placeholder="t$('settings.form[\'firstname.placeholder\']')"
              minlength="1"
              maxlength="50"
              required
            />
            <div v-if="isEditing && v$.settingsAccount.firstName.$anyDirty && v$.settingsAccount.firstName.$invalid">
              <small class="form-error" v-if="!v$.settingsAccount.firstName.required">
                {{ t$('settings.messages.validate.firstname.required') }}
              </small>
              <small class="form-error" v-if="!v$.settingsAccount.firstName.minLength">
                {{ t$('settings.messages.validate.firstname.minlength') }}
              </small>
              <small class="form-error" v-if="!v$.settingsAccount.firstName.maxLength">
                {{ t$('settings.messages.validate.firstname.maxlength') }}
              </small>
            </div>
          </div>

          <div class="form-group">
            <label class="form-label">{{ t$('settings.form.lastname') }}</label>
            <input
              type="text"
              class="form-control"
              :class="{
                'form-control-readonly': !isEditing,
                valid: !v$.settingsAccount.lastName.$invalid,
                invalid: v$.settingsAccount.lastName.$invalid,
              }"
              v-model="v$.settingsAccount.lastName.$model"
              :readonly="!isEditing"
              :placeholder="t$('settings.form[\'lastname.placeholder\']')"
              minlength="1"
              maxlength="50"
              required
            />
            <div v-if="isEditing && v$.settingsAccount.lastName.$anyDirty && v$.settingsAccount.lastName.$invalid">
              <small class="form-error" v-if="!v$.settingsAccount.lastName.required">
                {{ t$('settings.messages.validate.lastname.required') }}
              </small>
              <small class="form-error" v-if="!v$.settingsAccount.lastName.minLength">
                {{ t$('settings.messages.validate.lastname.minlength') }}
              </small>
              <small class="form-error" v-if="!v$.settingsAccount.lastName.maxLength">
                {{ t$('settings.messages.validate.lastname.maxlength') }}
              </small>
            </div>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t$("global.form['email.label']") }}</label>
          <input
            type="email"
            class="form-control"
            :class="{
              'form-control-readonly': !isEditing,
              valid: !v$.settingsAccount.email.$invalid,
              invalid: v$.settingsAccount.email.$invalid,
            }"
            v-model="v$.settingsAccount.email.$model"
            :readonly="!isEditing"
            :placeholder="t$('global.form[\'email.placeholder\']')"
            minlength="5"
            maxlength="254"
            required
          />
          <div v-if="isEditing && v$.settingsAccount.email.$anyDirty && v$.settingsAccount.email.$invalid">
            <small class="form-error" v-if="!v$.settingsAccount.email.required">
              {{ t$('global.messages.validate.email.required') }}
            </small>
            <small class="form-error" v-if="!v$.settingsAccount.email.email">
              {{ t$('global.messages.validate.email.invalid') }}
            </small>
            <small class="form-error" v-if="!v$.settingsAccount.email.minLength">
              {{ t$('global.messages.validate.email.minlength') }}
            </small>
            <small class="form-error" v-if="!v$.settingsAccount.email.maxLength">
              {{ t$('global.messages.validate.email.maxlength') }}
            </small>
          </div>
        </div>

        <div class="form-group" v-if="languages && Object.keys(languages).length > 1 && isEditing">
          <label class="form-label">{{ t$('settings.form.language') }}</label>
          <select
            class="form-control"
            :class="{ 'form-control-readonly': !isEditing }"
            v-model="settingsAccount.langKey"
            :disabled="!isEditing"
          >
            <option v-for="(language, key) in languages" :value="key" :key="`lang-${key}`">
              {{ language.name }}
            </option>
          </select>
        </div>

        <div class="form-actions" v-if="isEditing">
          <button type="submit" :disabled="v$.settingsAccount.$invalid" class="button button-primary">
            {{ t$('settings.form.button') }}
          </button>
          <button type="button" @click="handleCancel()" class="button button-secondary">{{ t$('settings.form.cancel') }}</button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" src="./settings.component.ts"></script>

<style scoped>
.profile-settings {
  width: 100%;
}

.content-header {
  margin-bottom: 48px;
  text-align: center;
}

.user-header {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  margin-bottom: 16px;
}

.avatar-circle {
  width: 40px;
  height: 40px;
  background-color: #0c2d57;
  color: white;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  font-weight: 500;
}

.content-header h1 {
  font-size: 32px;
  font-weight: 400;
  color: #202124;
  margin: 0;
}

.content-subtitle {
  font-size: 16px;
  color: #5f6368;
  margin: 0;
  line-height: 1.5;
}

.content-body {
  width: 100%;
}

.form-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 24px;
  margin-bottom: 24px;
}

.form-group {
  margin-bottom: 32px;
}

.form-label {
  display: block;
  font-size: 16px;
  font-weight: 500;
  color: #3c4043;
  margin-bottom: 12px;
}

.form-control {
  width: 100%;
  padding: 16px 0;
  border: none;
  border-bottom: 1px solid #dadce0;
  font-size: 16px;
  transition: all 0.2s ease;
  background: transparent;
  border-radius: 0;
}

.form-control:focus {
  outline: none;
  border-bottom-color: #1a73e8;
  border-bottom-width: 2px;
}

.form-control-readonly {
  background-color: transparent;
  border-bottom-color: #e8eaed;
  cursor: default;
  color: #5f6368;
}

.form-control.valid {
  border-bottom-color: #1a73e8;
}

.form-control.invalid {
  border-bottom-color: #ea4335;
}

.form-error {
  color: #ea4335;
  font-size: 14px;
  margin-top: 8px;
  display: block;
}

.form-actions {
  display: flex;
  gap: 16px;
  justify-content: center;
  padding-top: 32px;
  margin-top: 48px;
}

.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  padding: 12px 32px;
  border: none;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  min-width: 120px;
  border-radius: 17px;
}

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.button-primary:hover {
  background-color: #26538a;
}

.button-secondary {
  background-color: #f1f5f9;
  color: #334155;
  border-color: #e2e8f0;
}

.button-secondary:hover {
  background-color: #e2e8f0;
}

.alert {
  padding: 16px 48px 16px 24px;
  border-radius: 8px;
  margin-bottom: 32px;
  font-size: 14px;
  text-align: center;
  position: relative;
}

.alert-success {
  background-color: #e6f4ea;
  border: 1px solid #34a853;
  color: #137333;
}

.alert-danger {
  background-color: #fce8e6;
  border: 1px solid #ea4335;
  color: #d93025;
}

.close-button {
  position: absolute;
  top: 50%;
  right: 16px;
  transform: translateY(-50%);
  background: none;
  border: none;
  font-size: 18px;
  cursor: pointer;
  color: inherit;
  padding: 0;
  line-height: 1;
}

.close-button:hover {
  opacity: 0.7;
}

.alert-success .close-button {
  color: #137333;
}

.alert-danger .close-button {
  color: #d93025;
}

@media (max-width: 768px) {
  .form-row {
    grid-template-columns: 1fr;
  }

  .content-header h1 {
    font-size: 28px;
  }

  .user-header {
    flex-direction: column;
    gap: 8px;
  }

  .avatar-circle {
    width: 36px;
    height: 36px;
    font-size: 18px;
  }

  .form-actions {
    flex-direction: column;
    align-items: center;
  }
}
</style>
