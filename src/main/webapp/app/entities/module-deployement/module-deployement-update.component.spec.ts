import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ModuleDeployementUpdate from './module-deployement-update.vue';
import ModuleDeployementService from './module-deployement.service';
import AlertService from '@/shared/alert/alert.service';

import ModuleVersionService from '@/entities/module-version/module-version.service';
import ProductDeployementDetailService from '@/entities/product-deployement-detail/product-deployement-detail.service';

type ModuleDeployementUpdateComponentType = InstanceType<typeof ModuleDeployementUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const moduleDeployementSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ModuleDeployementUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ModuleDeployement Management Update Component', () => {
    let comp: ModuleDeployementUpdateComponentType;
    let moduleDeployementServiceStub: SinonStubbedInstance<ModuleDeployementService>;

    beforeEach(() => {
      route = {};
      moduleDeployementServiceStub = sinon.createStubInstance<ModuleDeployementService>(ModuleDeployementService);
      moduleDeployementServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          moduleDeployementService: () => moduleDeployementServiceStub,
          moduleVersionService: () =>
            sinon.createStubInstance<ModuleVersionService>(ModuleVersionService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          productDeployementDetailService: () =>
            sinon.createStubInstance<ProductDeployementDetailService>(ProductDeployementDetailService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(ModuleDeployementUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.moduleDeployement = moduleDeployementSample;
        moduleDeployementServiceStub.update.resolves(moduleDeployementSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(moduleDeployementServiceStub.update.calledWith(moduleDeployementSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        moduleDeployementServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ModuleDeployementUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.moduleDeployement = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(moduleDeployementServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        moduleDeployementServiceStub.find.resolves(moduleDeployementSample);
        moduleDeployementServiceStub.retrieve.resolves([moduleDeployementSample]);

        // WHEN
        route = {
          params: {
            moduleDeployementId: `${moduleDeployementSample.id}`,
          },
        };
        const wrapper = shallowMount(ModuleDeployementUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.moduleDeployement).toMatchObject(moduleDeployementSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        moduleDeployementServiceStub.find.resolves(moduleDeployementSample);
        const wrapper = shallowMount(ModuleDeployementUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
