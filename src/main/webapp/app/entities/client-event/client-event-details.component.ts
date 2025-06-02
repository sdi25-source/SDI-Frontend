import { type Ref, defineComponent, inject, ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import ClientEventService from '@/entities/client-event/client-event.service';
import { useAlertService } from '@/shared/alert/alert.service';
import type { IClientEvent } from '@/shared/model/client-event.model.ts';
import type AccountService from '@/account/account.service.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEventDetails',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const clientEventService = inject('clientEventService', () => new ClientEventService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientEvent = ref<IClientEvent | null>(null);
    const accountService = inject<AccountService>('accountService');
    const hasAnyAuthorityValues: Ref<any> = ref({});

    const retrieveClientEvent = async (clientEventId: number) => {
      try {
        const res = await clientEventService().find(clientEventId);
        clientEvent.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const previousState = () => {
      router.go(-1);
    };

    onMounted(async () => {
      const clientEventId = route.params?.clientEventId;
      if (clientEventId) {
        await retrieveClientEvent(Number(clientEventId));
      }
    });

    return {
      clientEvent,
      t$,
      previousState,
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
