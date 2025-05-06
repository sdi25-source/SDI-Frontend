import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ClientType from './client-type.vue';
import ClientTypeService from './client-type.service';
import AlertService from '@/shared/alert/alert.service';

type ClientTypeComponentType = InstanceType<typeof ClientType>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ClientType Management Component', () => {
    let clientTypeServiceStub: SinonStubbedInstance<ClientTypeService>;
    let mountOptions: MountingOptions<ClientTypeComponentType>['global'];

    beforeEach(() => {
      clientTypeServiceStub = sinon.createStubInstance<ClientTypeService>(ClientTypeService);
      clientTypeServiceStub.retrieve.resolves({ headers: {} });

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
          clientTypeService: () => clientTypeServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientTypeServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ClientType, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(clientTypeServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.clientTypes[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ClientTypeComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ClientType, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        clientTypeServiceStub.retrieve.reset();
        clientTypeServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        clientTypeServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeClientType();
        await comp.$nextTick(); // clear components

        // THEN
        expect(clientTypeServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(clientTypeServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
