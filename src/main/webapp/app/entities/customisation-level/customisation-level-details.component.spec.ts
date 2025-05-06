import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import CustomisationLevelDetails from './customisation-level-details.vue';
import CustomisationLevelService from './customisation-level.service';
import AlertService from '@/shared/alert/alert.service';

type CustomisationLevelDetailsComponentType = InstanceType<typeof CustomisationLevelDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const customisationLevelSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('CustomisationLevel Management Detail Component', () => {
    let customisationLevelServiceStub: SinonStubbedInstance<CustomisationLevelService>;
    let mountOptions: MountingOptions<CustomisationLevelDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      customisationLevelServiceStub = sinon.createStubInstance<CustomisationLevelService>(CustomisationLevelService);

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
          customisationLevelService: () => customisationLevelServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        customisationLevelServiceStub.find.resolves(customisationLevelSample);
        route = {
          params: {
            customisationLevelId: `${123}`,
          },
        };
        const wrapper = shallowMount(CustomisationLevelDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.customisationLevel).toMatchObject(customisationLevelSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        customisationLevelServiceStub.find.resolves(customisationLevelSample);
        const wrapper = shallowMount(CustomisationLevelDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
