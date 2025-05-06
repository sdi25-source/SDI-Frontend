import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientCertificationDetails from './client-certification-details.vue';
import ClientCertificationService from './client-certification.service';
import AlertService from '@/shared/alert/alert.service';

type ClientCertificationDetailsComponentType = InstanceType<typeof ClientCertificationDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientCertificationSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('ClientCertification Management Detail Component', () => {
    let clientCertificationServiceStub: SinonStubbedInstance<ClientCertificationService>;
    let mountOptions: MountingOptions<ClientCertificationDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      clientCertificationServiceStub = sinon.createStubInstance<ClientCertificationService>(ClientCertificationService);

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
          clientCertificationService: () => clientCertificationServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientCertificationServiceStub.find.resolves(clientCertificationSample);
        route = {
          params: {
            clientCertificationId: `${123}`,
          },
        };
        const wrapper = shallowMount(ClientCertificationDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.clientCertification).toMatchObject(clientCertificationSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientCertificationServiceStub.find.resolves(clientCertificationSample);
        const wrapper = shallowMount(ClientCertificationDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
