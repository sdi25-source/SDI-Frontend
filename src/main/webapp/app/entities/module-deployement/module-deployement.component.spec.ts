import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ModuleDeployement from './module-deployement.vue';
import ModuleDeployementService from './module-deployement.service';
import AlertService from '@/shared/alert/alert.service';

type ModuleDeployementComponentType = InstanceType<typeof ModuleDeployement>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ModuleDeployement Management Component', () => {
    let moduleDeployementServiceStub: SinonStubbedInstance<ModuleDeployementService>;
    let mountOptions: MountingOptions<ModuleDeployementComponentType>['global'];

    beforeEach(() => {
      moduleDeployementServiceStub = sinon.createStubInstance<ModuleDeployementService>(ModuleDeployementService);
      moduleDeployementServiceStub.retrieve.resolves({ headers: {} });

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
          moduleDeployementService: () => moduleDeployementServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        moduleDeployementServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ModuleDeployement, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(moduleDeployementServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.moduleDeployements[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ModuleDeployementComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ModuleDeployement, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        moduleDeployementServiceStub.retrieve.reset();
        moduleDeployementServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        moduleDeployementServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeModuleDeployement();
        await comp.$nextTick(); // clear components

        // THEN
        expect(moduleDeployementServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(moduleDeployementServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
