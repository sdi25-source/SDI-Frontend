import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import InfraComponent from './infra-component.vue';
import InfraComponentService from './infra-component.service';
import AlertService from '@/shared/alert/alert.service';

type InfraComponentComponentType = InstanceType<typeof InfraComponent>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('InfraComponent Management Component', () => {
    let infraComponentServiceStub: SinonStubbedInstance<InfraComponentService>;
    let mountOptions: MountingOptions<InfraComponentComponentType>['global'];

    beforeEach(() => {
      infraComponentServiceStub = sinon.createStubInstance<InfraComponentService>(InfraComponentService);
      infraComponentServiceStub.retrieve.resolves({ headers: {} });

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
          infraComponentService: () => infraComponentServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        infraComponentServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(InfraComponent, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(infraComponentServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.infraComponents[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: InfraComponentComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(InfraComponent, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        infraComponentServiceStub.retrieve.reset();
        infraComponentServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        infraComponentServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeInfraComponent();
        await comp.$nextTick(); // clear components

        // THEN
        expect(infraComponentServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(infraComponentServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
