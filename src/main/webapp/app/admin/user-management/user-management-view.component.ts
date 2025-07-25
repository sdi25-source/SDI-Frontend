import { type Ref, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';

import UserManagementService from './user-management.service';
import { useDateFormat } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'JhiUserManagementView',
  setup() {
    const route = useRoute();
    const router = useRouter();
    const { formatDateLong: formatDate } = useDateFormat();

    const alertService = inject('alertService', () => useAlertService(), true);
    const userManagementService = inject('userManagementService', () => new UserManagementService(), true);

    const user: Ref<any> = ref(null);

    async function loadUser(userId: string) {
      try {
        const response = await userManagementService.get(userId);
        user.value = response.data;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    }

    const previousState = () => router.go(-1);

    loadUser(route.params?.userId);

    return {
      formatDate,
      alertService,
      userManagementService,
      previousState,
      user,
      t$: useI18n().t,
    };
  },
});
