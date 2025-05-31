<template>
  <div class="login mt-5">
    <div class="login-form-container pl-5">
      <form id="register-form" name="registerForm" @submit.prevent="register()" v-if="!success" novalidate>
        <div class="form-content">
          <div class="header">
            <div class="row justify-content-center">
              <div class="col-md-8 toastify-container">
                <div class="alert alert-success" role="alert" v-if="success" v-text="t$('register.messages.success')"></div>

                <div class="alert alert-danger" role="alert" v-if="error" v-text="t$('register.messages.error.fail')"></div>

                <div class="alert alert-danger" role="alert" v-if="errorUserExists" v-text="t$('register.messages.error.userexists')"></div>

                <div
                  class="alert alert-danger"
                  role="alert"
                  v-if="errorEmailExists"
                  v-text="t$('register.messages.error.emailexists')"
                ></div>
                <div
                  class="alert alert-danger"
                  role="alert"
                  v-if="errorEmailExists"
                  v-text="t$('register.messages.error.emailexists')"
                ></div>
              </div>
            </div>
            <h1 class="welcome-title" v-text="t$('register.title')"></h1>
            <p v-text="t$('register.subTitle')"></p>
          </div>
          <div class="divider mt-3"></div>
          <div class="form-fields">
            <!-- Username -->
            <div class="form-group">
              <label for="username" class="label-c">
                <span v-text="t$('global.form[\'username.label\']')"></span>
                <span class="text-danger">*</span>
              </label>
              <input
                type="text"
                id="username"
                name="login"
                class="form-control"
                :placeholder="t$('global.form[\'username.placeholder\']')"
                v-model="v$.registerAccount.login.$model"
                :class="{ valid: !v$.registerAccount.login.$invalid, invalid: v$.registerAccount.login.$invalid }"
                required
                minlength="1"
                maxlength="50"
                pattern="^[a-zA-Z0-9!#$&'*+=?^_`{|}~.-]+@?[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$"
                data-cy="username"
              />
              <div v-if="v$.registerAccount.login.$anyDirty && v$.registerAccount.login.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.login.required"
                  v-text="t$('register.messages.validate.login.required')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.login.minLength"
                  v-text="t$('register.messages.validate.login.minlength')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.login.maxLength"
                  v-text="t$('register.messages.validate.login.maxlength')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.login.pattern"
                  v-text="t$('register.messages.validate.login.pattern')"
                ></small>
              </div>
            </div>

            <!-- Email -->
            <div class="form-group">
              <label for="email" class="label-c">
                <span v-text="t$('global.form[\'email.label\']')"></span>
                <span class="text-danger">*</span>
              </label>
              <input
                type="email"
                id="email"
                name="email"
                class="form-control"
                :placeholder="t$('global.form[\'email.placeholder\']')"
                v-model="v$.registerAccount.email.$model"
                :class="{ valid: !v$.registerAccount.email.$invalid, invalid: v$.registerAccount.email.$invalid }"
                required
                minlength="5"
                maxlength="254"
                data-cy="email"
              />
              <div v-if="v$.registerAccount.email.$anyDirty && v$.registerAccount.email.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.email.required"
                  v-text="t$('global.messages.validate.email.required')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.email.email"
                  v-text="t$('global.messages.validate.email.invalid')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.email.minLength"
                  v-text="t$('global.messages.validate.email.minlength')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.email.maxLength"
                  v-text="t$('global.messages.validate.email.maxlength')"
                ></small>
              </div>
            </div>

            <!-- Password -->
            <div class="form-group">
              <label for="firstPassword" class="label-c">
                <span v-text="t$('global.form[\'newpassword.label\']')"></span>
                <span class="text-danger">*</span>
              </label>
              <input
                type="password"
                id="firstPassword"
                name="password"
                class="form-control"
                :placeholder="t$('global.form[\'newpassword.placeholder\']')"
                v-model="v$.registerAccount.password.$model"
                :class="{ valid: !v$.registerAccount.password.$invalid, invalid: v$.registerAccount.password.$invalid }"
                required
                minlength="4"
                maxlength="50"
                data-cy="firstPassword"
              />
              <div v-if="v$.registerAccount.password.$anyDirty && v$.registerAccount.password.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.password.required"
                  v-text="t$('global.messages.validate.newpassword.required')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.password.minLength"
                  v-text="t$('global.messages.validate.newpassword.minlength')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.registerAccount.password.maxLength"
                  v-text="t$('global.messages.validate.newpassword.maxlength')"
                ></small>
              </div>
            </div>

            <!-- Confirm Password -->
            <div class="form-group">
              <label for="secondPassword" class="label-c">
                <span v-text="t$('global.form[\'confirmpassword.label\']')"></span>
                <span class="text-danger">*</span>
              </label>
              <input
                type="password"
                id="secondPassword"
                name="confirmPasswordInput"
                class="form-control"
                :placeholder="t$('global.form[\'confirmpassword.placeholder\']')"
                v-model="v$.confirmPassword.$model"
                :class="{ valid: !v$.confirmPassword.$invalid, invalid: v$.confirmPassword.$invalid }"
                required
                minlength="4"
                maxlength="50"
                data-cy="secondPassword"
              />
              <div v-if="v$.confirmPassword.$dirty && v$.confirmPassword.$invalid">
                <small
                  class="form-text text-danger"
                  v-if="!v$.confirmPassword.required"
                  v-text="t$('global.messages.validate.confirmpassword.required')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.confirmPassword.minLength"
                  v-text="t$('global.messages.validate.confirmpassword.minlength')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.confirmPassword.maxLength"
                  v-text="t$('global.messages.validate.confirmpassword.maxlength')"
                ></small>
                <small
                  class="form-text text-danger"
                  v-if="!v$.confirmPassword.sameAsPassword"
                  v-text="t$('global.messages.error.dontmatch')"
                ></small>
              </div>
            </div>

            <!-- Role Selection -->
            <div class="form-group">
              <label for="authority" class="label-c">
                <!--                <span v-text="t$('register.form.profile')"></span>-->
                <span>Profile</span>
                <span class="text-danger">*</span>
              </label>
              <select id="authority" name="authority" class="form-control rounded-3" v-model="v$.registerAccount.authority.$model" required>
                <option disabled v-text="t$('register.form.authority')"></option>
                <option value="ROLE_USER" v-text="t$('register.form.user')"></option>
                <option value="ROLE_COMMERCIAL" v-text="t$('register.form.commercial')"></option>
              </select>
            </div>

            <button
              type="submit"
              :disabled="v$.$invalid"
              class="login-button"
              data-cy="submit"
              v-text="t$('register.form.button')"
            ></button>
          </div>

          <div class="divider mt-3 mb-3"></div>

          <div class="signup-text label-cs">
            <p v-text="t$('login.haveaccount')"></p>
            <span><b-link :to="'/login'" class="signup-link" v-text="t$('login.form.button')"></b-link></span>
          </div>
        </div>
      </form>
    </div>

    <!-- Image à droite -->
    <div class="hero-img" data-aos="zoom-out">
      <img src="../../../content/images/hero-img.png" class="img-fluid animate" alt="hero image" />
    </div>
  </div>
