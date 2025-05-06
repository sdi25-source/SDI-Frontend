import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ModuleVersionUpdate from './module-version-update.vue';
import ModuleVersionService from './module-version.service';
import AlertService from '@/shared/alert/alert.service';

import ModuleService from '@/entities/module/module.service';
import FeatureService from '@/entities/feature/feature.service';
import DomaineService from '@/entities/domaine/domaine.service';

type ModuleVersionUpdateComponentType = InstanceType<typeof ModuleVersionUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const moduleVersionSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ModuleVersionUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ModuleVersion Management Update Component', () => {
    let comp: ModuleVersionUpdateComponentType;
    let moduleVersionServiceStub: SinonStubbedInstance<ModuleVersionService>;

    beforeEach(() => {
      route = {};
      moduleVersionServiceStub = sinon.createStubInstance<ModuleVersionService>(ModuleVersionService);
      moduleVersionServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          moduleVersionService: () => moduleVersionServiceStub,
          moduleService: () =>
            sinon.createStubInstance<ModuleService>(ModuleService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          featureService: () =>
            sinon.createStubInstance<FeatureService>(FeatureService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          domaineService: () =>
            sinon.createStubInstance<DomaineService>(DomaineService, {
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
        const wrapper = shallowMount(ModuleVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.moduleVersion = moduleVersionSample;
        moduleVersionServiceStub.update.resolves(moduleVersionSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(moduleVersionServiceStub.update.calledWith(moduleVersionSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        moduleVersionServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ModuleVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.moduleVersion = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(moduleVersionServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        moduleVersionServiceStub.find.resolves(moduleVersionSample);
        moduleVersionServiceStub.retrieve.resolves([moduleVersionSample]);

        // WHEN
        route = {
          params: {
            moduleVersionId: `${moduleVersionSample.id}`,
          },
        };
        const wrapper = shallowMount(ModuleVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.moduleVersion).toMatchObject(moduleVersionSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        moduleVersionServiceStub.find.resolves(moduleVersionSample);
        const wrapper = shallowMount(ModuleVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
