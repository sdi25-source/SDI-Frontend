import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ClientEventService from './client-event.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ClientService from '@/entities/client/client.service';
import { type IClient } from '@/shared/model/client.model';
import ClientEventTypeService from '@/entities/client-event-type/client-event-type.service';
import { type IClientEventType } from '@/shared/model/client-event-type.model';
import { ClientEvent, type IClientEvent } from '@/shared/model/client-event.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientEventUpdate',
  setup() {
    const clientEventService = inject('clientEventService', () => new ClientEventService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const clientEvent: Ref<IClientEvent> = ref(new ClientEvent());

    const clientService = inject('clientService', () => new ClientService());

    const clients: Ref<IClient[]> = ref([]);

    const clientEventTypeService = inject('clientEventTypeService', () => new ClientEventTypeService());

    const clientEventTypes: Ref<IClientEventType[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveClientEvent = async clientEventId => {
      try {
        const res = await clientEventService().find(clientEventId);
        clientEvent.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientEventId) {
      retrieveClientEvent(route.params.clientEventId);
    }

    const initRelationships = () => {
      clientService()
        .retrieve()
        .then(res => {
          clients.value = res.data;
        });
      clientEventTypeService()
        .retrieve()
        .then(res => {
          clientEventTypes.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      event: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      description: {},
      eventDate: {},
      notes: {},
      client: {},
      clientEventType: {},
    };
    const v$ = useVuelidate(validationRules, clientEvent as any);
    v$.value.$validate();

    return {
      clientEventService,
      alertService,
      clientEvent,
      previousState,
      isSaving,
      currentLanguage,
      clients,
      clientEventTypes,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.clientEvent.id) {
        this.clientEventService()
          .update(this.clientEvent)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('sdiFrontendApp.clientEvent.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.clientEventService()
          .create(this.clientEvent)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showSuccess(this.t$('sdiFrontendApp.clientEvent.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
