import { type Ref, computed, defineComponent, inject, ref, onMounted, nextTick } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { email, helpers, maxLength, minLength, required } from '@vuelidate/validators';
import ClientService from './client.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';
import CountryService from '@/entities/country/country.service';
import { type ICountry } from '@/shared/model/country.model';
import ClientSizeService from '@/entities/client-size/client-size.service';
import { type IClientSize } from '@/shared/model/client-size.model';
import ClientTypeService from '@/entities/client-type/client-type.service';
import { type IClientType } from '@/shared/model/client-type.model';
import { Client, type IClient } from '@/shared/model/client.model';
import intlTelInput, { type Iti } from 'intl-tel-input';
import 'intl-tel-input/build/css/intlTelInput.css';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientUpdate',
  setup() {
    const clientService = inject('clientService', () => new ClientService());
    const alertService = inject('alertService', () => useAlertService(), true);
    const { t: t$ } = useI18n();
    const client: Ref<IClient> = ref(new Client());
    const logoPreview = ref<string | null>(null);
    const logoSize = ref<number | null>(null);
    const phoneInput = ref(null);
    const itiInstance: Iti = ref<any>(null);
    const countryService = inject('countryService', () => new CountryService());
    const countries: Ref<ICountry[]> = ref([]);
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const clientSizes: Ref<IClientSize[]> = ref([]);
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const clientTypes: Ref<IClientType[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    const editorContent = ref<HTMLElement | null>(null);
    const selectedHeading = ref('');
    const selectedFont = ref('');
    const isBold = ref(false);
    const isItalic = ref(false);
    const isUnderline = ref(false);

    const route = useRoute();
    const router = useRouter();
    const previousState = () => router.go(-1);

    const retrieveClient = async clientId => {
      try {
        const res = await clientService().find(clientId);
        client.value = res;
        if (client.value.clientLogo) {
          try {
            logoPreview.value = decompressLogo(client.value.clientLogo);
            logoSize.value = Math.round(client.value.clientLogo.length / 1024);
          } catch (error) {
            console.error('Erreur lors de la décompression du logo:', error);
            alertService.showError(t$('sdiFrontendApp.client.logoError').toString());
          }
        }
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.clientId) {
      retrieveClient(route.params.clientId);
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

    const isDigitsOnly = helpers.regex(/^\+?\d*$/);
    initRelationships();

    const dataUtils = useDataUtils();

    const compressLogo = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const maxWidth = 300;
            const maxHeight = 300;
            let width = img.width;
            let height = img.height;

            if (width > height) {
              if (width > maxWidth) {
                height = Math.round((height * maxWidth) / width);
                width = maxWidth;
              }
            } else {
              if (height > maxHeight) {
                width = Math.round((width * maxHeight) / height);
                height = maxHeight;
              }
            }

            canvas.width = width;
            canvas.height = height;
            ctx.drawImage(img, 0, 0, width, height);
            resolve(canvas.toDataURL('image/jpeg', 0.7));
          };
          img.onerror = () => reject(new Error("Erreur lors du chargement de l'image"));
        };
        reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
        reader.readAsDataURL(file);
      });
    };

    const decompressLogo = (base64: string): string => {
      return base64.startsWith('data:image') ? base64 : `data:image/jpeg;base64,${base64}`;
    };

    const onLogoChange = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
          const compressedLogo = await compressLogo(file);
          client.value.clientLogo = compressedLogo;
          logoPreview.value = compressedLogo;
          logoSize.value = Math.round(file.size / 1024);
          v$.value.clientLogo.$touch();
        } catch (error) {
          console.error('Erreur lors de la compression du logo:', error);
          alertService.showError(t$('sdiFrontendApp.client.logoError').toString());
        }
      }
    };

    const validations = useValidation();
    const validationRules = {
      clientLogo: {},
      name: { required: validations.required(t$('entity.validation.required').toString()) },
      code: {},
      mainContactName: {},
      mainContactEmail: {
        required,
        email,
        minLength: minLength(5),
        maxLength: maxLength(50),
      },
      currentCardHolderNumber: {
        required,
        isDigitsOnly,
        minLength: minLength(16),
        maxLength: maxLength(16),
      },
      currentBruncheNumber: {},
      currentCustomersNumber: {},
      mainContactPhoneNumber: {
        required: helpers.withMessage(t$('entity.validation.required'), required),
      },
      url: {},
      address: {},
      createDate: {},
      updateDate: {},
      notes: {},
      size: {},
      clientType: {},
      country: {},
    };
    const v$ = useVuelidate(validationRules, client as any);

    onMounted(() => {
      nextTick(() => {
        const inputEl = phoneInput.value?.$el?.tagName === 'INPUT' ? phoneInput.value.$el : phoneInput.value?.$el?.querySelector('input');
        if (phoneInput.value) {
          itiInstance.value = intlTelInput(phoneInput.value, {
            initialCountry: 'auto',
            nationalMode: false,
            utilsScript: 'https://cdnjs.cloudflare.com/ajax/libs/intl-tel-input/17.0.8/js/utils.js',
          });
        }
        if (inputEl) {
          itiInstance.value = intlTelInput(inputEl, {
            initialCountry: 'ma',
            preferredCountries: ['ma', 'fr', 'us'],
            separateDialCode: true,
            utilsScript: 'https://cdn.jsdelivr.net/npm/intl-tel-input@18.1.1/build/js/utils.js',
          });

          if (client.value.mainContactPhoneNumber) {
            itiInstance.value.setNumber(client.value.mainContactPhoneNumber);
          }

          const updatePhoneValue = () => {
            const fullNumber = itiInstance.value.getNumber();
            v$.value.mainContactPhoneNumber.$model = fullNumber;
            client.value.mainContactPhoneNumber = fullNumber;
          };

          inputEl.addEventListener('input', updatePhoneValue);
          inputEl.addEventListener('countrychange', updatePhoneValue);
        }
      });
    });

    return {
      clientService,
      alertService,
      client,
      itiInstance,
      phoneInput,
      logoPreview,
      logoSize,
      previousState,
      isSaving,
      currentLanguage,
      countries,
      clientSizes,
      clientTypes,
      onLogoChange,
      ...dataUtils,
      v$,
      t$,
    };
  },

  methods: {
    save(): void {
      if (this.itiInstance?.value) {
        this.client.mainContactPhoneNumber = this.itiInstance.value.getNumber();
        console.log('Téléphone formaté :', this.client.mainContactPhoneNumber);
      }

      this.isSaving = true;
      this.client.createDate = new Date().toISOString().split('T')[0];
      this.client.updateDate = new Date().toISOString().split('T')[0];

      if (this.client.id) {
        this.clientService()
          .update(this.client)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            this.alertService.showInfo(this.t$('jhipsterApp.client.updated', { param: param.id }));
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
            this.previousState();
            this.alertService.showSuccess(this.t$('jhipsterApp.client.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
