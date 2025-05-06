import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import FeatureUpdate from './feature-update.vue';
import FeatureService from './feature.service';
import AlertService from '@/shared/alert/alert.service';

type FeatureUpdateComponentType = InstanceType<typeof FeatureUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const featureSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<FeatureUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Feature Management Update Component', () => {
    let comp: FeatureUpdateComponentType;
    let featureServiceStub: SinonStubbedInstance<FeatureService>;

    beforeEach(() => {
      route = {};
      featureServiceStub = sinon.createStubInstance<FeatureService>(FeatureService);
      featureServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          featureService: () => featureServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(FeatureUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.feature = featureSample;
        featureServiceStub.update.resolves(featureSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(featureServiceStub.update.calledWith(featureSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        featureServiceStub.create.resolves(entity);
        const wrapper = shallowMount(FeatureUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.feature = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(featureServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        featureServiceStub.find.resolves(featureSample);
        featureServiceStub.retrieve.resolves([featureSample]);

        // WHEN
        route = {
          params: {
            featureId: `${featureSample.id}`,
          },
        };
        const wrapper = shallowMount(FeatureUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.feature).toMatchObject(featureSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        featureServiceStub.find.resolves(featureSample);
        const wrapper = shallowMount(FeatureUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
