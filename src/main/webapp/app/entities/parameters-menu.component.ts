import { computed, defineComponent, inject, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import type AccountService from '@/account/account.service.ts';
import { useStore } from '@/store.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ParametersMenu',
  setup() {
    const i18n = useI18n();
    const store = useStore();
    const accountService = inject<AccountService>('accountService');
    const hasAnyAuthorityValues: Ref<any> = ref({});
    const authenticated = computed(() => store.authenticated);

    return {
      t$: i18n.t,
      authenticated,
      accountService,
      hasAnyAuthorityValues,
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
