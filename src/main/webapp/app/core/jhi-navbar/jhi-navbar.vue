<template>
  <header id="header" class="header d-flex align-items-center fixed-top">
    <div class="header-container w-100 px-4 d-flex align-items-center justify-content-between shadow">
      <router-link to="/" class="logo d-flex align-items-center me-auto me-xl-0">
        <h1 class="pl-5">
          <strong>{{ t$('global.title') }}</strong>
        </h1>
      </router-link>

      <!-- Nav Menu -->
      <nav id="navmenu" class="navmenu pl-5 ml-5">
        <ul>
          <li>
            <router-link to="/" exact class="nav-link active">
              <span>{{ t$('global.menu.home') }}</span>
            </router-link>
          </li>

          <!-- Clients -->
          <li v-if="authenticated" class="dropdown">
            <a href="#"
              ><span>{{ t$('global.menu.entities.client') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <clients-menu class="entities-menu-scroll" />
            </ul>
          </li>

          <!-- products -->
          <li v-if="authenticated" class="dropdown">
            <a href="#"
              ><span>{{ t$('global.menu.entities.product') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <products-menu class="entities-menu-scroll" />
            </ul>
          </li>

          <!-- products Deployments -->
          <li v-if="authenticated" class="dropdown">
            <a href="#"
              ><span>{{ t$('global.menu.entities.deployements') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <deployments-menu class="entities-menu-scroll" />
            </ul>
          </li>

          <!-- Admin Menu -->
          <li v-if="authenticated && hasAnyAuthority('ROLE_ADMIN')" class="dropdown">
            <a href="#"
              ><span>{{ t$('global.menu.admin.main') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <router-link to="/admin/user-management">
                <font-awesome-icon icon="users" /> {{ t$('global.menu.admin.userManagement') }}
              </router-link>
            </ul>
          </li>

          <!-- parameters -->

          <li v-if="authenticated" class="dropdown">
            <a href="#"
              ><span>{{ t$('global.menu.entities.parameters') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <parameters-menu class="entities-menu-scroll" />
            </ul>
          </li>

          <!-- Languages -->
          <li v-if="!authenticated && languages && Object.keys(languages).length > 1" class="dropdown">
            <a href="#"
              ><span>{{ t$('global.menu.language') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul class="">
              <li v-for="(value, key) in languages" :key="`lang-${key}`" :class="{ active: isActiveLanguage(key) }">
                <a href="#" @click.prevent="changeLanguage(key)">{{ value.name }}</a>
              </li>
            </ul>
          </li>

          <!--  Account -->
          <li class="dropdown" v-if="!authenticated">
            <a href="#"
              ><span>{{ t$('global.menu.account.main') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i
            ></a>
            <ul>
              <li>
                <router-link to="/login" class="d-flex align-items-center gap-1">
                  <font-awesome-icon icon="sign-in-alt" />
                  <span>{{ t$('global.menu.account.login') }}</span>
                </router-link>
              </li>
              <li>
                <router-link to="/register" class="d-flex align-items-center gap-1">
                  <font-awesome-icon icon="user-plus" />
                  <span>{{ t$('global.menu.account.register') }}</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <router-link to="/login" class="d-flex align-items-center gap-1 btn-getstarted" v-if="!authenticated">{{
        t$('global.menu.account.login')
      }}</router-link>

      <!--      <router-link-->
      <!--        v-if="authenticated"-->
      <!--        to="/account/settings"-->
      <!--        class="pl-5"-->
      <!--        style="width: 30px; height: 30px;"-->
      <!--        title="profil"-->
      <!--      >-->
      <!--        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 496 512" class="userIcon"><path d="M248 8C111 8 0 119 0 256s111 248 248 248 248-111 248-248S385 8 248 8zm0 96c48.6 0 88 39.4 88 88s-39.4 88-88 88-88-39.4-88-88 39.4-88 88-88zm0 344c-58.7 0-111.3-26.6-146.5-68.2 18.8-35.4 55.6-59.8 98.5-59.8 2.4 0 4.8 .4 7.1 1.1 13 4.2 26.6 6.9 40.9 6.9 14.3 0 28-2.7 40.9-6.9 2.3-.7 4.7-1.1 7.1-1.1 42.9 0 79.7 24.4 98.5 59.8C359.3 421.4 306.7 448 248 448z"/></svg>-->
      <!--      </router-link>-->

      <div class="dropdown notification-dropdown" @click="toggleDropdown" v-if="authenticated">
        <a href="#" class="notification-icon">
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 448 512">
            <path
              d="M448 64c0-17.7-14.3-32-32-32L32 32C14.3 32 0 46.3 0 64S14.3 96 32 96l384 0c17.7 0 32-14.3 32-32zm0 256c0-17.7-14.3-32-32-32L32 288c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32zM0 192c0 17.7 14.3 32 32 32l384 0c17.7 0 32-14.3 32-32s-14.3-32-32-32L32 160c-17.7 0-32 14.3-32 32zM448 448c0-17.7-14.3-32-32-32L32 416c-17.7 0-32 14.3-32 32s14.3 32 32 32l384 0c17.7 0 32-14.3 32-32z"
            />
          </svg>
        </a>
        <ul v-if="dropdownOpen" class="notification-menu">
          <li v-if="authenticated">
            <router-link to="/account/settings" class="d-flex align-items-center gap-1">
              <font-awesome-icon icon="wrench" />
              <span>{{ t$('global.menu.account.settings') }}</span>
            </router-link>
          </li>
          <li v-if="authenticated">
            <router-link to="/account/password" class="d-flex align-items-center gap-1">
              <font-awesome-icon icon="lock" />
              <span>{{ t$('global.menu.account.password') }}</span>
            </router-link>
          </li>
          <li v-if="authenticated">
            <a href="#" @click.prevent="logout" class="d-flex align-items-center gap-1">
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
.userIcon {
  width: 25px;
  height: 25px;
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
