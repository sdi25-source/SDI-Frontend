import { type Ref, defineComponent, inject, onMounted, ref } from 'vue';
import { useI18n } from 'vue-i18n';

import CountryService from './country.service';
import { type ICountry } from '@/shared/model/country.model';
import useDataUtils from '@/shared/data/data-utils.service';
import { useAlertService } from '@/shared/alert/alert.service';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Country',
  setup() {
    const { t: t$ } = useI18n();
    const dataUtils = useDataUtils();
    const countryService = inject('countryService', () => new CountryService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const countries: Ref<ICountry[]> = ref([]);
    const newCountry: Ref<ICountry> = ref({
      id: null,
      countryCode: '',
      countryName: '',
      createDate: new Date().toISOString().split('T')[0],
      updateDate: new Date().toISOString().split('T')[0],
    });

    const isFetching = ref(false);

    const clear = () => {};

    const retrieveCountrys = async () => {
      isFetching.value = true;
      try {
        const res = await countryService().retrieve();
        countries.value = res.data;
      } catch (err) {
        alertService.showHttpError(err.response);
      } finally {
        isFetching.value = false;
      }
    };

    const handleSyncList = () => {
      retrieveCountrys();
    };

    onMounted(async () => {
      await retrieveCountrys();
    });

    const removeId: Ref<number> = ref(null);
    const removeEntity = ref<any>(null);
    const prepareRemove = (instance: ICountry) => {
      removeId.value = instance.id;
      removeEntity.value.show();
    };
    const closeDialog = () => {
      removeEntity.value.hide();
    };
    const removeCountry = async () => {
      try {
        await countryService().delete(removeId.value);
        const message = t$('sdiFrontendApp.country.deleted', { param: removeId.value }).toString();
        alertService.showInfo(message, { variant: 'danger' });
        removeId.value = null;
        retrieveCountrys();
        closeDialog();
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };
    const saveNewCountry = async () => {
      if (!newCountry.value.countryname || !newCountry.value.countryCode) {
        alertService().showError('Les champs Code et Nom sont requis.');
        return;
      }

      // Vérifier doublon local (optionnel)
      const exists = countries.value.find(c => c.countryCode.toLowerCase() === newCountry.value.countryCode.toLowerCase());
      if (exists) {
        alertService().showError('Un pays avec ce code existe déjà.');
        return;
      }

      try {
        const res = await countryService().create(newCountry.value);
        countries.value.push({
          ...res,
          isEditing: false,
          showDropdown: false,
          originalData: JSON.parse(JSON.stringify(res)),
        });
        alertService().showSuccess('Pays ajouté avec succès.');

        // Reset
        newCountry.value = {
          id: null,
          countryCode: '',
          countryName: '',
          createDate: new Date().toISOString().split('T')[0],
          updateDate: new Date().toISOString().split('T')[0],
        };
      } catch (error) {
        alertService().showHttpError(error.response);
      }
    };

    return {
      saveNewCountry,
      newCountry,
      countries,
      handleSyncList,
      isFetching,
      retrieveCountrys,
      clear,
      removeId,
      removeEntity,
      prepareRemove,
      closeDialog,
      removeCountry,
      t$,
      ...dataUtils,
    };
  },
});
