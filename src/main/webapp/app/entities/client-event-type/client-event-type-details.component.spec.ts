import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientEventTypeDetails from './client-event-type-details.vue';
import ClientEventTypeService from './client-event-type.service';
import AlertService from '@/shared/alert/alert.service';

type ClientEventTypeDetailsComponentType = InstanceType<typeof ClientEventTypeDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientEventTypeSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ClientEventType Management Detail Component', () => {
    let clientEventTypeServiceStub: SinonStubbedInstance<ClientEventTypeService>;
    let mountOptions: MountingOptions<ClientEventTypeDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      clientEventTypeServiceStub = sinon.createStubInstance<ClientEventTypeService>(ClientEventTypeService);

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
          clientEventTypeService: () => clientEventTypeServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientEventTypeServiceStub.find.resolves(clientEventTypeSample);
        route = {
          params: {
            clientEventTypeId: `${123}`,
          },
        };
        const wrapper = shallowMount(ClientEventTypeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.clientEventType).toMatchObject(clientEventTypeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientEventTypeServiceStub.find.resolves(clientEventTypeSample);
        const wrapper = shallowMount(ClientEventTypeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
