<template>
  <div class="activate-page">
    <div class="activate-container border-5 shadow-lg p-5">
      <div class="content">
        <div class="header">
          <h1 class="welcome-title" v-text="t$('activate.title')"></h1>
        </div>
        <div class="alert alert-success" v-if="success">
          <div class="success-content">
            <font-awesome-icon icon="check-circle" class="success-icon" />
            <p>
              <span v-html="t$('activate.messages.success')"></span>
              <a class="alert-link" @click="openLogin" v-text="t$('global.messages.info.authenticated.link')"></a>.
            </p>
          </div>
        </div>
        <div class="alert alert-danger" v-if="error">
          <p v-html="t$('activate.messages.error')"></p>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts" src="./activate.component.ts"></script>

<style scoped>
* {
  box-sizing: border-box;
  margin: 0;
  padding: 0;
}

/* Layout principal */
.activate-page {
  display: flex;
  justify-content: center;
  align-items: center;
  min-height: 80vh;
  background-color: #ffffff;
  color: #333333;
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, Cantarell, 'Open Sans', 'Helvetica Neue', sans-serif;
  padding: 10px;
}

/* Conteneur principal */
.activate-container {
  width: 100%;
  max-width: 500px;
  padding: 40px;
  border-radius: 12px;
  box-shadow:
    0 4px 6px -1px rgba(0, 0, 0, 0.1),
    0 2px 4px -1px rgba(0, 0, 0, 0.06);
  background-color: #ffffff;
}

/* Contenu */
.content {
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

/* Responsive design */
@media (max-width: 768px) {
  .activate-container {
    padding: 24px;
    margin: 20px;
  }

  .welcome-title {
    font-size: 1.5rem;
  }
}

@media (max-width: 480px) {
  .activate-container {
    padding: 20px;
    margin: 10px;
  }
}
</style>
