import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientTypeDetails from './client-type-details.vue';
import ClientTypeService from './client-type.service';
import AlertService from '@/shared/alert/alert.service';

type ClientTypeDetailsComponentType = InstanceType<typeof ClientTypeDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientTypeSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ClientType Management Detail Component', () => {
    let clientTypeServiceStub: SinonStubbedInstance<ClientTypeService>;
    let mountOptions: MountingOptions<ClientTypeDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      clientTypeServiceStub = sinon.createStubInstance<ClientTypeService>(ClientTypeService);

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
          clientTypeService: () => clientTypeServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientTypeServiceStub.find.resolves(clientTypeSample);
        route = {
          params: {
            clientTypeId: `${123}`,
          },
        };
        const wrapper = shallowMount(ClientTypeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.clientType).toMatchObject(clientTypeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientTypeServiceStub.find.resolves(clientTypeSample);
        const wrapper = shallowMount(ClientTypeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
