import { type ComputedRef, ref, defineComponent, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import type LoginService from '@/account/login.service';
import AdminHome from './admin/Admin-home.vue';
import DMHome from './DM/dm-home.vue';
import CommercialHome from './Commercial/commercial-home.vue';

export default defineComponent({
  compatConfig: { MODE: 3 },
  components: {
    AdminHome,
    DMHome,
    CommercialHome,
  },
  setup() {
    const loginService = inject<LoginService>('loginService');
    const authenticated = inject<ComputedRef<boolean>>('authenticated');
    const username = inject<ComputedRef<string>>('currentUsername');
    const accountService = inject<AccountService>('accountService');
    const hasAnyAuthorityValues: Ref<any> = ref({});

    const openLogin = () => {
      loginService.login();
    };

    return {
      authenticated,
      username,
      accountService,
      hasAnyAuthorityValues,
      openLogin,
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
