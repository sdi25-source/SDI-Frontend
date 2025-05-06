import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ClientEventType from './client-event-type.vue';
import ClientEventTypeService from './client-event-type.service';
import AlertService from '@/shared/alert/alert.service';

type ClientEventTypeComponentType = InstanceType<typeof ClientEventType>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ClientEventType Management Component', () => {
    let clientEventTypeServiceStub: SinonStubbedInstance<ClientEventTypeService>;
    let mountOptions: MountingOptions<ClientEventTypeComponentType>['global'];

    beforeEach(() => {
      clientEventTypeServiceStub = sinon.createStubInstance<ClientEventTypeService>(ClientEventTypeService);
      clientEventTypeServiceStub.retrieve.resolves({ headers: {} });

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
          clientEventTypeService: () => clientEventTypeServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientEventTypeServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ClientEventType, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(clientEventTypeServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.clientEventTypes[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ClientEventTypeComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ClientEventType, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        clientEventTypeServiceStub.retrieve.reset();
        clientEventTypeServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        clientEventTypeServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeClientEventType();
        await comp.$nextTick(); // clear components

        // THEN
        expect(clientEventTypeServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(clientEventTypeServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
