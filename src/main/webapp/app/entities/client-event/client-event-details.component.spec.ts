import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientEventDetails from './client-event-details.vue';
import ClientEventService from './client-event.service';
import AlertService from '@/shared/alert/alert.service';

type ClientEventDetailsComponentType = InstanceType<typeof ClientEventDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientEventSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ClientEvent Management Detail Component', () => {
    let clientEventServiceStub: SinonStubbedInstance<ClientEventService>;
    let mountOptions: MountingOptions<ClientEventDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      clientEventServiceStub = sinon.createStubInstance<ClientEventService>(ClientEventService);

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
          clientEventService: () => clientEventServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientEventServiceStub.find.resolves(clientEventSample);
        route = {
          params: {
            clientEventId: `${123}`,
          },
        };
        const wrapper = shallowMount(ClientEventDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.clientEvent).toMatchObject(clientEventSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientEventServiceStub.find.resolves(clientEventSample);
        const wrapper = shallowMount(ClientEventDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
