import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import HA from './ha.vue';
import HAService from './ha.service';
import AlertService from '@/shared/alert/alert.service';

type HAComponentType = InstanceType<typeof HA>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('HA Management Component', () => {
    let hAServiceStub: SinonStubbedInstance<HAService>;
    let mountOptions: MountingOptions<HAComponentType>['global'];

    beforeEach(() => {
      hAServiceStub = sinon.createStubInstance<HAService>(HAService);
      hAServiceStub.retrieve.resolves({ headers: {} });

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
          hAService: () => hAServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        hAServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(HA, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(hAServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.hAS[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: HAComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(HA, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        hAServiceStub.retrieve.reset();
        hAServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        hAServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeHA();
        await comp.$nextTick(); // clear components

        // THEN
        expect(hAServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(hAServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
