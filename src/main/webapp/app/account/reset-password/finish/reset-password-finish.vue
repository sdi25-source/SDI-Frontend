<template>
  <div class="reset-password">
    <div class="reset-form-container border-5 shadow-lg p-5">
      <div class="form-content">
        <div class="header">
          <h1 class="welcome-title" v-text="t$('reset.request.title')"></h1>
        </div>

        <div class="alert alert-danger" v-if="keyMissing" v-html="t$('reset.finish.messages.keymissing')"></div>

        <div class="alert alert-danger" v-if="error">
          <p v-text="t$('reset.finish.messages.error')"></p>
        </div>

        <div class="alert alert-success" v-if="success">
          <div class="success-content">
            <font-awesome-icon icon="check-circle" class="success-icon" />
            <p>
              <span v-html="t$('reset.finish.messages.success')"></span>
              <a class="alert-link" @click="openLogin" v-text="t$('global.messages.info.authenticated.link')"></a>
            </p>
          </div>
        </div>

        <div class="alert alert-danger" v-if="doNotMatch">
          <p v-text="t$('global.messages.error.dontmatch')"></p>
        </div>

        <div class="alert alert-warning" v-if="!success && !keyMissing">
          <p v-text="t$('reset.finish.messages.info')"></p>
        </div>

        <div v-if="!keyMissing">
          <form v-if="!success" name="form" @submit.prevent="finishReset()" class="form-fields">
            <div class="form-group">
              <label class="label-c" for="newPassword" v-text="t$('global.form[\'newpassword.label\']')"></label>
              <div class="input-with-validation">
                <input
                  type="password"
                  class="form-control"
                  id="newPassword"
                  name="newPassword"
                  :placeholder="t$('global.form[\'newpassword.placeholder\']')"
                  v-model="v$.resetAccount.newPassword.$model"
                  minlength="4"
                  maxlength="50"
                  required
                  data-cy="resetPassword"
                />
                <span class="valid-check" v-if="v$.resetAccount.newPassword.$anyDirty && !v$.resetAccount.newPassword.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
              <div v-if="v$.resetAccount.newPassword.$anyDirty && v$.resetAccount.newPassword.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.resetAccount.newPassword.required"
                  v-text="t$('global.messages.validate.newpassword.required')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.resetAccount.newPassword.minLength"
                  v-text="t$('global.messages.validate.newpassword.minlength')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.resetAccount.newPassword.maxLength"
                  v-text="t$('global.messages.validate.newpassword.maxlength')"
                ></small>
              </div>
            </div>
            <div class="form-group">
              <label class="label-c" for="confirmPassword" v-text="t$('global.form[\'confirmpassword.label\']')"></label>
              <div class="input-with-validation">
                <input
                  type="password"
                  class="form-control"
                  id="confirmPassword"
                  name="confirmPassword"
                  :placeholder="t$('global.form[\'confirmpassword.placeholder\']')"
                  v-model="v$.resetAccount.confirmPassword.$model"
                  minlength="4"
                  maxlength="50"
                  required
                  data-cy="confirmResetPassword"
                />
                <span class="valid-check" v-if="v$.resetAccount.confirmPassword.$anyDirty && !v$.resetAccount.confirmPassword.$invalid">
                  <font-awesome-icon icon="check" class="text-success" />
                </span>
              </div>
              <div v-if="v$.resetAccount.confirmPassword.$anyDirty && v$.resetAccount.confirmPassword.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.resetAccount.confirmPassword.sameAsPassword"
                  v-text="t$('global.messages.error.dontmatch')"
                ></small>
              </div>
            </div>
            <div class="divider mt-3 mb-3"></div>
            <div class="action-buttons">
              <button type="submit" :disabled="v$.resetAccount.$invalid" class="login-button button button-primary" data-cy="submit">
                <font-awesome-icon icon="paper-plane" v-if="!isLoading"></font-awesome-icon>
                <font-awesome-icon icon="spinner" spin v-if="isLoading"></font-awesome-icon>
                <span v-text="t$('password.form.button')"></span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./reset-password-finish.component.ts"></script>

<style scoped>
.button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  border-radius: 6px;
  font-weight: 500;
  padding: 0.5rem 1rem;
  transition: all 0.2s;
  cursor: pointer;
  border: 1px solid transparent;
  font-size: 0.875rem;
}

.button-primary {
  background-color: #0c2d57;
  color: white;
  border-color: #0c2d57;
}

.button-primary:hover {
  background-color: #4154f1;
}

.label-c {
  color: #012970;
  font-weight: 500;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Layout principal */
.reset-password {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #ffffff;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 10px;
}

/* Conteneur du formulaire */
.reset-form-container {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
}

/* Contenu du formulaire */
.form-content {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

/* Header section */
.header {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  text-align: center;
}

.welcome-title {
  font-size: 1.75rem;
  font-weight: 700;
  color: #012970;
  margin-bottom: 5px;
}

/* Alertes */
.alert {
  padding: 16px;
  border-radius: 8px;
  margin: 0;
}

.alert-success {
  background-color: #d1edff;
  border: 1px solid #b8e6ff;
  color: #0c5460;
}

.alert-danger {
  background-color: #f8d7da;
  border: 1px solid #f5c6cb;
  color: #721c24;
}

.alert-warning {
  background-color: #fff3cd;
  border: 1px solid #ffeeba;
  color: #856404;
}

.alert-link {
  color: #0c5460;
  cursor: pointer;
  text-decoration: underline;
}

.alert-link:hover {
  color: #083a4b;
}

.success-content {
  display: flex;
  align-items: center;
  gap: 12px;
}

.success-icon {
  color: #28a745;
  font-size: 1.25rem;
}

/* Champs du formulaire */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 20px;
}

.form-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 0;
}

/* Divider */
.divider {
  position: relative;
  height: 1px;
  background-color: #e2e8f0;
  margin: 15px 0;
}

/* Input avec validation */
.input-with-validation {
  position: relative;
  display: flex;
  align-items: center;
}

.input-with-validation input {
  width: 100%;
  padding-right: 40px;
}

.valid-check {
  position: absolute;
  right: 12px;
  color: #28a745;
  font-size: 0.875rem;
}

.text-success {
  color: #28a745 !important;
}

/* Style des champs de formulaire */
.form-control {
  padding: 12px 16px;
  height: auto;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 100%;
  transition:
    border-color 0.15s ease-in-out,
    box-shadow 0.15s ease-in-out;
  font-size: 0.875rem;
}

.form-control:focus {
  border-color: #94a3b8;
  box-shadow: 0 0 0 2px rgba(148, 163, 184, 0.1);
  outline: none;
}

.form-control::placeholder {
  color: #9ca3af;
}

/* Validation */
.form-text.text-danger {
  color: #dc3545 !important;
  font-size: 0.75rem;
  margin-top: 4px;
}

/* Boutons */
.action-buttons {
  display: flex;
  justify-content: center;
  margin-top: 10px;
}

.login-button {
  width: 100%;
  padding: 12px 16px;
  background-color: #0c2d57;
  color: #ffffff;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
  font-size: 0.875rem;
  min-height: 46px;
}

.login-button:hover:not(:disabled) {
  background-color: #2a6dd3;
}

.login-button:disabled {
  background-color: #9ca3af;
  cursor: not-allowed;
}

/* Animation pour le spinner */
@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

/* Responsive design */
@media (max-width: 768px) {
  .reset-form-container {
    padding: 24px;
    margin: 20px;
  }

  .welcome-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .reset-form-container {
    padding: 20px;
    margin: 10px;
  }
}
</style>
