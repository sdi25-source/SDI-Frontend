import { type Ref, defineComponent, inject, onMounted, ref, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter, useRoute } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { required } from '@vuelidate/validators';
import ClientEventService from '@/entities/client-event/client-event.service';
import ClientService from '@/entities/client/client.service';
import ClientEventTypeService from '@/entities/client-event-type/client-event-type.service';
import { useAlertService } from '@/shared/alert/alert.service';
import type { IClientEvent } from '@/shared/model/client-event.model.ts';
import { type IClient } from '@/shared/model/client.model.ts';
import type { IClientEventType } from '@/shared/model/client-event-type.model.ts';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEventUpdate',
  setup() {
    const { t: t$ } = useI18n();
    const router = useRouter();
    const route = useRoute();
    const clientEventService = inject('clientEventService', () => new ClientEventService());
    const clientService = inject('clientService', () => new ClientService());
    const clientEventTypeService = inject('clientEventTypeService', () => new ClientEventTypeService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientEvent = ref<IClientEvent>({
      id: null,
      event: '',
      description: '',
      eventDate: '',
      notes: '',
      client: null,
      clientEventType: null,
    });
    const clients = ref<IClient[]>([]);
    const clientEventTypes = ref<IClientEventType[]>([]);
    const isSaving = ref(false);
    const currentLanguage = ref('en');

    // Validation rules
    const rules = computed(() => ({
      event: { required },
      description: {},
      eventDate: {},
      notes: {},
      client: {},
      clientEventType: {},
    }));

    const v$ = useVuelidate(rules, clientEvent);

    const retrieveClientEvent = async (clientEventId: number) => {
      try {
        const res = await clientEventService().find(clientEventId);
        clientEvent.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const fetchClients = async () => {
      try {
        const res = await clientService().retrieve();
        clients.value = res.data;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const fetchClientEventTypes = async () => {
      try {
        const res = await clientEventTypeService().retrieve();
        clientEventTypes.value = res.data;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    const save = async () => {
      isSaving.value = true;
      clientEvent.value.eventDate = new Date().toISOString().split('T')[0];
      try {
        if (clientEvent.value.id) {
          await clientEventService().update(clientEvent.value);
          alertService.showInfo(t$('sdiFrontendApp.clientEvent.updated', { param: clientEvent.value.id }).toString());
        } else {
          await clientEventService().create(clientEvent.value);
          alertService.showInfo(t$('sdiFrontendApp.clientEvent.created', { param: clientEvent.value.id }).toString());
        }
        previousState();
      } catch (error) {
        alertService.showHttpError(error.response);
      } finally {
        isSaving.value = false;
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
      await fetchClients();
      await fetchClientEventTypes();
    });

    return {
      clientEvent,
      clients,
      clientEventTypes,
      isSaving,
      currentLanguage,
      v$,
      t$,
      save,
      previousState,
    };
  },
});
