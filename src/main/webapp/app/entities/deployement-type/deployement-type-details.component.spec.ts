import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import DeployementTypeDetails from './deployement-type-details.vue';
import DeployementTypeService from './deployement-type.service';
import AlertService from '@/shared/alert/alert.service';

type DeployementTypeDetailsComponentType = InstanceType<typeof DeployementTypeDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const deployementTypeSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('DeployementType Management Detail Component', () => {
    let deployementTypeServiceStub: SinonStubbedInstance<DeployementTypeService>;
    let mountOptions: MountingOptions<DeployementTypeDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      deployementTypeServiceStub = sinon.createStubInstance<DeployementTypeService>(DeployementTypeService);

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
          deployementTypeService: () => deployementTypeServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        deployementTypeServiceStub.find.resolves(deployementTypeSample);
        route = {
          params: {
            deployementTypeId: `${123}`,
          },
        };
        const wrapper = shallowMount(DeployementTypeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.deployementType).toMatchObject(deployementTypeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        deployementTypeServiceStub.find.resolves(deployementTypeSample);
        const wrapper = shallowMount(DeployementTypeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
