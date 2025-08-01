import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import axios from 'axios';
import { useVuelidate } from '@vuelidate/core';
import { maxLength, minLength, required, sameAs } from '@vuelidate/validators';
import type LoginService from '@/account/login.service';
import { useRouter } from 'vue-router';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ResetPasswordFinish',
  validations() {
    return {
      resetAccount: {
        newPassword: {
          required,
          minLength: minLength(4),
          maxLength: maxLength(254),
        },
        confirmPassword: {
          sameAsPassword: sameAs(this.resetAccount.newPassword),
        },
      },
    };
  },
  created(): void {
    if (this.$route?.query?.key !== undefined) {
      this.key = this.$route.query.key;
    }
    this.keyMissing = !this.key;
  },
  setup() {
    const loginService = inject<LoginService>('loginService');

    const router = useRouter();
    const doNotMatch: Ref<string> = ref(null);
    const success: Ref<string> = ref(null);
    const error: Ref<string> = ref(null);
    const keyMissing: Ref<boolean> = ref(false);
    const key: Ref<any> = ref(null);
    const resetAccount: Ref<any> = ref({
      newPassword: null,
      confirmPassword: null,
    });
    const isLoading: Ref<boolean> = ref(false); // Ajout de la variable isLoading

    const openLogin = () => {
      router.push('/login');
    };

    return {
      openLogin,
      doNotMatch,
      success,
      error,
      keyMissing,
      key,
      resetAccount,
      isLoading,
      v$: useVuelidate(),
      t$: useI18n().t,
    };
  },
  methods: {
    finishReset() {
      this.isLoading = true; // Activer le spinner
      this.doNotMatch = null;
      this.success = null;
      this.error = null;
      if (this.resetAccount.newPassword !== this.resetAccount.confirmPassword) {
        this.doNotMatch = 'ERROR';
        this.isLoading = false;
      } else {
        return axios
          .post('api/account/reset-password/finish', { key: this.key, newPassword: this.resetAccount.newPassword })
          .then(() => {
            this.success = 'OK';
            this.isLoading = false;
          })
          .catch(() => {
            this.success = null;
            this.error = 'ERROR';
            this.isLoading = false;
          });
      }
    },
  },
});