</template>

<script lang="ts" src="./register.component.ts"></script>

<style scoped>
.label-cs {
  color: #012970ff;
  font-weight: 500;
}

.label-c {
  display: inline-flex;
  align-items: center;
}

.text-danger {
  margin-left: 4px;
}

* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Layout en ligne */
.login {
  display: flex;
  flex-direction: row;
  align-items: center;
  justify-content: center;
  gap: 120px;
  padding: 0px;
  flex-wrap: wrap; /* pour responsivité sur petit écran */
  background-color: #ffffff;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
}

.login-form-container {
  flex: 1;
  max-width: 570px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  margin-left: 200px;
}

/* Form content */
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
  gap: 8px;
}

.logo-link {
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  text-decoration: none;
  color: inherit;
}

.welcome-title {
  font-size: 1.25rem;
  font-weight: 700;
}

.signup-text {
  text-align: center;
  font-size: 0.875rem;
}

.signup-link {
  text-decoration: underline;
  text-underline-offset: 4px;
  color: inherit;
}

/* Form fields */
.form-fields {
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.form-group {
  display: grid;
  gap: 8px;
}

label {
  font-size: 0.875rem;
  font-weight: 500;
}

input {
  padding: 8px 12px;
  font-size: 0.875rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  width: 100%;
}

input:focus {
  outline: none;
  border-color: #94a3b8;
  box-shadow: 0 0 0 1px #94a3b8;
}

.login-button {
  width: 100%;
  padding: 8px 16px;
  background-color: #0d83fdff;
  color: #ffffff;
  font-weight: 500;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s;
}

.login-button:hover {
  background-color: #4154f1;
}

/* Divider */
.divider {
  position: relative;
  text-align: center;
  font-size: 0.875rem;
}

.divider::after {
  content: '';
  position: absolute;
  inset: 0;
  top: 50%;
  z-index: 0;
  display: flex;
  align-items: center;
  border-top: 1px solid #e2e8f0;
}

.divider-text {
  position: relative;
  z-index: 10;
  background-color: #ffffff;
  padding: 0 8px;
  color: #64748b;
}

/* Image à droite */
.hero-img {
  flex: 1;
  display: flex;
  justify-content: center;
  align-items: center;
}

.hero-img img {
  max-width: 100%;
  height: auto;
}
</style>
