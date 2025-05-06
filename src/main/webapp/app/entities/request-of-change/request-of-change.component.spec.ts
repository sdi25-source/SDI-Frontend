import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import RequestOfChange from './request-of-change.vue';
import RequestOfChangeService from './request-of-change.service';
import AlertService from '@/shared/alert/alert.service';

type RequestOfChangeComponentType = InstanceType<typeof RequestOfChange>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('RequestOfChange Management Component', () => {
    let requestOfChangeServiceStub: SinonStubbedInstance<RequestOfChangeService>;
    let mountOptions: MountingOptions<RequestOfChangeComponentType>['global'];

    beforeEach(() => {
      requestOfChangeServiceStub = sinon.createStubInstance<RequestOfChangeService>(RequestOfChangeService);
      requestOfChangeServiceStub.retrieve.resolves({ headers: {} });

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
          requestOfChangeService: () => requestOfChangeServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        requestOfChangeServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(RequestOfChange, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(requestOfChangeServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.requestOfChanges[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: RequestOfChangeComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(RequestOfChange, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        requestOfChangeServiceStub.retrieve.reset();
        requestOfChangeServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        requestOfChangeServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeRequestOfChange();
        await comp.$nextTick(); // clear components

        // THEN
        expect(requestOfChangeServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(requestOfChangeServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
