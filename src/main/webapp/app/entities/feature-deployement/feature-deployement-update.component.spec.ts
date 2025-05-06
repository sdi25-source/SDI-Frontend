import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import FeatureDeployementUpdate from './feature-deployement-update.vue';
import FeatureDeployementService from './feature-deployement.service';
import AlertService from '@/shared/alert/alert.service';

import FeatureService from '@/entities/feature/feature.service';
import ModuleDeployementService from '@/entities/module-deployement/module-deployement.service';

type FeatureDeployementUpdateComponentType = InstanceType<typeof FeatureDeployementUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const featureDeployementSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<FeatureDeployementUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('FeatureDeployement Management Update Component', () => {
    let comp: FeatureDeployementUpdateComponentType;
    let featureDeployementServiceStub: SinonStubbedInstance<FeatureDeployementService>;

    beforeEach(() => {
      route = {};
      featureDeployementServiceStub = sinon.createStubInstance<FeatureDeployementService>(FeatureDeployementService);
      featureDeployementServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          featureDeployementService: () => featureDeployementServiceStub,
          featureService: () =>
            sinon.createStubInstance<FeatureService>(FeatureService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          moduleDeployementService: () =>
            sinon.createStubInstance<ModuleDeployementService>(ModuleDeployementService, {
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
        const wrapper = shallowMount(FeatureDeployementUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.featureDeployement = featureDeployementSample;
        featureDeployementServiceStub.update.resolves(featureDeployementSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(featureDeployementServiceStub.update.calledWith(featureDeployementSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        featureDeployementServiceStub.create.resolves(entity);
        const wrapper = shallowMount(FeatureDeployementUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.featureDeployement = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(featureDeployementServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        featureDeployementServiceStub.find.resolves(featureDeployementSample);
        featureDeployementServiceStub.retrieve.resolves([featureDeployementSample]);

        // WHEN
        route = {
          params: {
            featureDeployementId: `${featureDeployementSample.id}`,
          },
        };
        const wrapper = shallowMount(FeatureDeployementUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.featureDeployement).toMatchObject(featureDeployementSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        featureDeployementServiceStub.find.resolves(featureDeployementSample);
        const wrapper = shallowMount(FeatureDeployementUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
