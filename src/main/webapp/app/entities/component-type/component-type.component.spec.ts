import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ComponentType from './component-type.vue';
import ComponentTypeService from './component-type.service';
import AlertService from '@/shared/alert/alert.service';

type ComponentTypeComponentType = InstanceType<typeof ComponentType>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ComponentType Management Component', () => {
    let componentTypeServiceStub: SinonStubbedInstance<ComponentTypeService>;
    let mountOptions: MountingOptions<ComponentTypeComponentType>['global'];

    beforeEach(() => {
      componentTypeServiceStub = sinon.createStubInstance<ComponentTypeService>(ComponentTypeService);
      componentTypeServiceStub.retrieve.resolves({ headers: {} });

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
          componentTypeService: () => componentTypeServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        componentTypeServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ComponentType, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(componentTypeServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.componentTypes[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ComponentTypeComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ComponentType, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        componentTypeServiceStub.retrieve.reset();
        componentTypeServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        componentTypeServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeComponentType();
        await comp.$nextTick(); // clear components

        // THEN
        expect(componentTypeServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(componentTypeServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
