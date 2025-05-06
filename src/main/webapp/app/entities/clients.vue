<template>
  <div class="entities-menu-container">
    <div class="entities-category">
      <h6 class="entities-category-title" v-text="t$('global.menu.entities.client')"></h6>
      <b-dropdown-item to="/client">
        <span v-text="t$('global.menu.entities.client')"></span>
      </b-dropdown-item>
    </div>
    <div class="entities-category">
      <h6 class="entities-category-title" v-text="t$('global.menu.entities.customisation')"></h6>
      <b-dropdown-item to="/request-of-change">
        <span v-text="t$('global.menu.entities.customisation')"></span>
      </b-dropdown-item>
    </div>

    <!--      <b-dropdown-item to="/client-certification">-->
    <!--        <span v-text="t$('global.menu.entities.clientCertification')"></span>-->
    <!--      </b-dropdown-item>-->
    <!--    <div class="entities-category">-->
    <!--      <h6 class="entities-category-title" v-text="t$('global.menu.entities.alert')"></h6>-->
    <!--      <b-dropdown-item to="/client-event">-->
    <!--        <span v-text="t$('global.menu.entities.clientEvent')"></span>-->
    <!--      </b-dropdown-item>-->
    <!--    </div>-->
  </div>
</template>

<script lang="ts" src="./clients-menu.component.ts"></script>

<style scoped>
.entities-menu-container {
  max-height: 400px;
  overflow-y: auto;
  overflow-x: hidden;
  padding: 0 5px;
}

/* Style pour la barre de défilement */
.entities-menu-container::-webkit-scrollbar {
  width: 5px;
}

.entities-menu-container::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.entities-menu-container::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.entities-menu-container::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Style pour les catégories */
.entities-category {
  margin-bottom: 10px;
  padding-bottom: 5px;
  border-bottom: 1px solid #eee;
}

.entities-category:last-child {
  border-bottom: none;
}

.entities-category-title {
  padding: 5px 10px;
  margin: 0;
  font-weight: 600;
  color: #495057;
  font-size: 0.85rem;
  background-color: #f8f9fa;
  border-radius: 4px;
}

/* Ajustements pour les éléments du menu */
.entities-category .dropdown-item {
  padding: 6px 10px;
  font-size: 0.9rem;
}

/* Media queries pour différentes tailles d'écran */
@media (max-width: 768px) {
  .entities-menu-container {
    max-height: 350px;
  }
}

@media (max-width: 576px) {
  .entities-menu-container {
    max-height: 300px;
  }
}
</style>
