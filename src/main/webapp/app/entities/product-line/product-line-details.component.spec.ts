import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductLineDetails from './product-line-details.vue';
import ProductLineService from './product-line.service';
import AlertService from '@/shared/alert/alert.service';

type ProductLineDetailsComponentType = InstanceType<typeof ProductLineDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productLineSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ProductLine Management Detail Component', () => {
    let productLineServiceStub: SinonStubbedInstance<ProductLineService>;
    let mountOptions: MountingOptions<ProductLineDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      productLineServiceStub = sinon.createStubInstance<ProductLineService>(ProductLineService);

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          'font-awesome-icon': true,
          'router-link': true,
        },
        provide: {
          alertService,
          productLineService: () => productLineServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productLineServiceStub.find.resolves(productLineSample);
        route = {
          params: {
            productLineId: `${123}`,
          },
        };
        const wrapper = shallowMount(ProductLineDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.productLine).toMatchObject(productLineSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productLineServiceStub.find.resolves(productLineSample);
        const wrapper = shallowMount(ProductLineDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
