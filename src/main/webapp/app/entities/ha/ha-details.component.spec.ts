import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import HADetails from './ha-details.vue';
import HAService from './ha.service';
import AlertService from '@/shared/alert/alert.service';

type HADetailsComponentType = InstanceType<typeof HADetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const hASample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('HA Management Detail Component', () => {
    let hAServiceStub: SinonStubbedInstance<HAService>;
    let mountOptions: MountingOptions<HADetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      hAServiceStub = sinon.createStubInstance<HAService>(HAService);

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
          hAService: () => hAServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        hAServiceStub.find.resolves(hASample);
        route = {
          params: {
            hAId: `${123}`,
          },
        };
        const wrapper = shallowMount(HADetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.hA).toMatchObject(hASample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        hAServiceStub.find.resolves(hASample);
        const wrapper = shallowMount(HADetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
