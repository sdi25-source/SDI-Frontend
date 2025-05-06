import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import InfraComponentDetails from './infra-component-details.vue';
import InfraComponentService from './infra-component.service';
import AlertService from '@/shared/alert/alert.service';

type InfraComponentDetailsComponentType = InstanceType<typeof InfraComponentDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const infraComponentSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('InfraComponent Management Detail Component', () => {
    let infraComponentServiceStub: SinonStubbedInstance<InfraComponentService>;
    let mountOptions: MountingOptions<InfraComponentDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      infraComponentServiceStub = sinon.createStubInstance<InfraComponentService>(InfraComponentService);

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
          infraComponentService: () => infraComponentServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        infraComponentServiceStub.find.resolves(infraComponentSample);
        route = {
          params: {
            infraComponentId: `${123}`,
          },
        };
        const wrapper = shallowMount(InfraComponentDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.infraComponent).toMatchObject(infraComponentSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        infraComponentServiceStub.find.resolves(infraComponentSample);
        const wrapper = shallowMount(InfraComponentDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
