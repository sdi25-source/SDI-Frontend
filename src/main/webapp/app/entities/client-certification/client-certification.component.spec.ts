import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ClientCertification from './client-certification.vue';
import ClientCertificationService from './client-certification.service';
import AlertService from '@/shared/alert/alert.service';

type ClientCertificationComponentType = InstanceType<typeof ClientCertification>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ClientCertification Management Component', () => {
    let clientCertificationServiceStub: SinonStubbedInstance<ClientCertificationService>;
    let mountOptions: MountingOptions<ClientCertificationComponentType>['global'];

    beforeEach(() => {
      clientCertificationServiceStub = sinon.createStubInstance<ClientCertificationService>(ClientCertificationService);
      clientCertificationServiceStub.retrieve.resolves({ headers: {} });

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
          clientCertificationService: () => clientCertificationServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientCertificationServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ClientCertification, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(clientCertificationServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.clientCertifications[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ClientCertificationComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ClientCertification, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        clientCertificationServiceStub.retrieve.reset();
        clientCertificationServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        clientCertificationServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeClientCertification();
        await comp.$nextTick(); // clear components

        // THEN
        expect(clientCertificationServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(clientCertificationServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
