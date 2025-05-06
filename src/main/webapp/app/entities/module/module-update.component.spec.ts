import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ModuleUpdate from './module-update.vue';
import ModuleService from './module.service';
import AlertService from '@/shared/alert/alert.service';

type ModuleUpdateComponentType = InstanceType<typeof ModuleUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const moduleSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ModuleUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Module Management Update Component', () => {
    let comp: ModuleUpdateComponentType;
    let moduleServiceStub: SinonStubbedInstance<ModuleService>;

    beforeEach(() => {
      route = {};
      moduleServiceStub = sinon.createStubInstance<ModuleService>(ModuleService);
      moduleServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          moduleService: () => moduleServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(ModuleUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.module = moduleSample;
        moduleServiceStub.update.resolves(moduleSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(moduleServiceStub.update.calledWith(moduleSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        moduleServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ModuleUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.module = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(moduleServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        moduleServiceStub.find.resolves(moduleSample);
        moduleServiceStub.retrieve.resolves([moduleSample]);

        // WHEN
        route = {
          params: {
            moduleId: `${moduleSample.id}`,
          },
        };
        const wrapper = shallowMount(ModuleUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.module).toMatchObject(moduleSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        moduleServiceStub.find.resolves(moduleSample);
        const wrapper = shallowMount(ModuleUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
