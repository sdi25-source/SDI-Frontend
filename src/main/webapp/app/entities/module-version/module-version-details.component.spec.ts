import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ModuleVersionDetails from './module-version-details.vue';
import ModuleVersionService from './module-version.service';
import AlertService from '@/shared/alert/alert.service';

type ModuleVersionDetailsComponentType = InstanceType<typeof ModuleVersionDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const moduleVersionSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ModuleVersion Management Detail Component', () => {
    let moduleVersionServiceStub: SinonStubbedInstance<ModuleVersionService>;
    let mountOptions: MountingOptions<ModuleVersionDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      moduleVersionServiceStub = sinon.createStubInstance<ModuleVersionService>(ModuleVersionService);

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
          moduleVersionService: () => moduleVersionServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        moduleVersionServiceStub.find.resolves(moduleVersionSample);
        route = {
          params: {
            moduleVersionId: `${123}`,
          },
        };
        const wrapper = shallowMount(ModuleVersionDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.moduleVersion).toMatchObject(moduleVersionSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        moduleVersionServiceStub.find.resolves(moduleVersionSample);
        const wrapper = shallowMount(ModuleVersionDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
