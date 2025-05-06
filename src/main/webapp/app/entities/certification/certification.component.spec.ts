import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import Certification from './certification.vue';
import CertificationService from './certification.service';
import AlertService from '@/shared/alert/alert.service';

type CertificationComponentType = InstanceType<typeof Certification>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('Certification Management Component', () => {
    let certificationServiceStub: SinonStubbedInstance<CertificationService>;
    let mountOptions: MountingOptions<CertificationComponentType>['global'];

    beforeEach(() => {
      certificationServiceStub = sinon.createStubInstance<CertificationService>(CertificationService);
      certificationServiceStub.retrieve.resolves({ headers: {} });

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          bModal: bModalStub as any,
          'font-awesome-icon': true,
          'b-badge': true,
          'b-button': true,
          'router-link': true,
        },
        directives: {
          'b-modal': {},
        },
        provide: {
          alertService,
          certificationService: () => certificationServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        certificationServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(Certification, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(certificationServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.certifications[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: CertificationComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(Certification, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        certificationServiceStub.retrieve.reset();
        certificationServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        certificationServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeCertification();
        await comp.$nextTick(); // clear components

        // THEN
        expect(certificationServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(certificationServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
