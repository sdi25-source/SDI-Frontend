import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductDeployementDetailDetails from './product-deployement-detail-details.vue';
import ProductDeployementDetailService from './product-deployement-detail.service';
import AlertService from '@/shared/alert/alert.service';

type ProductDeployementDetailDetailsComponentType = InstanceType<typeof ProductDeployementDetailDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productDeployementDetailSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ProductDeployementDetail Management Detail Component', () => {
    let productDeployementDetailServiceStub: SinonStubbedInstance<ProductDeployementDetailService>;
    let mountOptions: MountingOptions<ProductDeployementDetailDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      productDeployementDetailServiceStub = sinon.createStubInstance<ProductDeployementDetailService>(ProductDeployementDetailService);

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
          productDeployementDetailService: () => productDeployementDetailServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productDeployementDetailServiceStub.find.resolves(productDeployementDetailSample);
        route = {
          params: {
            productDeployementDetailId: `${123}`,
          },
        };
        const wrapper = shallowMount(ProductDeployementDetailDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.productDeployementDetail).toMatchObject(productDeployementDetailSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productDeployementDetailServiceStub.find.resolves(productDeployementDetailSample);
        const wrapper = shallowMount(ProductDeployementDetailDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
