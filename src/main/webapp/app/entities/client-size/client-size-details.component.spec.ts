import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientSizeDetails from './client-size-details.vue';
import ClientSizeService from './client-size.service';
import AlertService from '@/shared/alert/alert.service';

type ClientSizeDetailsComponentType = InstanceType<typeof ClientSizeDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientSizeSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ClientSize Management Detail Component', () => {
    let clientSizeServiceStub: SinonStubbedInstance<ClientSizeService>;
    let mountOptions: MountingOptions<ClientSizeDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      clientSizeServiceStub = sinon.createStubInstance<ClientSizeService>(ClientSizeService);

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
          clientSizeService: () => clientSizeServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientSizeServiceStub.find.resolves(clientSizeSample);
        route = {
          params: {
            clientSizeId: `${123}`,
          },
        };
        const wrapper = shallowMount(ClientSizeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.clientSize).toMatchObject(clientSizeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientSizeServiceStub.find.resolves(clientSizeSample);
        const wrapper = shallowMount(ClientSizeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
