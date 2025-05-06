import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import CertificationDetails from './certification-details.vue';
import CertificationService from './certification.service';
import AlertService from '@/shared/alert/alert.service';

type CertificationDetailsComponentType = InstanceType<typeof CertificationDetails>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const certificationSample = { id: 123 };

describe('Component Tests', () => {
  let alertService: AlertService;

  afterEach(() => {
    vitest.resetAllMocks();
  });

  describe('Certification Management Detail Component', () => {
    let certificationServiceStub: SinonStubbedInstance<CertificationService>;
    let mountOptions: MountingOptions<CertificationDetailsComponentType>['global'];

    beforeEach(() => {
      route = {};
      certificationServiceStub = sinon.createStubInstance<CertificationService>(CertificationService);

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
          certificationService: () => certificationServiceStub,
        },
      };
    });

    describe('Navigate to details', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        certificationServiceStub.find.resolves(certificationSample);
        route = {
          params: {
            certificationId: `${123}`,
          },
        };
        const wrapper = shallowMount(CertificationDetails, { global: mountOptions });
        const comp = wrapper.vm;
        // WHEN
        await comp.$nextTick();

        // THEN
        expect(comp.certification).toMatchObject(certificationSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        certificationServiceStub.find.resolves(certificationSample);
        const wrapper = shallowMount(CertificationDetails, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
