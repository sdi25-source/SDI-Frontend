import { type ComputedRef, defineComponent, inject, computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type LoginService from '@/account/login.service';
import { useStore } from '@/store.ts';

export default defineComponent({
  name: 'AdminHome',
  compatConfig: { MODE: 3 },
  setup() {
    const loginService = inject<LoginService>('loginService');
    const authenticated = inject<ComputedRef<boolean>>('authenticated');
    const username = inject<ComputedRef<string>>('currentUsername');

    const totalUsers = ref(152);

    const openLogin = () => {
      loginService.openLogin();
    };

    const accountStore = useStore();
    const user = accountStore.account;
    console.log('User Connected', user);

    return {
      authenticated,
      username,
      totalUsers,
      user,
      openLogin,
      t$: useI18n().t,
    };
  },
});
