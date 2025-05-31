<template>
  <div class="account-layout">
    <!-- Sidebar Navigation -->
    <div class="sidebar">
      <div class="sidebar-header"></div>

      <nav class="sidebar-nav">
        <div class="nav-section">
          <div class="nav-item" :class="{ active: activeTab === 'profile' }">
            <div class="nav-content" @click="setActiveTab('profile')">
              <i class="nav-icon">👤</i>
              <span class="nav-label">Personal information</span>
            </div>
            <button v-if="activeTab === 'profile'" class="edit-btn rounded-2" @click="toggleEditMode" :class="{ editing: isEditing }">
              {{ isEditing ? 'Cancel' : 'Update' }}
            </button>
          </div>

          <div class="nav-item" :class="{ active: activeTab === 'password' }" @click="setActiveTab('password')">
            <div class="nav-content">
              <i class="nav-icon">🔒</i>
              <span class="nav-label">Password</span>
            </div>
          </div>
        </div>
      </nav>
    </div>

    <!-- Main Content Area -->
    <div class="main-content">
      <div class="content-wrapper">
        <!-- Profile Component -->
        <ProfileSettings v-if="activeTab === 'profile'" :is-editing="isEditing" @toggle-edit="toggleEditMode" @cancel-edit="cancelEdit" />

        <!-- Password Component -->
        <PasswordSettings v-if="activeTab === 'password'" />
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { defineComponent, ref } from 'vue';
import ProfileSettings from '../settings/settings.vue';
import PasswordSettings from '../change-password/change-password.vue';

export default defineComponent({
  name: 'AccountLayout',
  components: {
    ProfileSettings,
    PasswordSettings,
  },
  setup() {
    const activeTab = ref('profile');
    const isEditing = ref(false);

    const setActiveTab = (tab: string) => {
      activeTab.value = tab;
      // Reset editing state when switching tabs
      if (tab !== 'profile') {
        isEditing.value = false;
      }
    };

    const toggleEditMode = () => {
      isEditing.value = !isEditing.value;
    };

    const cancelEdit = () => {
      isEditing.value = false;
    };

    return {
      activeTab,
      isEditing,
      setActiveTab,
      toggleEditMode,
      cancelEdit,
    };
  },
});
</script>

<style scoped>
.account-layout {
  display: flex;
  min-height: 100vh;
  background-color: #ffffff;
}

.sidebar {
  width: 280px;
  background: #ffffff;
  border-right: 1px solid #e8eaed;
  min-height: 100vh;
}

.sidebar-header {
  padding: 62px 199px;
}

.sidebar-header h3 {
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #202124;
}

.sidebar-nav {
  padding: 16px 0;
}

.nav-section {
  margin-bottom: 24px;
}

.nav-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 24px;
  cursor: pointer;
  transition: all 0.2s ease;
  border-radius: 0 24px 24px 0;
  margin-right: 12px;
}

.nav-item:hover {
  background-color: #f1f3f4;
}

.nav-item.active {
  background-color: #e8f0fe;
  border-right: 3px solid #0c2d57;
}

.nav-content {
  display: flex;
  align-items: center;
  flex: 1;
}

.nav-icon {
  font-size: 20px;
  margin-right: 12px;
  width: 24px;
  text-align: center;
}

.nav-label {
  font-size: 14px;
  font-weight: 500;
  color: #3c4043;
}

.edit-btn {
  background: none;
  border: 1px solid #dadce0;
  border-radius: 2px;
  padding: 6px 12px;
  font-size: 12px;
  font-weight: 500;
  color: #0c2d57;
  cursor: pointer;
  transition: all 0.2s ease;
}

.edit-btn:hover {
  background-color: #f8f9fa;
}

.edit-btn.editing {
  background-color: #7da5dc;
  border-color: #7da5dc;
  color: #202124;
}

.main-content {
  flex: 100%;
  background-color: #ffffff;
}

.content-wrapper {
  max-width: 900px;
  margin-left: 190px;
  padding: 108px 42px;
}

@media (max-width: 768px) {
  .account-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
    position: static;
    min-height: auto;
  }

  .content-wrapper {
    padding: 24px 16px;
  }
}
</style>
