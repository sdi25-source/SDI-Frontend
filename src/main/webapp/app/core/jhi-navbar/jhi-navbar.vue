<template>
  <header id="header" class="header d-flex align-items-center fixed-top">
    <div class="header-container w-100 px-4 d-flex align-items-center justify-content-between shadow">
      <router-link to="/" class="logo d-flex align-items-center me-auto me-xl-0">
        <!--        <img src="../../../content/images/SDILogo.png" alt="Logo" class="logo-img" />-->
        <h1>
          <strong>{{ t$('global.title') }}</strong>
        </h1>
      </router-link>

      <!-- Nav Menu -->
      <nav id="navmenu" class="navmenu pl-5 ml-5">
        <ul>
          <!-- Clients -->
          <li v-if="authenticated" class="dropdown" :class="{ active: activeMenu === 'customer' }">
            <a href="#" class="no-link-style"
              ><span>{{ t$('global.menu.entities.client') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <customers-menu class="entities-menu-scroll" @menu-item-clicked="setActiveMenu('customer')" />
            </ul>
          </li>

          <!-- products -->
          <li v-if="authenticated" class="dropdown" :class="{ active: activeMenu === 'product' }">
            <a href="#" class="no-link-style"
              ><span>{{ t$('global.menu.entities.product') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <products-menu class="entities-menu-scroll" @menu-item-clicked="setActiveMenu('product')" />
            </ul>
          </li>

          <!-- products Deployments -->
          <li v-if="authenticated" class="dropdown" :class="{ active: activeMenu === 'deployments' }">
            <a href="#" class="no-link-style"
              ><span>{{ t$('global.menu.entities.deployements') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <deployments-menu class="entities-menu-scroll" @menu-item-clicked="setActiveMenu('deployments')" />
            </ul>
          </li>

          <!-- parameters -->
          <li v-if="authenticated" class="dropdown" :class="{ active: activeMenu === 'parameters' }">
            <a href="#" class="no-link-style"
              ><span>{{ t$('global.menu.entities.parameters') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <parameters-menu class="entities-menu-scroll" @menu-item-clicked="setActiveMenu('parameters')" />
            </ul>
          </li>

          <!-- Admin Menu -->
          <li v-if="authenticated && hasAnyAuthority('ROLE_ADMIN')" class="dropdown" :class="{ active: activeMenu === 'administration' }">
            <a href="#" class="no-link-style"
              ><span>{{ t$('global.menu.admin.main') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <administration-menu @menu-item-clicked="setActiveMenu('administration')" />
            </ul>
          </li>

          <li>
            <router-link to="/" exact class="nav-link active" v-if="!authenticated" :class="{ active: activeMenu === 'home' }">
              <span>{{ t$('global.menu.home') }}</span>
            </router-link>
          </li>

          <!-- Languages -->
          <!--          <li-->
          <!--            v-if="!authenticated && languages && Object.keys(languages).length > 1"-->
          <!--            class="dropdown""-->
          <!--            :class="{ active: activeMenu === 'language' }"-->
          <!--          >-->
          <!--            <a href="#" class="no-link-style"-->
          <!--              ><span>{{ t$('global.menu.language') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i-->
          <!--            ></a>-->
          <!--            <ul class="">-->
          <!--              <li v-for="(value, key) in languages" :key="`lang-${key}`" :class="{ active: isActiveLanguage(key) }">-->
          <!--                <a-->
          <!--                  href="#"-->
          <!--                  @click.prevent="-->
          <!--                    changeLanguage(key);-->
          <!--                    setActiveMenu('language');-->
          <!--                  "-->
          <!--                  >{{ value.name }}</a-->
          <!--                >-->
          <!--              </li>-->
          <!--            </ul>-->
          <!--          </li>-->

          <!--  Account -->
          <li class="dropdown" v-if="!authenticated" :class="{ active: activeMenu === 'account' }">
            <a href="#" class="no-link-style"
              ><span>{{ t$('global.menu.account.main') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <li>
                <router-link to="/login" class="d-flex align-items-center gap-1 no-link-style" @click="setActiveMenu('account')">
                  <font-awesome-icon icon="sign-in-alt" />
                  <span>{{ t$('global.menu.account.login') }}</span>
                </router-link>
              </li>
              <li>
                <router-link to="/register" class="d-flex align-items-center gap-1 no-link-style" @click="setActiveMenu('account')">
                  <font-awesome-icon icon="user-plus" />
                  <span>{{ t$('global.menu.account.register') }}</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <router-link to="/login" class="d-flex align-items-center gap-1 btn-getstarted" v-if="!authenticated">
        {{ t$('global.menu.account.login') }}
      </router-link>

      <div class="dropdown notification-dropdown" @click="toggleDropdown" v-if="authenticated">
        <a href="#" class="notification-icon no-link-style">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path
              d="M448 64c0-17.7-14.3-32-32-32L32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32zm0 256c0-17.7-14.3-32-32-32L32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32zM0 192c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160c-17.7 0-32 14.3-32 32zM448 448c0-17.7-14.3-32-32-32L32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32z"
            />
          </svg>
        </a>
        <ul v-if="dropdownOpen" class="notification-menu">
          <li v-if="authenticated">
            <router-link to="/account/settings" class="d-flex align-items-center gap-1 no-link-style">
              <font-awesome-icon icon="wrench" />
              <span>{{ t$('global.menu.account.settings') }}</span>
            </router-link>
          </li>
          <li v-if="authenticated">
            <router-link to="/account/password" class="d-flex align-items-center gap-1 no-link-style">
              <font-awesome-icon icon="lock" />
              <span>{{ t$('global.menu.account.password') }}</span>
            </router-link>
          </li>
          <li v-if="authenticated">
            <a href="#" @click.prevent="logout" class="d-flex align-items-center gap-1 no-link-style">
              <font-awesome-icon icon="sign-out-alt" />
              <span>{{ t$('global.menu.account.logout') }}</span>
            </a>
          </li>
        </ul>
      </div>
    </div>
  </header>
</template>

<script lang="ts" src="./jhi-navbar.component.ts"></script>

<style scoped>
.no-link-style {
  text-decoration: none; /* Supprime la ligne en dessous */
  color: inherit; /* Garde la couleur du texte comme le parent */
  outline: none;
}
.no-link-style:hover,
.no-link-style:focus,
.no-link-style:active {
  text-decoration: none;
  color: inherit;
}

/* Ajout du style pour le logo */
.logo-img {
  height: 180px; /* Logo plus grand pour correspondre à la hauteur du titre */
  width: 60px;
  margin-right: -10px; /* Espace plus petit entre le logo et le titre */
  display: inline-block;
  vertical-align: middle;
}

.logo {
  display: flex;
  align-items: center;
  gap: 0;
}

.logo h1 {
  margin-bottom: 0; /* Supprime la marge en bas du titre */
  margin-left: 0; /* Supprime la marge à gauche du titre */
  padding-left: 0; /* Supprime le padding à gauche du titre */
  line-height: 1; /* Ajuste la hauteur de ligne */
  display: inline-flex;
  align-items: center;
}

.dropdown.active > a {
  color: #0d83fd !important;
  font-weight: 600;
}

.notification-icon svg {
  width: 20px;
  height: 20px;
}

/* Notifications Dropdown */
.notification-dropdown {
  position: relative;
  cursor: pointer;
}

.notification-icon {
  position: relative;
  font-size: 19px;
  color: #333;
  text-decoration: none;
}

.notification-menu {
  position: absolute;
  top: 35px;
  right: 0;
  width: 250px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 10px 0;
  border-radius: 8px;
  z-index: 999;
}

.notification-menu li {
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
}

.notification-menu li:last-child {
  border-bottom: none;
}

/* Header container styles */
.header-container {
  width: 90%;
  max-width: 1200px;
  margin: 0 auto;
  padding: 0 10px;
}

/* Menu de navigation */
#navmenu {
  padding-left: 5px;
  padding-right: 5px;
}

/* Style pour la liste des entités avec défilement interne */
.entities-menu-scroll {
  max-height: 300px;
  overflow-y: auto;
  overflow-x: hidden;
  display: block;
  padding-right: 5px;
}

/* Style pour la barre de défilement */
.entities-menu-scroll::-webkit-scrollbar {
  width: 5px;
}

.entities-menu-scroll::-webkit-scrollbar-track {
  background: #f1f1f1;
  border-radius: 5px;
}

.entities-menu-scroll::-webkit-scrollbar-thumb {
  background: #888;
  border-radius: 5px;
}

.entities-menu-scroll::-webkit-scrollbar-thumb:hover {
  background: #555;
}

/* Media Queries pour des tailles d'écran spécifiques */
@media (max-width: 1200px) {
  .header-container {
    max-width: 95%;
    padding: 0 15px;
  }

  .entities-menu-scroll {
    max-height: 280px;
  }
}

@media (max-width: 768px) {
  .header-container {
    max-width: 90%;
    padding: 0 20px;
  }

  #navmenu {
    padding-left: 0;
    padding-right: 0;
  }

  .entities-menu-scroll {
    max-height: 250px;
  }
}

@media (max-width: 576px) {
  .header-container {
    max-width: 100%;
    padding: 0 10px;
  }

  .entities-menu-scroll {
    max-height: 200px;
  }
}
</style>
