import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ModuleVersion from './module-version.vue';
import ModuleVersionService from './module-version.service';
import AlertService from '@/shared/alert/alert.service';

type ModuleVersionComponentType = InstanceType<typeof ModuleVersion>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ModuleVersion Management Component', () => {
    let moduleVersionServiceStub: SinonStubbedInstance<ModuleVersionService>;
    let mountOptions: MountingOptions<ModuleVersionComponentType>['global'];

    beforeEach(() => {
      moduleVersionServiceStub = sinon.createStubInstance<ModuleVersionService>(ModuleVersionService);
      moduleVersionServiceStub.retrieve.resolves({ headers: {} });

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
          moduleVersionService: () => moduleVersionServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        moduleVersionServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ModuleVersion, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(moduleVersionServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.moduleVersions[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ModuleVersionComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ModuleVersion, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        moduleVersionServiceStub.retrieve.reset();
        moduleVersionServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        moduleVersionServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeModuleVersion();
        await comp.$nextTick(); // clear components

        // THEN
        expect(moduleVersionServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(moduleVersionServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
