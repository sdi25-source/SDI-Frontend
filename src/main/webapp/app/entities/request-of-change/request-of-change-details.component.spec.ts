import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import RequestOfChangeDetails from './request-of-change-details.vue';
import RequestOfChangeService from './request-of-change.service';
import AlertService from '@/shared/alert/alert.service';

type RequestOfChangeDetailsComponentType = InstanceType<typeof RequestOfChangeDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const requestOfChangeSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('RequestOfChange Management Detail Component', () => {
    let requestOfChangeServiceStub: SinonStubbedInstance<RequestOfChangeService>;
    let mountOptions: MountingOptions<RequestOfChangeDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      requestOfChangeServiceStub = sinon.createStubInstance<RequestOfChangeService>(RequestOfChangeService);

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
          requestOfChangeService: () => requestOfChangeServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        requestOfChangeServiceStub.find.resolves(requestOfChangeSample);
        route = {
          params: {
            requestOfChangeId: `${123}`,
          },
        };
        const wrapper = shallowMount(RequestOfChangeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.requestOfChange).toMatchObject(requestOfChangeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        requestOfChangeServiceStub.find.resolves(requestOfChangeSample);
        const wrapper = shallowMount(RequestOfChangeDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
