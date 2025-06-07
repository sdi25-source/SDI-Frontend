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

    // Rich text editor refs
    const editorContent = ref<HTMLElement | null>(null);
    const selectedHeading = ref('');
    const selectedFont = ref('');
    const isBold = ref(false);
    const isItalic = ref(false);
    const isUnderline = ref(false);

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

    // Rich text editor methods
    const updateNotes = () => {
      if (editorContent.value) {
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


    onMounted(async () => {
      const clientEventId = route.params?.clientEventId;
      if (clientEventId) {
        await retrieveClientEvent(Number(clientEventId));
      }
      await fetchClients();
      await fetchClientEventTypes();

      // Setup rich text editor
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
      clientEvent,
      clients,
      clientEventTypes,
      isSaving,
      currentLanguage,
      v$,
      t$,
      save,
      previousState,
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
    };
  },
});
