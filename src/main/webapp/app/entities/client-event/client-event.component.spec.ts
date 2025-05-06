import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ClientEvent from './client-event.vue';
import ClientEventService from './client-event.service';
import AlertService from '@/shared/alert/alert.service';

type ClientEventComponentType = InstanceType<typeof ClientEvent>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ClientEvent Management Component', () => {
    let clientEventServiceStub: SinonStubbedInstance<ClientEventService>;
    let mountOptions: MountingOptions<ClientEventComponentType>['global'];

    beforeEach(() => {
      clientEventServiceStub = sinon.createStubInstance<ClientEventService>(ClientEventService);
      clientEventServiceStub.retrieve.resolves({ headers: {} });

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
          clientEventService: () => clientEventServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientEventServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ClientEvent, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(clientEventServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.clientEvents[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ClientEventComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ClientEvent, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        clientEventServiceStub.retrieve.reset();
        clientEventServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        clientEventServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeClientEvent();
        await comp.$nextTick(); // clear components

        // THEN
        expect(clientEventServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(clientEventServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
