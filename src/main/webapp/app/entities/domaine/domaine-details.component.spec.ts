import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import DomaineDetails from './domaine-details.vue';
import DomaineService from './domaine.service';
import AlertService from '@/shared/alert/alert.service';

type DomaineDetailsComponentType = InstanceType<typeof DomaineDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const domaineSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Domaine Management Detail Component', () => {
    let domaineServiceStub: SinonStubbedInstance<DomaineService>;
    let mountOptions: MountingOptions<DomaineDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      domaineServiceStub = sinon.createStubInstance<DomaineService>(DomaineService);

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
          domaineService: () => domaineServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        domaineServiceStub.find.resolves(domaineSample);
        route = {
          params: {
            domaineId: `${123}`,
          },
        };
        const wrapper = shallowMount(DomaineDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.domaine).toMatchObject(domaineSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        domaineServiceStub.find.resolves(domaineSample);
        const wrapper = shallowMount(DomaineDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
