import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import InfraComponentVersionDetails from './infra-component-version-details.vue';
import InfraComponentVersionService from './infra-component-version.service';
import AlertService from '@/shared/alert/alert.service';

type InfraComponentVersionDetailsComponentType = InstanceType<typeof InfraComponentVersionDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const infraComponentVersionSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('InfraComponentVersion Management Detail Component', () => {
    let infraComponentVersionServiceStub: SinonStubbedInstance<InfraComponentVersionService>;
    let mountOptions: MountingOptions<InfraComponentVersionDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      infraComponentVersionServiceStub = sinon.createStubInstance<InfraComponentVersionService>(InfraComponentVersionService);

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
          infraComponentVersionService: () => infraComponentVersionServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        infraComponentVersionServiceStub.find.resolves(infraComponentVersionSample);
        route = {
          params: {
            infraComponentVersionId: `${123}`,
          },
        };
        const wrapper = shallowMount(InfraComponentVersionDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.infraComponentVersion).toMatchObject(infraComponentVersionSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        infraComponentVersionServiceStub.find.resolves(infraComponentVersionSample);
        const wrapper = shallowMount(InfraComponentVersionDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
