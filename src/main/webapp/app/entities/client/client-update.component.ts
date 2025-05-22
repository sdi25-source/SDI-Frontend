import { type Ref, computed, defineComponent, inject, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';
import { email, maxLength, minLength, required } from '@vuelidate/validators';
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

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ClientUpdate',
  props: {
    clientId: {
      type: [Number, String],
      required: false,
    },
  },
  emits: ['close', 'user-saved'],
  setup(props, { emit }) {
    const clientService = inject('clientService', () => new ClientService());
    const alertService = inject('alertService', () => useAlertService(), true);
    const { t: t$ } = useI18n();
    const client: Ref<IClient> = ref(new Client());
    const logoPreview = ref<string | null>(null);
    const logoSize = ref<number | null>(null);

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
        if (client.value.clientLogo) {
          try {
            logoPreview.value = decompressLogo(client.value.clientLogo);
            logoSize.value = Math.round(client.value.clientLogo.length / 1024); // Taille en KB
          } catch (error) {
            console.error('Erreur lors de la décompression du logo:', error);
            alertService.showError(t$('sdiFrontendApp.client.logoError').toString());
          }
        }
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

    // Validation personnalisée pour le logo
    const maxFileSize = (value: File | string): boolean => {
      if (!value || typeof value === 'string') return true; // Pas de fichier ou déjà une chaîne
      return value.size <= 2 * 1024 * 1024; // 2MB max
    };

    // Compression du logo
    const compressLogo = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = event => {
          const img = new Image();
          img.src = event.target?.result as string;
          img.onload = () => {
            const canvas = document.createElement('canvas');
            const ctx = canvas.getContext('2d')!;
            const maxWidth = 300; // Largeur max pour compression
            const maxHeight = 300; // Hauteur max pour compression
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
            resolve(canvas.toDataURL('image/jpeg', 0.7)); // Compression à 70%
          };
          img.onerror = () => reject(new Error("Erreur lors du chargement de l'image"));
        };
        reader.onerror = () => reject(new Error('Erreur lors de la lecture du fichier'));
        reader.readAsDataURL(file);
      });
    };

    // Décompression du logo (conversion base64 vers URL affichable)
    const decompressLogo = (base64: string): string => {
      return base64.startsWith('data:image') ? base64 : `data:image/jpeg;base64,${base64}`;
    };

    // Gestion du changement de fichier
    const onLogoChange = async (event: Event) => {
      const input = event.target as HTMLInputElement;
      if (input.files && input.files[0]) {
        const file = input.files[0];
        try {
          const compressedLogo = await compressLogo(file);
          client.value.clientLogo = compressedLogo;
          logoPreview.value = compressedLogo;
          logoSize.value = Math.round(file.size / 1024); // Taille en KB
          v$.value.clientLogo.$touch(); // Marquer le champ comme "touché"
        } catch (error) {
          console.error('Erreur lors de la compression du logo:', error);
          alertService.showError(t$('sdiFrontendApp.client.logoError').toString());
        }
      }
    };

    const validations = useValidation();
    const validationRules = {
      clientLogo: {},
      name: {
        required: validations.required(t$('entity.validation.required').toString()),
      },
      code: {},
      mainContactName: {},
      mainContactEmail: {
        required,
        email,
        minLength: minLength(5),
        maxLength: maxLength(50),
      },
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

    const cancel = () => {
      emit('close');
    };

    return {
      clientService,
      alertService,
      client,
      logoPreview,
      logoSize,
      previousState,
      isSaving,
      currentLanguage,
      countries,
      clientSizes,
      clientTypes,
      cancel,
      onLogoChange,
      ...dataUtils,
      v$,
      t$,
    };
  },

  methods: {
    save(): void {
      this.isSaving = true;
      if (this.client.id) {
        this.clientService()
          .update(this.client)
          .then(param => {
            this.isSaving = false;
            this.alertService.showInfo(this.t$('sdiFrontendApp.client.updated', { param: param.id }));
            this.$emit('user-saved', param);
            this.$emit('close');
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
            this.alertService.showSuccess(this.t$('sdiFrontendApp.client.created', { param: param.id }).toString());
            this.$emit('user-saved', param);
            this.$emit('close');
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
