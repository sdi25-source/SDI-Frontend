import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductVersionDetails from './product-version-details.vue';
import ProductVersionService from './product-version.service';
import AlertService from '@/shared/alert/alert.service';

type ProductVersionDetailsComponentType = InstanceType<typeof ProductVersionDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productVersionSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ProductVersion Management Detail Component', () => {
    let productVersionServiceStub: SinonStubbedInstance<ProductVersionService>;
    let mountOptions: MountingOptions<ProductVersionDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      productVersionServiceStub = sinon.createStubInstance<ProductVersionService>(ProductVersionService);

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
          productVersionService: () => productVersionServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productVersionServiceStub.find.resolves(productVersionSample);
        route = {
          params: {
            productVersionId: `${123}`,
          },
        };
        const wrapper = shallowMount(ProductVersionDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.productVersion).toMatchObject(productVersionSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productVersionServiceStub.find.resolves(productVersionSample);
        const wrapper = shallowMount(ProductVersionDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
