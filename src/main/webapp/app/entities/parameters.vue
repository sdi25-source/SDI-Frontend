<template>
  <div class="entities-menu-container">
    <div class="entities-category">
      <h6 class="entities-category-title" v-text="t$('global.menu.entities.client')"></h6>
      <b-dropdown-item to="/client-size" @click="emitMenuItemClicked">
        <span v-text="t$('global.menu.entities.clientSize')"></span>
      </b-dropdown-item>
      <b-dropdown-item to="/client-type" @click="emitMenuItemClicked">
        <span v-text="t$('global.menu.entities.clientType')"></span>
      </b-dropdown-item>
      <b-dropdown-item to="/client-event-type" @click="emitMenuItemClicked">
        <span v-text="t$('global.menu.entities.clientEventType')"></span>
      </b-dropdown-item>
      <b-dropdown-item to="/certification" @click="emitMenuItemClicked">
        <span v-text="t$('global.menu.entities.certification')"></span>
      </b-dropdown-item>
    </div>

    <h6 class="entities-category-title" v-text="t$('global.menu.entities.product')"></h6>
    <b-dropdown-item to="/product-line" @click="emitMenuItemClicked">
      <span v-text="t$('global.menu.entities.productLine')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/domaine" @click="emitMenuItemClicked">
      <span v-text="t$('global.menu.entities.domaine')"></span>
    </b-dropdown-item>

    <h6 class="entities-category-title" v-text="t$('global.menu.entities.deployements')"></h6>
    <b-dropdown-item to="/deployement-type" @click="emitMenuItemClicked">
      <span v-text="t$('global.menu.entities.deployementType')"></span>
    </b-dropdown-item>

    <h6 class="entities-category-title" v-text="t$('global.menu.entities.Components')"></h6>
    <b-dropdown-item to="/component-type" @click="emitMenuItemClicked">
      <span v-text="t$('global.menu.entities.componentType')"></span>
    </b-dropdown-item>
    <b-dropdown-item to="/infra-component" @click="emitMenuItemClicked">
      <span v-text="t$('global.menu.entities.Components')"></span>
    </b-dropdown-item>

    <!--              <b-dropdown-item to="/region">-->
    <!--                <span v-text="t$('global.menu.entities.region')"></span>-->
    <!--              </b-dropdown-item>-->
    <!--              <b-dropdown-item to="/country">-->
    <!--                <span v-text="t$('global.menu.entities.country')"></span>-->
    <!--              </b-dropdown-item>-->
    <!--      <b-dropdown-item to="/customisation-level">-->
    <!--        <span v-text="t$('global.menu.entities.customisationLevel')"></span>-->
    <!--      </b-dropdown-item>-->
    <!--      <b-dropdown-item to="/ha">-->
    <!--        <span v-text="t$('global.menu.entities.ha')"></span>-->
    <!--      </b-dropdown-item>-->
  </div>
</template>

<script lang="ts" src="./parameters-menu.component.ts"></script>

<style scoped>
.entities-menu-container {
  width: 200px;
  max-height: 700px;
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
