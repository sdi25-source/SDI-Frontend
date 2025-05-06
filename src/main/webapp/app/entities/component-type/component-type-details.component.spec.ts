import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ComponentTypeDetails from './component-type-details.vue';
import ComponentTypeService from './component-type.service';
import AlertService from '@/shared/alert/alert.service';

type ComponentTypeDetailsComponentType = InstanceType<typeof ComponentTypeDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const componentTypeSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ComponentType Management Detail Component', () => {
    let componentTypeServiceStub: SinonStubbedInstance<ComponentTypeService>;
    let mountOptions: MountingOptions<ComponentTypeDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      componentTypeServiceStub = sinon.createStubInstance<ComponentTypeService>(ComponentTypeService);

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
          componentTypeService: () => componentTypeServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        componentTypeServiceStub.find.resolves(componentTypeSample);
        route = {
          params: {
            componentTypeId: `${123}`,
          },
        };
        const wrapper = shallowMount(ComponentTypeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.componentType).toMatchObject(componentTypeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        componentTypeServiceStub.find.resolves(componentTypeSample);
        const wrapper = shallowMount(ComponentTypeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
