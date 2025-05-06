import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import CustomisationLevelUpdate from './customisation-level-update.vue';
import CustomisationLevelService from './customisation-level.service';
import AlertService from '@/shared/alert/alert.service';

type CustomisationLevelUpdateComponentType = InstanceType<typeof CustomisationLevelUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const customisationLevelSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<CustomisationLevelUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('CustomisationLevel Management Update Component', () => {
    let comp: CustomisationLevelUpdateComponentType;
    let customisationLevelServiceStub: SinonStubbedInstance<CustomisationLevelService>;

    beforeEach(() => {
      route = {};
      customisationLevelServiceStub = sinon.createStubInstance<CustomisationLevelService>(CustomisationLevelService);
      customisationLevelServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          customisationLevelService: () => customisationLevelServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(CustomisationLevelUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.customisationLevel = customisationLevelSample;
        customisationLevelServiceStub.update.resolves(customisationLevelSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(customisationLevelServiceStub.update.calledWith(customisationLevelSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        customisationLevelServiceStub.create.resolves(entity);
        const wrapper = shallowMount(CustomisationLevelUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.customisationLevel = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(customisationLevelServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        customisationLevelServiceStub.find.resolves(customisationLevelSample);
        customisationLevelServiceStub.retrieve.resolves([customisationLevelSample]);

        // WHEN
        route = {
          params: {
            customisationLevelId: `${customisationLevelSample.id}`,
          },
        };
        const wrapper = shallowMount(CustomisationLevelUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.customisationLevel).toMatchObject(customisationLevelSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        customisationLevelServiceStub.find.resolves(customisationLevelSample);
        const wrapper = shallowMount(CustomisationLevelUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
