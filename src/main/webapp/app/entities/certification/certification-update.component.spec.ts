import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import CertificationUpdate from './certification-update.vue';
import CertificationService from './certification.service';
import AlertService from '@/shared/alert/alert.service';

type CertificationUpdateComponentType = InstanceType<typeof CertificationUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const certificationSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<CertificationUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Certification Management Update Component', () => {
    let comp: CertificationUpdateComponentType;
    let certificationServiceStub: SinonStubbedInstance<CertificationService>;

    beforeEach(() => {
      route = {};
      certificationServiceStub = sinon.createStubInstance<CertificationService>(CertificationService);
      certificationServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          'font-awesome-icon': true,
          'b-input-group': true,
          'b-input-group-prepend': true,
          'b-form-datepicker': true,
          'b-form-input': true,
        },
        provide: {
          alertService,
          certificationService: () => certificationServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(CertificationUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.certification = certificationSample;
        certificationServiceStub.update.resolves(certificationSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(certificationServiceStub.update.calledWith(certificationSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        certificationServiceStub.create.resolves(entity);
        const wrapper = shallowMount(CertificationUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.certification = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(certificationServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        certificationServiceStub.find.resolves(certificationSample);
        certificationServiceStub.retrieve.resolves([certificationSample]);

        // WHEN
        route = {
          params: {
            certificationId: `${certificationSample.id}`,
          },
        };
        const wrapper = shallowMount(CertificationUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.certification).toMatchObject(certificationSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        certificationServiceStub.find.resolves(certificationSample);
        const wrapper = shallowMount(CertificationUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
