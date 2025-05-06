import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import DeployementType from './deployement-type.vue';
import DeployementTypeService from './deployement-type.service';
import AlertService from '@/shared/alert/alert.service';

type DeployementTypeComponentType = InstanceType<typeof DeployementType>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('DeployementType Management Component', () => {
    let deployementTypeServiceStub: SinonStubbedInstance<DeployementTypeService>;
    let mountOptions: MountingOptions<DeployementTypeComponentType>['global'];

    beforeEach(() => {
      deployementTypeServiceStub = sinon.createStubInstance<DeployementTypeService>(DeployementTypeService);
      deployementTypeServiceStub.retrieve.resolves({ headers: {} });

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
          deployementTypeService: () => deployementTypeServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        deployementTypeServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(DeployementType, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(deployementTypeServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.deployementTypes[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: DeployementTypeComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(DeployementType, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        deployementTypeServiceStub.retrieve.reset();
        deployementTypeServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        deployementTypeServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeDeployementType();
        await comp.$nextTick(); // clear components

        // THEN
        expect(deployementTypeServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(deployementTypeServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
