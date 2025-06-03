import { type ComputedRef, ref, defineComponent, inject, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type LoginService from '@/account/login.service';
import type AccountService from '@/account/account.service.ts';
import { useStore } from '@/store.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  setup() {
    const loginService = inject<LoginService>('loginService');
    const authenticated = inject<ComputedRef<boolean>>('authenticated');
    const username = inject<ComputedRef<string>>('currentUsername');
    const accountService = inject<AccountService>('accountService');
    const hasAnyAuthorityValues: Ref<any> = ref({});

    const openLogin = () => {
      loginService.login();
    };

    const accountStore = useStore();
    const user = accountStore.account;
    console.log('User Connected', user);
    return {
      authenticated,
      username,
      accountService,
      hasAnyAuthorityValues,
      user,
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
