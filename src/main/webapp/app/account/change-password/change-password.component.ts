import { type ComputedRef, type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { maxLength, minLength, required, sameAs } from '@vuelidate/validators';
import axios from 'axios';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'PasswordSettings',
  validations() {
    return {
      resetPassword: {
        currentPassword: {
          required,
        },
        newPassword: {
          required,
          minLength: minLength(4),
          maxLength: maxLength(254),
        },
        confirmPassword: {
          sameAsPassword: sameAs(this.resetPassword.newPassword),
        },
      },
    };
  },
  setup() {
    const username = inject<ComputedRef<string>>('currentUsername');
    const success: Ref<string> = ref(null);
    const error: Ref<string> = ref(null);
    const doNotMatch: Ref<string> = ref(null);
    const resetPassword: Ref<any> = ref({
      currentPassword: null,
      newPassword: null,
      confirmPassword: null,
    });

    return {
      username,
      success,
      error,
      doNotMatch,
      resetPassword,
      v$: useVuelidate(),
      t$: useI18n().t,
    };
  },
  methods: {
    changePassword(): void {
      if (this.resetPassword.newPassword !== this.resetPassword.confirmPassword) {
        this.error = null;
        this.success = null;
        this.doNotMatch = 'ERROR';
      } else {
        this.doNotMatch = null;
        axios
          .post('api/account/change-password', {
            currentPassword: this.resetPassword.currentPassword,
            newPassword: this.resetPassword.newPassword,
          })
          .then(() => {
            this.success = 'OK';
            this.error = null;
            this.resetPassword = {
              currentPassword: null,
              newPassword: null,
              confirmPassword: null,
            };
          })
          .catch(() => {
            this.success = null;
            this.error = 'ERROR';
          });
      }
    },
    closeAlert(alertType: string): void {
      if (alertType === 'success') {
        this.success = null;
      } else if (alertType === 'error') {
        this.error = null;
      } else if (alertType === 'doNotMatch') {
        this.doNotMatch = null;
      }
    },
  },
});
