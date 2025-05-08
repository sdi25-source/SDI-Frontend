import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ClientService from './client.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import CountryService from '@/entities/country/country.service';
import { type ICountry } from '@/shared/model/country.model';
import ClientSizeService from '@/entities/client-size/client-size.service';
import { type IClientSize } from '@/shared/model/client-size.model';
import ClientTypeService from '@/entities/client-type/client-type.service';
1;
import { type IClientType } from '@/shared/model/client-type.model';
import { Client, type IClient } from '@/shared/model/client.model';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientUpdate',
  props: {
    // eslint-disable-next-line vue/require-default-prop
    clientId: {
      type: [Number, String],
      required: false,
    },
  },

  setup(props) {
    const clientService = inject('clientService', () => new ClientService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const client: Ref<IClient> = ref(new Client());

    const countryService = inject('countryService', () => new CountryService());

    const countries: Ref<ICountry[]> = ref([]);

    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());

    const clientSizes: Ref<IClientSize[]> = ref([]);

    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());

    const clientTypes: Ref<IClientType[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveClient = async clientId => {
      try {
        const res = await clientService().find(clientId);
        client.value = res;
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (props.clientId) {
      retrieveClient(props.clientId);
    }

    const initRelationships = () => {
      countryService()
        .retrieve()
        .then(res => {
          countries.value = res.data;
        });
      clientSizeService()
        .retrieve()
        .then(res => {
          clientSizes.value = res.data;
        });
      clientTypeService()
        .retrieve()
        .then(res => {
          clientTypes.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      clientLogo: {},
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      code: {},
      mainContactName: {},
      mainContactEmail: {},
      currentCardHolderNumber: {},
      currentBruncheNumber: {},
      currentCustomersNumber: {},
      mainContactPhoneNumber: {},
      url: {},
      industry: {},
      address: {},
      createDate: {},
      updateDate: {},
      notes: {},
      productDeployements: {},
      country: {},
      size: {},
      clientType: {},
      certifs: {},
    };
    const v$ = useVuelidate(validationRules, client as any);
    v$.value.$validate();

    return {
      clientService,
      alertService,
      client,
      previousState,
      isSaving,
      currentLanguage,
      countries,
      clientSizes,
      clientTypes,
      ...dataUtils,
      v$,
      t$,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.client.id) {
        this.clientService()
          .update(this.client)
          .then(param => {
            this.isSaving = false;
            this.alertService.showInfo(this.t$('frontendApp.client.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.clientService()
          .create(this.client)
          .then(param => {
            this.isSaving = false;
            this.alertService.showSuccess(this.t$('frontendApp.client.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
