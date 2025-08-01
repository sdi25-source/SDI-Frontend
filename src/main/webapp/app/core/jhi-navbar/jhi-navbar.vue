<template>
  <header id="header" class="header d-flex align-items-center fixed-top">
    <div class="header-container w-100 px-4 d-flex align-items-center justify-content-between shadow">
      <router-link to="/" class="logo d-flex align-items-center me-auto me-xl-0">
        <h1>
          <strong>{{ t$('global.title') }}</strong>
        </h1>
      </router-link>

      <!-- Nav Menu -->
      <nav id="navmenu" class="navmenu pl-5 ml-5">
        <ul>
          <!-- Dashboards -->
          <li v-if="authenticated" class="dropdown" :class="{ active: activeMenu === 'dash' }">
            <a href="#" class="no-link-style"><span>{{ t$('global.menu.entities.dashboards') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i></a>
            <ul>
              <div class="entities-menu-container">
                <div class="entities-category">
                  <b-dropdown-item to="dashClients">
                    <span>{{ t$('global.menu.entities.customerDash') }}</span>
                  </b-dropdown-item>
                </div>
                <div class="entities-category">
                  <b-dropdown-item to="dashProducts">
                    <span>{{ t$('global.menu.entities.productDash') }}</span>
                  </b-dropdown-item>
                </div>
              </div>
            </ul>
          </li>

          <!-- Clients -->
          <li v-if="authenticated" class="dropdown" :class="{ active: activeMenu === 'customer' }">
            <a href="#" class="no-link-style">
              <span>{{ t$('global.menu.entities.client') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i>
            </a>
            <ul>
              <customers-menu class="entities-menu-scroll" @menu-item-clicked="setActiveMenu('customer')" />
            </ul>
          </li>

          <!-- Products -->
          <li v-if="authenticated" class="dropdown" :class="{ active: activeMenu === 'product' }">
            <a href="#" class="no-link-style">
              <span>{{ t$('global.menu.entities.product') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i>
            </a>
            <ul>
              <products-menu class="entities-menu-scroll" @menu-item-clicked="setActiveMenu('product')" />
            </ul>
          </li>

          <!-- Product Deployments -->
          <li v-if="authenticated" class="dropdown" :class="{ active: activeMenu === 'deployments' }">
            <a href="#" class="no-link-style">
              <span>{{ t$('global.menu.entities.deployements') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i>
            </a>
            <ul>
              <deployments-menu class="entities-menu-scroll" @menu-item-clicked="setActiveMenu('deployments')" />
            </ul>
          </li>

          <!-- Parameters -->
          <li v-if="authenticated && hasAnyAuthority('ROLE_ADMIN')" class="dropdown" :class="{ active: activeMenu === 'parameters' }">
            <a href="#" class="no-link-style">
              <span>{{ t$('global.menu.entities.parameters') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i>
            </a>
            <ul>
              <parameters-menu class="entities-menu-scroll" @menu-item-clicked="setActiveMenu('parameters')" />
            </ul>
          </li>

          <!-- Admin Menu -->
          <li v-if="authenticated && hasAnyAuthority('ROLE_ADMIN')" class="dropdown" :class="{ active: activeMenu === 'administration' }">
            <a href="#" class="no-link-style">
              <span>{{ t$('global.menu.admin.main') }}</span> <i class="bi bi-chevron-down toggle-dropdown"></i>
            </a>
            <ul>
              <administration-menu @menu-item-clicked="setActiveMenu('administration')" />
            </ul>
          </li>

          <li class="dropdown" v-if="authenticated">
            <a href="#" class="no-link-style">
              <font-awesome-icon icon="flag" />
             <i class="bi bi-chevron-down toggle-dropdown pl-1"></i>
            </a>
            <ul>
              <li
                v-for="(value, key) in languages"
                :key="`lang-${key}`"
                @click="changeLanguage(key)"
                :class="{ active: isActiveLanguage(key) }"
              >
                <router-link to="" class="d-flex align-items-center gap-1 no-link-style">
                  <span>{{value.flag}} {{" "}}{{ value.name }}</span>
                </router-link>
              </li>
            </ul>
          </li>


          <!-- Home (Unauthenticated) -->
          <li>
            <router-link to="/" exact class="nav-link active" v-if="!authenticated" :class="{ active: activeMenu === 'home' }">
              <span>{{ t$('global.menu.home') }}</span>
            </router-link>
          </li>

          <!-- Account (Unauthenticated) -->
          <li class="dropdown" v-if="!authenticated" :class="{ active: activeMenu === 'account' }">
            <a href="#" class="no-link-style">
              <span>{{ t$('global.menu.account.main') }}</span> <i class="bi bi-chevron-down toggle-dropdown pl-1"></i>
            </a>
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
          <li class="dropdown" v-if="!authenticated">
            <a href="#" class="no-link-style">
              <span>{{ t$('global.menu.language') }}</span> <i class="bi bi-chevron-down toggle-dropdown pl-1"></i>
            </a>
            <ul>
              <li
                v-for="(value, key) in languages"
                :key="`lang-${key}`"
                @click="changeLanguage(key)"
                :class="{ active: isActiveLanguage(key) }"
              >
                <router-link to="" class="d-flex align-items-center gap-1 no-link-style">
                  <span>{{value.flag}} {{" "}}{{ value.name }}</span>
                </router-link>
              </li>
            </ul>
          </li>
        </ul>
      </nav>

      <!-- Login Button (Unauthenticated) -->
      <router-link to="/login" class="d-flex align-items-center gap-1 btn-getstarted" v-if="!authenticated">
        {{ t$('global.menu.account.login') }}
      </router-link>

      <!-- Authenticated Nav with Profile Badges and Dropdown -->
      <nav id="navmenu" class="navmenu pl-5 ml-5" v-if="authenticated">
        <ul>
          <li class="role-badges">
            <div class="role-avatars">
              <span v-if="hasAnyAuthority('ROLE_ADMIN')" class="role-badge role-admin">
                A
                <span class="role-tooltip">Admin</span>
              </span>
              <span v-if="hasAnyAuthority('ROLE_USER')" class="role-badge role-delivery">
                D
                <span class="role-tooltip">Delivery Manager</span>
              </span>
              <span v-if="hasAnyAuthority('ROLE_COMMERCIAL')" class="role-badge role-commercial">
                C
                <span class="role-tooltip">Commercial</span>
              </span>
            </div>
          </li>
          <li class="dropdown">
            <a href="#" class="no-link-style">
              <i class="bi bi-list toggle-dropdown"></i>
            </a>
            <ul class="dropdown-menu">
              <li v-if="authenticated">
                <router-link to="/account/profile" class="d-flex align-items-center gap-1 no-link-style">
                  <i class="nav-icon">👤</i>
                  <span>{{ t$('global.menu.account.profile') }}</span>
                </router-link>
              </li>
              <li v-if="authenticated">
                <a href="#" @click.prevent="logout" class="d-flex align-items-center gap-1 no-link-style">
                  <font-awesome-icon icon="sign-out-alt" />
                  <span>{{ t$('global.menu.account.logout') }}</span>
                </a>
              </li>
            </ul>
          </li>
        </ul>
      </nav>
    </div>
  </header>
</template>

<script lang="ts" src="./jhi-navbar.component.ts"></script>

<style scoped>
.nav-icon {
  font-size: 20px;
  margin-right: 1px;
  width: 24px;
  text-align: center;
}

/* General styles for links */
.entities-category .dropdown-item {
  padding: 6px 10px;
  font-size: 0.9rem;
}

.no-link-style {
  text-decoration: none;
  color: inherit;
  outline: none;
}

.no-link-style:hover,
.no-link-style:focus,
.no-link-style:active {
  text-decoration: none;
  color: inherit;
}

/* Navigation menu container */
.navmenu {
  padding-left: 5px;
  padding-right: 5px;
}

/* Dropdown container */
.dropdown {
  position: relative;
  display: inline-block;
}

/* Toggle icon (bi-list) */
.toggle-dropdown {
  font-size: 1.2rem;
  margin-left: 0.1px;
  cursor: pointer;
  transition: transform 0.2s ease;
}

.dropdown:hover .toggle-dropdown {
  transform: rotate(90deg);
}

/* Dropdown menu */
.dropdown-menu {
  position: absolute;
  top: 100%;
  right: 0;
  width: 250px;
  background: white;
  border: 1px solid #ddd;
  box-shadow: 0px 2px 8px rgba(0, 0, 0, 0.1);
  list-style: none;
  padding: 10px 0;
  border-radius: 8px;
  z-index: 999;
  opacity: 0;
  visibility: hidden;
  transform: translateY(-10px);
  transition:
    opacity 0.2s ease,
    visibility 0.2s ease,
    transform 0.2s ease;
}

/* Show dropdown on hover */
.dropdown:hover .dropdown-menu {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

/* Dropdown menu items */
.dropdown-menu li {
  padding: 10px 15px;
  border-bottom: 1px solid #f0f0f0;
  transition: background-color 0.2s ease;
}

.dropdown-menu li:hover {
  background-color: #f8fafc;
}

.dropdown-menu li:last-child {
  border-bottom: none;
}

.dropdown-menu a {
  color: #333;
  text-decoration: none;
  display: flex;
  align-items: center;
  gap: 8px;
}

.dropdown-menu a:hover {
  color: #0d83fd;
}

/* Role badges styling */
.role-avatars {
  display: flex;
  align-items: center;
  margin-right: 10px;
}

.role-badge {
  width: 30px;
  height: 30px;
  border-radius: 50%;
  color: white;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 14px;
  font-weight: bold;
  border: 2px solid white;
  margin-left: -10px; /* Overlap effect */
  position: relative; /* For tooltip positioning */
  cursor: pointer; /* Indicate hoverability */
}

.role-badge:first-child {
  margin-left: 0; /* No overlap for the first badge */
}

/* Specific colors for each role */
.role-admin {
  background-color: #07459c; /* Bright blue for Admin */
}

.role-delivery {
  background-color: #4154f1; /* Dodger blue for Delivery Manager */
}

.role-commercial {
  background-color: #0378fb; /* Steel blue for Commercial */
}

.role-user {
  background-color: #87ceeb; /* Sky blue for User */
}

/* Tooltip styling */
.role-tooltip {
  position: absolute;
  top: -30px; /* Position above the badge */
  left: 50%;
  transform: translateX(-50%) translateY(10px); /* Center horizontally, offset vertically */
  background-color: #333;
  color: white;
  padding: 5px 10px;
  border-radius: 4px;
  font-size: 12px;
  white-space: nowrap;
  opacity: 0;
  visibility: hidden;
  transition:
    opacity 0.2s ease,
    transform 0.2s ease;
  z-index: 1000;
}

.role-badge:hover .role-tooltip {
  opacity: 1;
  visibility: visible;
  transform: translateX(-50%) translateY(0); /* Slide up into position */
}

/* Responsive adjustments */
@media (max-width: 768px) {
  .dropdown-menu {
    right: auto;
    left: 0;
  }

  .role-avatars {
    margin-right: 5px;
  }

  .role-badge {
    width: 25px;
    height: 25px;
    font-size: 12px;
    margin-left: -8px;
  }

  .role-tooltip {
    top: -25px; /* Adjust for smaller badges */
    font-size: 11px;
    padding: 4px 8px;
  }
}

/* Ensure visibility near right edge of viewport */
@media (min-width: 769px) {
  .dropdown-menu {
    right: 0;
    left: auto;
  }

  .dropdown:last-child .dropdown-menu {
    right: auto;
    left: 0;
  }
}

/* Additional styles from your full code to ensure consistency */
.header-container {
  width: 90%;
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 10px;
}

/* Style for the entities menu scroll (for other dropdowns) */
.entities-menu-scroll {
  max-height: 700px;
  overflow-y: auto;
  overflow-x: hidden;
  display: block;
  padding-right: 5px;
}

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

/* Media queries for responsive header container */
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

  .navmenu {
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
.version-tag {
  font-size: 0.9em;
  color: #666;
  padding: 2px 6px;
  border-radius: 4px;
}
</style>
