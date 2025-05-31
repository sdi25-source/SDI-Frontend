import { type ComputedRef, type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { email, maxLength, minLength, required } from '@vuelidate/validators';
import axios from 'axios';
import languages from '@/shared/config/languages';
import { EMAIL_ALREADY_USED_TYPE } from '@/constants';
import { useStore } from '@/store';

const validations = {
  settingsAccount: {
    firstName: {
      required,
      minLength: minLength(1),
      maxLength: maxLength(50),
    },
    lastName: {
      required,
      minLength: minLength(1),
      maxLength: maxLength(50),
    },
    email: {
      required,
      email,
      minLength: minLength(5),
      maxLength: maxLength(254),
    },
  },
};

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProfileSettings',
  validations,
  props: {
    isEditing: {
      type: Boolean,
      default: false,
    },
  },
  emits: ['toggle-edit', 'cancel-edit'],
  setup(props, { emit }) {
    const store = useStore();

    const success: Ref<string> = ref(null);
    const error: Ref<string> = ref(null);
    const errorEmailExists: Ref<string> = ref(null);

    const settingsAccount = computed(() => store.account);
    const originalAccount = ref(null);
    const username = inject<ComputedRef<string>>('currentUsername', () => computed(() => store.account?.login), true);

    const handleCancel = () => {
      if (originalAccount.value) {
        Object.assign(settingsAccount.value, originalAccount.value);
        originalAccount.value = null;
      }
      success.value = null;
      error.value = null;
      errorEmailExists.value = null;
      emit('cancel-edit');
    };

    // Store original data when entering edit mode
    if (props.isEditing && !originalAccount.value) {
      originalAccount.value = { ...settingsAccount.value };
    }

    return {
      success,
      error,
      errorEmailExists,
      settingsAccount,
      originalAccount,
      username,
      v$: useVuelidate(),
      languages: languages(),
      t$: useI18n().t,
      handleCancel,
    };
  },
  watch: {
    isEditing(newVal) {
      if (newVal && !this.originalAccount) {
        this.originalAccount = { ...this.settingsAccount };
      }
    },
  },
  methods: {
    saveProfile() {
      this.error = null;
      this.errorEmailExists = null;

      return axios
        .post('api/account', this.settingsAccount)
        .then(() => {
          this.error = null;
          this.success = 'OK';
          this.errorEmailExists = null;
          this.originalAccount = null;
          this.$emit('toggle-edit');
        })
        .catch(ex => {
          this.success = null;
          this.error = 'ERROR';
          if (ex.response.status === 400 && ex.response.data.type === EMAIL_ALREADY_USED_TYPE) {
            this.errorEmailExists = 'ERROR';
            this.error = null;
          }
        });
    },
    closeAlert(alertType: string): void {
      if (alertType === 'success') {
        this.success = null;
      } else if (alertType === 'error') {
        this.error = null;
      } else if (alertType === 'errorEmailExists') {
        this.errorEmailExists = null;
      }
    },
  },
});
