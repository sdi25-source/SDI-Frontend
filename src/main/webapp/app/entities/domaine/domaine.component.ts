import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import DomaineService from './domaine.service';
import { type IDomaine } from '@/shared/model/domaine.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Domaine',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const domaineService = inject('domaineService', () => new DomaineService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const domaines: Ref<IDomaine[]> = ref([]);

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveDomaines = async () => {
      isFetching.value = true;
      try {
        const res = await domaineService().retrieve();
        domaines.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveDomaines();
    };

    onMounted(async () => {
      await retrieveDomaines();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: IDomaine) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeDomaine = async () => {
      try {
        await domaineService().delete(removeId.value);
        const message = t$('sdiFrontendApp.domaine.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveDomaines();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    return {
      domaines,
      handleSyncList,
      isFetching,
      retrieveDomaines,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeDomaine,
      t$,
      ...dataUtils,
    };
  },
});
