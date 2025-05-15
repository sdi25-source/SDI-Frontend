import { defineComponent } from 'vue';
import { useI18n } from 'vue-i18n';

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ProductsMenu',
  emits: ['menu-item-clicked'],
  setup(props, { emit }) {
    const i18n = useI18n();
    const emitMenuItemClicked = () => {
      emit('menu-item-clicked');
    };
    return {
      emitMenuItemClicked,
      t$: i18n.t,
    };
  },
});
