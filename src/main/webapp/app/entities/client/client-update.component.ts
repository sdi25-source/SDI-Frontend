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
    // eslint-disable-next-line vue/require-default-prop
    clientId: {
      type: [Number, String],
      required: false,
    },
  },
  emits: ['close', 'user-saved'],
  setup(props, { emit }) {
    const clientService = inject('clientService', () => new ClientService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const client: Ref<IClient> = ref(new Client());
    const logoPreview = ref(null);
    const compressionInfo = ref('');

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

        // Si un logo existe déjà, le décompresser et l'afficher
        if (client.value.clientLogo) {
          try {
            logoPreview.value = decompressLogo(client.value.clientLogo);
          } catch (error) {
            console.error('Erreur lors de la décompression du logo:', error);
            alertService.showError("Erreur lors de l'affichage du logo");
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

    // Fonction pour compresser l'image
    const compressImage = (file: File): Promise<string> => {
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);

        reader.onload = event => {
          const img = new Image();
          img.src = event.target.result as string;

          img.onload = () => {
            // Créer un canvas pour redimensionner l'image
            const canvas = document.createElement('canvas');
            // Définir une taille maximale très petite pour tenir dans varchar(255)
            const MAX_WIDTH = 50;
            const MAX_HEIGHT = 50;

            let width = img.width;
            let height = img.height;

            // Calculer les nouvelles dimensions en conservant le ratio
            if (width > height) {
              if (width > MAX_WIDTH) {
                height *= MAX_WIDTH / width;
                width = MAX_WIDTH;
              }
            } else {
              if (height > MAX_HEIGHT) {
                width *= MAX_HEIGHT / height;
                height = MAX_HEIGHT;
              }
            }

            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Convertir en JPEG avec une qualité très basse pour réduire la taille
            const compressedDataUrl = canvas.toDataURL('image/jpeg', 0.1);

            // Calculer la taille approximative en caractères
            const sizeInChars = Math.ceil(compressedDataUrl.length);
            compressionInfo.value = `Image compressée: ${sizeInChars} caractères (max 255)`;

            // Vérifier si l'image compressée est trop grande pour varchar(255)
            if (sizeInChars > 255) {
              reject(new Error(`L'image est trop grande (${sizeInChars} caractères) même après compression. Maximum: 255 caractères.`));
              return;
            }

            resolve(compressedDataUrl);
          };

          img.onerror = () => {
            reject(new Error("Erreur lors du chargement de l'image"));
          };
        };

        reader.onerror = () => {
          reject(new Error('Erreur lors de la lecture du fichier'));
        };
      });
    };

    // Fonction pour décompresser le logo (dans ce cas, simplement retourner la chaîne base64)
    const decompressLogo = (compressedLogo: string): string => {
      // Si le logo ne commence pas par "data:", on ajoute le préfixe data URL
      if (!compressedLogo.startsWith('data:')) {
        return `data:image/jpeg;base64,${compressedLogo}`;
      }
      return compressedLogo;
    };

    // Fonction appelée lors du changement de logo
    const onLogoChange = async event => {
      const file = event.target.files[0];
      if (!file) return;

      try {
        // Vérifier le type de fichier
        if (!file.type.includes('image/')) {
          alertService.showError('Le fichier doit être une image');
          return;
        }

        // Compresser l'image
        const compressedImage = await compressImage(file);

        // Mettre à jour le modèle avec l'image compressée
        client.value.clientLogo = compressedImage;

        // Afficher la prévisualisation (utiliser l'image non compressée pour la prévisualisation)
        logoPreview.value = URL.createObjectURL(file);

        // Marquer le champ comme modifié pour la validation
        v$.value.clientLogo.$touch();
      } catch (error) {
        console.error('Erreur lors de la compression du fichier:', error);
        alertService.showError(error.message || "Erreur lors du traitement de l'image");
      }
    };

    // Fonction pour supprimer le logo
    const removeLogo = () => {
      client.value.clientLogo = null;
      logoPreview.value = null;
      compressionInfo.value = '';

      // Réinitialiser le champ de fichier
      const fileInput = document.getElementById('client-clientLogo') as HTMLInputElement;
      if (fileInput) {
        fileInput.value = '';
      }
    };

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      clientLogo: {
        maxLength: maxLength(255), // Ajouter une validation de longueur maximale
      },
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
      previousState,
      isSaving,
      currentLanguage,
      countries,
      clientSizes,
      clientTypes,
      cancel,
      logoPreview,
      compressionInfo,
      onLogoChange,
      removeLogo,
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
            this.alertService.showInfo(this.t$('sdiFrontendApp.client.updated', { param: param.id }));
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
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});
