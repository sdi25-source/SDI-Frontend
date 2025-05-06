import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import FeatureDeployementDetails from './feature-deployement-details.vue';
import FeatureDeployementService from './feature-deployement.service';
import AlertService from '@/shared/alert/alert.service';

type FeatureDeployementDetailsComponentType = InstanceType<typeof FeatureDeployementDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const featureDeployementSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('FeatureDeployement Management Detail Component', () => {
    let featureDeployementServiceStub: SinonStubbedInstance<FeatureDeployementService>;
    let mountOptions: MountingOptions<FeatureDeployementDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      featureDeployementServiceStub = sinon.createStubInstance<FeatureDeployementService>(FeatureDeployementService);

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
          featureDeployementService: () => featureDeployementServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        featureDeployementServiceStub.find.resolves(featureDeployementSample);
        route = {
          params: {
            featureDeployementId: `${123}`,
          },
        };
        const wrapper = shallowMount(FeatureDeployementDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.featureDeployement).toMatchObject(featureDeployementSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        featureDeployementServiceStub.find.resolves(featureDeployementSample);
        const wrapper = shallowMount(FeatureDeployementDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
