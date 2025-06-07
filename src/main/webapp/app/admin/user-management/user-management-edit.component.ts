import { type Ref, defineComponent, inject, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useVuelidate } from '@vuelidate/core';
import { email, maxLength, minLength, required } from '@vuelidate/validators';
import UserManagementService from './user-management.service';
import { type IUser, User } from '@/shared/model/user.model';
import { useAlertService } from '@/shared/alert/alert.service';
import languages from '@/shared/config/languages';
import { useRoute, useRouter } from 'vue-router';

const loginValidator = (value: string) => {
  if (!value) {
    return true;
  }
  return /^[a-zA-Z0-9!$&*+=?^_`{|}~.-]+@[a-zA-Z0-9-]+(?:\\.[a-zA-Z0-9-]+)*$|^[_.@A-Za-z0-9-]+$/.test(value);
};

const validations: any = {
  userAccount: {
    login: {
      required,
      maxLength: maxLength(254),
      pattern: loginValidator,
    },
    firstName: {
      maxLength: maxLength(50),
    },
    lastName: {
      maxLength: maxLength(50),
    },
    email: {
      required,
      email,
      minLength: minLength(5),
      maxLength: maxLength(50),
    },
  },
};

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'JhiUserManagementEdit',
  validations,
  setup() {
    const route = useRoute();
    const router = useRouter();
    const alertService = inject('alertService', () => useAlertService(), true);
    const userManagementService = inject('userManagementService', () => new UserManagementService(), true);

    const userAccount: Ref<IUser> = ref({ ...new User(), authorities: [] });
    const isSaving: Ref<boolean> = ref(false);
    const authorities: Ref<string[]> = ref([]);
    const i18n = useI18n(); // Initialize useI18n here

    const previousState = () => router.go(-1);

    const initAuthorities = async () => {
      try {
        const response = await userManagementService.retrieveAuthorities();
        authorities.value = response.data;
      } catch (error) {
        console.error('Erreur lors du chargement des autorités:', error);
        alertService.showHttpError(error.response);
      }
    };

    const loadUser = async (userId: string) => {
      try {
        const response = await userManagementService.get(userId);
        userAccount.value = response.data;
      } catch (error) {
        console.error("Erreur lors du chargement de l'utilisateur:", error);
        alertService.showHttpError(error.response);
      }
    };

    // Initialiser les autorités
    onMounted(() => {
      initAuthorities();
    });

    const userId = route.params?.userId;
    if (userId) {
      loadUser(userId);
    }
    const save = async () => {
      isSaving.value = true;
      try {
        let response;
        if (userAccount.value.id) {
          response = await userManagementService.update(userAccount.value);
          previousState();
          this.isSaving = false;
          alertService.showInfo(getToastMessageFromHeader(response));
        } else {
          response = await userManagementService.create(userAccount.value);
          previousState();
          this.isSaving = false;
          alertService.showSuccess(getToastMessageFromHeader(response));
        }
        isSaving.value = false;
      } catch (error) {
        isSaving.value = false;
        alertService.showHttpError(error.response);
      }
    };

    const getToastMessageFromHeader = (res: any): string => {
      return i18n
        .t(res.headers['x-sdiapp-alert'], {
          param: decodeURIComponent(res.headers['x-sdiapp-params'].replace(/\+/g, ' ')),
        })
        .toString();
    };

    return {
      alertService,
      previousState,
      userAccount,
      isSaving,
      authorities,
      userManagementService,
      v$: useVuelidate(),
      languages: languages(),
      t$: i18n.t,
      save,
      getToastMessageFromHeader,
    };
  },
});
