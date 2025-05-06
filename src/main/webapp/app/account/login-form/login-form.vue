<template>
  <div class="login mt-5">
    <div class="login-form-container pl-5">
      <form method="post" @submit.prevent="doLogin()">
        <div class="form-content">
          <div class="header">
            <a href="#" class="logo-link">
              <b-alert
                show
                data-cy="loginError"
                variant="danger"
                v-if="authenticationError"
                v-html="t$('login.messages.error.authentication')"
                class="rounded-2"
              ></b-alert>
            </a>
            <h1 class="welcome-title" v-text="t$('login.title')"></h1>
            <p v-text="t$('login.subTitle')"></p>
          </div>
          <div class="divider mt-3"></div>
          <div class="form-fields">
            <div class="form-group">
              <label for="username" class="label-c">
                <span v-text="t$('global.form[\'username.label\']')"></span>
                <span class="text-danger">*</span>
              </label>
              <b-form-input
                id="username"
                type="text"
                name="username"
                autofocus
                :placeholder="t$('global.form[\'username.placeholder\']')"
                v-model="login"
                data-cy="username"
              ></b-form-input>
            </div>
            <div class="form-group">
              <label for="password" class="label-c">
                <span v-text="t$('login.form.password')"></span>
                <span class="text-danger">*</span>
              </label>
              <b-form-input
                id="password"
                type="password"
                name="password"
                :placeholder="t$('login.form[\'password.placeholder\']')"
                v-model="password"
                data-cy="password"
              ></b-form-input>
            </div>
            <button type="submit" class="login-button" name="login" v-text="t$('login.form.button')"></button>
            <div class="signup-text label-cs">
              <span
                ><b-link
                  :to="'/account/reset/request'"
                  class="signup-link"
                  v-text="t$('login.password.forgot')"
                  data-cy="forgetYourPasswordSelector"
                ></b-link
              ></span>
            </div>
          </div>
          <div class="divider mt-3 mb-3"></div>
          <div class="signup-text label-cs">
            <p v-text="t$('login.dhaveaccount')"></p>
            <span><b-link :to="'/register'" class="signup-link" v-text="t$('login.signup')"></b-link></span>
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

<script lang="ts" src="./login-form.component.ts"></script>

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
  max-width: 450px;
  display: flex;
  flex-direction: column;
  gap: 24px;
  padding: 24px;
  margin-left: 100px;
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
