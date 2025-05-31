import { defineComponent, ref, onMounted, nextTick, inject } from 'vue';
import { useI18n } from 'vue-i18n';
import type LoginService from '@/account/login.service';
import type { ComputedRef } from 'vue';
import { type ProductOverview } from '@/shared/model/product-overview.model';
import ProductService from '@/entities/product/product.service.ts';

export default defineComponent({
  name: 'DashProductsComponent',
  setup() {
    const loginService = inject<LoginService>('loginService');
    const authenticated = inject<ComputedRef<boolean>>('authenticated');
    const username = inject<ComputedRef<string>>('currentUsername');
    const { t } = useI18n();

    const scrollContainer = ref<HTMLElement | null>(null);
    const isAtStart = ref(true);
    const isAtEnd = ref(false);
    const products = ref<ProductOverview[]>([]);

    const productService = new ProductService();

    const fetchProducts = async () => {
      try {
        products.value = await productService.retrieveProductOverviews();
      } catch (error) {
        console.error('Error fetching product overviews:', error);
      }
    };

    const scrollLeft = () => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollBy({
          left: -320,
          behavior: 'smooth',
        });
      }
    };

    const scrollRight = () => {
      if (scrollContainer.value) {
        scrollContainer.value.scrollBy({
          left: 320,
          behavior: 'smooth',
        });
      }
    };

    const checkScrollPosition = () => {
      if (scrollContainer.value) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainer.value;
        isAtStart.value = scrollLeft === 0;
        isAtEnd.value = scrollLeft + clientWidth >= scrollWidth - 1;
      }
    };

    onMounted(() => {
      fetchProducts();
      nextTick(() => {
        checkScrollPosition();
      });
    });

    const openLogin = () => {
      loginService.openLogin();
    };

    return {
      scrollContainer,
      products,
      isAtStart,
      isAtEnd,
      scrollLeft,
      scrollRight,
      checkScrollPosition,
      authenticated,
      username,
      openLogin,
      t$: t,
    };
  },
});
