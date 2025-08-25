import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import axios from 'axios'; // Import axios
import type LoginService from '@/account/login.service';
import type AccountService from '@/account/account.service';
import languages from '@/shared/config/languages';
import EntitiesMenu from '@/entities/entities-menu.vue';

import { useStore } from '@/store';
import CustomersMenu from '@/entities/customers.vue';
import ProductsMenu from '@/entities/products.vue';
import DeploymentsMenu from '@/entities/deployments.vue';
import ParametersMenu from '@/entities/parameters.vue';
import AdministrationMenu from '@/entities/administration.vue';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'JhiNavbar',
  components: {
    'entities-menu': EntitiesMenu,
    'customers-menu': CustomersMenu,
    'products-menu': ProductsMenu,
    'deployments-menu': DeploymentsMenu,
    'parameters-menu': ParametersMenu,
    'administration-menu': AdministrationMenu,
  },
  setup() {
    const loginService = inject<LoginService>('loginService');
    const accountService = inject<AccountService>('accountService');
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);
    const changeLanguage = inject<(string) => Promise<void>>('changeLanguage');

    const isActiveLanguage = (key: string) => {
      return key === currentLanguage.value;
    };

    const activeMenu = ref('');

    const setActiveMenu = menu => {
      activeMenu.value = menu;
    };
    const router = useRouter();
    const store = useStore();

    const version = `v${APP_VERSION}`;
    const versionTag = ref('...'); // Valeur initiale pendant chargement

    // Charger dynamiquement le tag version via API
    axios
      .get('/api/version')
      .then(response => {
        versionTag.value = response.data;
      })
      .catch(() => {
        versionTag.value = 'inconnue';
      });

    const hasAnyAuthorityValues: Ref<any> = ref({});

    const openAPIEnabled = computed(() => store.activeProfiles.indexOf('api-docs') > -1);
    const inProduction = computed(() => store.activeProfiles.indexOf('prod') > -1);
    const authenticated = computed(() => store.authenticated);

    const openLogin = () => {
      loginService.openLogin();
    };

    const subIsActive = (input: string | string[]) => {
      const paths = Array.isArray(input) ? input : [input];
      return paths.some(path => {
        return router.currentRoute.value.path.indexOf(path) === 0; // current path starts with this path string
      });
    };

    const logout = async () => {
      localStorage.removeItem('jhi-authenticationToken');
      sessionStorage.removeItem('jhi-authenticationToken');
      store.logout();
      if (router.currentRoute.value.path !== '/') {
        router.push('/');
      }
    };

    const notifications = [{ message: 'Nouvelle mise à jour disponible' }, { message: 'Votre mot de passe expirera bientôt' }];
    const dropdownOpen = ref(false);
    const toggleDropdown = () => {
      dropdownOpen.value = !dropdownOpen.value;
    };
    const isHovered = ref(false);
    return {
      logout,
      subIsActive,
      accountService,
      openLogin,
      changeLanguage,
      languages: languages(),
      isActiveLanguage,
      version,
      versionTag, // <-- expose versionTag
      currentLanguage,
      hasAnyAuthorityValues,
      openAPIEnabled,
      inProduction,
      authenticated,
      notifications,
      dropdownOpen,
      activeMenu,
      setActiveMenu,
      toggleDropdown,
      isHovered,
      t$: useI18n().t,
    };
  },
  methods: {
    hasAnyAuthority(authorities: any): boolean {
      this.accountService.hasAnyAuthorityAndCheckAuth(authorities).then(value => {
        if (this.hasAnyAuthorityValues[authorities] !== value) {
          this.hasAnyAuthorityValues = { ...this.hasAnyAuthorityValues, [authorities]: value };
        }
      });
      return this.hasAnyAuthorityValues[authorities] ?? false;
    },
  },
});
