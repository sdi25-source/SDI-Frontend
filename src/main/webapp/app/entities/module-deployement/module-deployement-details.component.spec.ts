import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ModuleDeployementDetails from './module-deployement-details.vue';
import ModuleDeployementService from './module-deployement.service';
import AlertService from '@/shared/alert/alert.service';

type ModuleDeployementDetailsComponentType = InstanceType<typeof ModuleDeployementDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const moduleDeployementSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ModuleDeployement Management Detail Component', () => {
    let moduleDeployementServiceStub: SinonStubbedInstance<ModuleDeployementService>;
    let mountOptions: MountingOptions<ModuleDeployementDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      moduleDeployementServiceStub = sinon.createStubInstance<ModuleDeployementService>(ModuleDeployementService);

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
          moduleDeployementService: () => moduleDeployementServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        moduleDeployementServiceStub.find.resolves(moduleDeployementSample);
        route = {
          params: {
            moduleDeployementId: `${123}`,
          },
        };
        const wrapper = shallowMount(ModuleDeployementDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.moduleDeployement).toMatchObject(moduleDeployementSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        moduleDeployementServiceStub.find.resolves(moduleDeployementSample);
        const wrapper = shallowMount(ModuleDeployementDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
