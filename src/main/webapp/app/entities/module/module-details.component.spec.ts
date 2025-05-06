import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ModuleDetails from './module-details.vue';
import ModuleService from './module.service';
import AlertService from '@/shared/alert/alert.service';

type ModuleDetailsComponentType = InstanceType<typeof ModuleDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const moduleSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Module Management Detail Component', () => {
    let moduleServiceStub: SinonStubbedInstance<ModuleService>;
    let mountOptions: MountingOptions<ModuleDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      moduleServiceStub = sinon.createStubInstance<ModuleService>(ModuleService);

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
          moduleService: () => moduleServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        moduleServiceStub.find.resolves(moduleSample);
        route = {
          params: {
            moduleId: `${123}`,
          },
        };
        const wrapper = shallowMount(ModuleDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.module).toMatchObject(moduleSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        moduleServiceStub.find.resolves(moduleSample);
        const wrapper = shallowMount(ModuleDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
