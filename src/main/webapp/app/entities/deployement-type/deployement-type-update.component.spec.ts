import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import DeployementTypeUpdate from './deployement-type-update.vue';
import DeployementTypeService from './deployement-type.service';
import AlertService from '@/shared/alert/alert.service';

type DeployementTypeUpdateComponentType = InstanceType<typeof DeployementTypeUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const deployementTypeSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<DeployementTypeUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('DeployementType Management Update Component', () => {
    let comp: DeployementTypeUpdateComponentType;
    let deployementTypeServiceStub: SinonStubbedInstance<DeployementTypeService>;

    beforeEach(() => {
      route = {};
      deployementTypeServiceStub = sinon.createStubInstance<DeployementTypeService>(DeployementTypeService);
      deployementTypeServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          deployementTypeService: () => deployementTypeServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(DeployementTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.deployementType = deployementTypeSample;
        deployementTypeServiceStub.update.resolves(deployementTypeSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(deployementTypeServiceStub.update.calledWith(deployementTypeSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        deployementTypeServiceStub.create.resolves(entity);
        const wrapper = shallowMount(DeployementTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.deployementType = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(deployementTypeServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        deployementTypeServiceStub.find.resolves(deployementTypeSample);
        deployementTypeServiceStub.retrieve.resolves([deployementTypeSample]);

        // WHEN
        route = {
          params: {
            deployementTypeId: `${deployementTypeSample.id}`,
          },
        };
        const wrapper = shallowMount(DeployementTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.deployementType).toMatchObject(deployementTypeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        deployementTypeServiceStub.find.resolves(deployementTypeSample);
        const wrapper = shallowMount(DeployementTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
