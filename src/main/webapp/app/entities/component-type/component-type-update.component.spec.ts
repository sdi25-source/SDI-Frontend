import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ComponentTypeUpdate from './component-type-update.vue';
import ComponentTypeService from './component-type.service';
import AlertService from '@/shared/alert/alert.service';

type ComponentTypeUpdateComponentType = InstanceType<typeof ComponentTypeUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const componentTypeSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ComponentTypeUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ComponentType Management Update Component', () => {
    let comp: ComponentTypeUpdateComponentType;
    let componentTypeServiceStub: SinonStubbedInstance<ComponentTypeService>;

    beforeEach(() => {
      route = {};
      componentTypeServiceStub = sinon.createStubInstance<ComponentTypeService>(ComponentTypeService);
      componentTypeServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          'font-awesome-icon': true,
          'b-input-group': true,
          'b-input-group-prepend': true,
          'b-form-datepicker': true,
          'b-form-input': true,
        },
        provide: {
          alertService,
          componentTypeService: () => componentTypeServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(ComponentTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.componentType = componentTypeSample;
        componentTypeServiceStub.update.resolves(componentTypeSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(componentTypeServiceStub.update.calledWith(componentTypeSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        componentTypeServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ComponentTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.componentType = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(componentTypeServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        componentTypeServiceStub.find.resolves(componentTypeSample);
        componentTypeServiceStub.retrieve.resolves([componentTypeSample]);

        // WHEN
        route = {
          params: {
            componentTypeId: `${componentTypeSample.id}`,
          },
        };
        const wrapper = shallowMount(ComponentTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.componentType).toMatchObject(componentTypeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        componentTypeServiceStub.find.resolves(componentTypeSample);
        const wrapper = shallowMount(ComponentTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
