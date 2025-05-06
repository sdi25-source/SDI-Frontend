import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ClientSize from './client-size.vue';
import ClientSizeService from './client-size.service';
import AlertService from '@/shared/alert/alert.service';

type ClientSizeComponentType = InstanceType<typeof ClientSize>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ClientSize Management Component', () => {
    let clientSizeServiceStub: SinonStubbedInstance<ClientSizeService>;
    let mountOptions: MountingOptions<ClientSizeComponentType>['global'];

    beforeEach(() => {
      clientSizeServiceStub = sinon.createStubInstance<ClientSizeService>(ClientSizeService);
      clientSizeServiceStub.retrieve.resolves({ headers: {} });

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
          clientSizeService: () => clientSizeServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        clientSizeServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ClientSize, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(clientSizeServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.clientSizes[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ClientSizeComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ClientSize, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        clientSizeServiceStub.retrieve.reset();
        clientSizeServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        clientSizeServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeClientSize();
        await comp.$nextTick(); // clear components

        // THEN
        expect(clientSizeServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(clientSizeServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
