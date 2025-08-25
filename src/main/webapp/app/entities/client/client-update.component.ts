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

    const countryService = inject('countryService', () => new CountryService());
    const countries: Ref<ICountry[]> = ref([]);
    const clientSizeService = inject('clientSizeService', () => new ClientSizeService());
    const clientSizes: Ref<IClientSize[]> = ref([]);
    const clientTypeService = inject('clientTypeService', () => new ClientTypeService());
    const clientTypes: Ref<IClientType[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'en'), true);

    // Rich text editor refs
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

    initRelationships();

    const dataUtils = useDataUtils();

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

    // Rich text editor methods
    const updateNotes = () => {
      if (editorContent.value) {
        this.v$.notes.$model = this.$refs.notesEditor.innerText;
        v$.value.notes.$model = editorContent.value.innerHTML;
        v$.value.notes.$touch();
      }
    };

    const updateToolbarState = () => {
      if (!editorContent.value) return;

      isBold.value = document.queryCommandState('bold');
      isItalic.value = document.queryCommandState('italic');
      isUnderline.value = document.queryCommandState('underline');
    };

    const toggleBold = () => {
      document.execCommand('bold');
      updateToolbarState();
      updateNotes();
    };

    const toggleItalic = () => {
      document.execCommand('italic');
      updateToolbarState();
      updateNotes();
    };

    const toggleUnderline = () => {
      document.execCommand('underline');
      updateToolbarState();
      updateNotes();
    };

    const toggleBulletList = () => {
      document.execCommand('insertUnorderedList');
      updateNotes();
    };

    const toggleNumberedList = () => {
      document.execCommand('insertOrderedList');
      updateNotes();
    };

    const applyHeading = () => {
      if (selectedHeading.value) {
        document.execCommand('formatBlock', false, selectedHeading.value);
        selectedHeading.value = '';
        updateNotes();
      }
    };

    const applyFont = () => {
      if (selectedFont.value) {
        document.execCommand('fontName', false, selectedFont.value);
        selectedFont.value = '';
        updateNotes();
      }
    };

    const insertCode = () => {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        const code = document.createElement('code');
        code.style.backgroundColor = '#f1f5f9';
        code.style.padding = '2px 4px';
        code.style.borderRadius = '3px';
        code.style.fontFamily = 'monospace';

        try {
          range.surroundContents(code);
        } catch (e) {
          code.appendChild(range.extractContents());
          range.insertNode(code);
        }
        updateNotes();
      }
    };

    const isDigitsOnly = helpers.regex(/^\+?\d*$/);
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
      mainContactPhoneNumber: {},
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
      if (editorContent.value) {
        editorContent.value.addEventListener('paste', e => {
          e.preventDefault();
          const text = e.clipboardData?.getData('text/plain') || '';
          document.execCommand('insertText', false, text);
          updateNotes();
        });
      }
    });

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
      onLogoChange,
      // Rich text editor
      editorContent,
      selectedHeading,
      selectedFont,
      isBold,
      isItalic,
      isUnderline,
      updateNotes,
      updateToolbarState,
      toggleBold,
      toggleItalic,
      toggleUnderline,
      toggleBulletList,
      toggleNumberedList,
      applyHeading,
      applyFont,
      insertCode,
      ...dataUtils,
      v$,
      t$,
    };
  },

  methods: {
    save(): void {
      console.log('client : ', this.client);
      this.isSaving = true;
      if (this.client.id) {
        this.client.updateDate = new Date().toISOString().split('T')[0];
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
        this.client.createDate = new Date().toISOString().split('T')[0];
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
