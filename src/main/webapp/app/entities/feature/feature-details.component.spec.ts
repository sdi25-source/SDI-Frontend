import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import FeatureDetails from './feature-details.vue';
import FeatureService from './feature.service';
import AlertService from '@/shared/alert/alert.service';

type FeatureDetailsComponentType = InstanceType<typeof FeatureDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const featureSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Feature Management Detail Component', () => {
    let featureServiceStub: SinonStubbedInstance<FeatureService>;
    let mountOptions: MountingOptions<FeatureDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      featureServiceStub = sinon.createStubInstance<FeatureService>(FeatureService);

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
          featureService: () => featureServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        featureServiceStub.find.resolves(featureSample);
        route = {
          params: {
            featureId: `${123}`,
          },
        };
        const wrapper = shallowMount(FeatureDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.feature).toMatchObject(featureSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        featureServiceStub.find.resolves(featureSample);
        const wrapper = shallowMount(FeatureDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
