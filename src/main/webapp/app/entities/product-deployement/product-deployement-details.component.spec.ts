import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductDeployementDetails from './product-deployement-details.vue';
import ProductDeployementService from './product-deployement.service';
import AlertService from '@/shared/alert/alert.service';

type ProductDeployementDetailsComponentType = InstanceType<typeof ProductDeployementDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productDeployementSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ProductDeployement Management Detail Component', () => {
    let productDeployementServiceStub: SinonStubbedInstance<ProductDeployementService>;
    let mountOptions: MountingOptions<ProductDeployementDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      productDeployementServiceStub = sinon.createStubInstance<ProductDeployementService>(ProductDeployementService);

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
          productDeployementService: () => productDeployementServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productDeployementServiceStub.find.resolves(productDeployementSample);
        route = {
          params: {
            productDeployementId: `${123}`,
          },
        };
        const wrapper = shallowMount(ProductDeployementDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.productDeployement).toMatchObject(productDeployementSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productDeployementServiceStub.find.resolves(productDeployementSample);
        const wrapper = shallowMount(ProductDeployementDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
