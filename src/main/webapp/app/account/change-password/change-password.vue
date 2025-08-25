<template>
  <div class="password-settings">
    <div class="content-header">
      <h1 v-if="username">
        <span v-html="t$('password.title', { username: username })"></span>
      </h1>
      <p class="content-subtitle">{{ t$('password.subTitle') }}</p>
    </div>

    <div class="content-body">
      <div class="alert alert-success" v-if="success">
        {{ t$('password.messages.success') }}
        <button class="close-button" @click="closeAlert('success')" aria-label="Close alert">
          <span>×</span>
        </button>
      </div>
      <div class="alert alert-danger" v-if="error">
        {{ t$('password.messages.error') }}
        <button class="close-button" @click="closeAlert('error')" aria-label="Close alert">
          <span>×</span>
        </button>
      </div>
      <div class="alert alert-danger" v-if="doNotMatch">
        {{ t$('global.messages.error.dontmatch') }}
        <button class="close-button" @click="closeAlert('doNotMatch')" aria-label="Close alert">
          <span>×</span>
        </button>
      </div>

      <form @submit.prevent="changePassword()">
        <div class="form-group">
          <label class="form-label">{{ t$("global.form['currentpassword.label']") }}</label>
          <input
            type="password"
            class="form-control"
            :class="{ valid: !v$.resetPassword.currentPassword.$invalid, invalid: v$.resetPassword.currentPassword.$invalid }"
            v-model="v$.resetPassword.currentPassword.$model"
            :placeholder="t$('global.form[\'currentpassword.placeholder\']')"
            required
            data-cy="currentPassword"
          />
          <div v-if="v$.resetPassword.currentPassword.$anyDirty && v$.resetPassword.currentPassword.$invalid">
            <small class="form-error" v-if="!v$.resetPassword.currentPassword.required">
              {{ t$('global.messages.validate.newpassword.required') }}
            </small>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t$("global.form['newpassword.label']") }}</label>
          <input
            type="password"
            class="form-control"
            :class="{ valid: !v$.resetPassword.newPassword.$invalid, invalid: v$.resetPassword.newPassword.$invalid }"
            v-model="v$.resetPassword.newPassword.$model"
            :placeholder="t$('global.form[\'newpassword.placeholder\']')"
            minlength="4"
            maxlength="50"
            required
            data-cy="newPassword"
          />
          <div v-if="v$.resetPassword.newPassword.$anyDirty && v$.resetPassword.newPassword.$invalid">
            <small class="form-error" v-if="!v$.resetPassword.newPassword.required">
              {{ t$('global.messages.validate.newpassword.required') }}
            </small>
            <small class="form-error" v-if="!v$.resetPassword.newPassword.minLength">
              {{ t$('global.messages.validate.newpassword.minlength') }}
            </small>
            <small class="form-error" v-if="!v$.resetPassword.newPassword.maxLength">
              {{ t$('global.messages.validate.newpassword.maxlength') }}
            </small>
          </div>
        </div>

        <div class="form-group">
          <label class="form-label">{{ t$("global.form['confirmpassword.label']") }}</label>
          <input
            type="password"
            class="form-control"
            :class="{ valid: !v$.resetPassword.confirmPassword.$invalid, invalid: v$.resetPassword.confirmPassword.$invalid }"
            v-model="v$.resetPassword.confirmPassword.$model"
            :placeholder="t$('global.form[\'confirmpassword.placeholder\']')"
            minlength="4"
            maxlength="50"
            required
            data-cy="confirmPassword"
          />
          <div v-if="v$.resetPassword.confirmPassword.$anyDirty && v$.resetPassword.confirmPassword.$invalid">
            <small class="form-error" v-if="!v$.resetPassword.confirmPassword.sameAsPassword">
              {{ t$('global.messages.error.dontmatch') }}
            </small>
          </div>
        </div>

        <div class="form-actions">
          <button type="submit" :disabled="v$.resetPassword.$invalid" class="button button-primary" data-cy="submit">
            {{ t$('password.form.button') }}
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" src="./change-password.component.ts"></script>

<style scoped>
.password-settings {
  width: 100%;
}

.content-header {
  margin-bottom: 48px;
  text-align: center;
}

.content-header h1 {
  font-size: 32px;
  font-weight: 400;
  color: #202124;
  margin: 0 0 16px 0;
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

.form-control.valid {
  border-bottom-color: #34a853;
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

  .form-actions {
    flex-direction: column;
    align-items: center;
  }

  .btn {
    width: 100%;
    max-width: 200px;
  }
}
</style>
