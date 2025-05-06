import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import Domaine from './domaine.vue';
import DomaineService from './domaine.service';
import AlertService from '@/shared/alert/alert.service';

type DomaineComponentType = InstanceType<typeof Domaine>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('Domaine Management Component', () => {
    let domaineServiceStub: SinonStubbedInstance<DomaineService>;
    let mountOptions: MountingOptions<DomaineComponentType>['global'];

    beforeEach(() => {
      domaineServiceStub = sinon.createStubInstance<DomaineService>(DomaineService);
      domaineServiceStub.retrieve.resolves({ headers: {} });

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
          domaineService: () => domaineServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        domaineServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(Domaine, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(domaineServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.domaines[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: DomaineComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(Domaine, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        domaineServiceStub.retrieve.reset();
        domaineServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        domaineServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeDomaine();
        await comp.$nextTick(); // clear components

        // THEN
        expect(domaineServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(domaineServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
