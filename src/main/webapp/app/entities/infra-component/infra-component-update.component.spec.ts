import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import InfraComponentUpdate from './infra-component-update.vue';
import InfraComponentService from './infra-component.service';
import AlertService from '@/shared/alert/alert.service';

import ComponentTypeService from '@/entities/component-type/component-type.service';

type InfraComponentUpdateComponentType = InstanceType<typeof InfraComponentUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const infraComponentSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<InfraComponentUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('InfraComponent Management Update Component', () => {
    let comp: InfraComponentUpdateComponentType;
    let infraComponentServiceStub: SinonStubbedInstance<InfraComponentService>;

    beforeEach(() => {
      route = {};
      infraComponentServiceStub = sinon.createStubInstance<InfraComponentService>(InfraComponentService);
      infraComponentServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          infraComponentService: () => infraComponentServiceStub,
          componentTypeService: () =>
            sinon.createStubInstance<ComponentTypeService>(ComponentTypeService, {
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
        const wrapper = shallowMount(InfraComponentUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.infraComponent = infraComponentSample;
        infraComponentServiceStub.update.resolves(infraComponentSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(infraComponentServiceStub.update.calledWith(infraComponentSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        infraComponentServiceStub.create.resolves(entity);
        const wrapper = shallowMount(InfraComponentUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.infraComponent = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(infraComponentServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        infraComponentServiceStub.find.resolves(infraComponentSample);
        infraComponentServiceStub.retrieve.resolves([infraComponentSample]);

        // WHEN
        route = {
          params: {
            infraComponentId: `${infraComponentSample.id}`,
          },
        };
        const wrapper = shallowMount(InfraComponentUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.infraComponent).toMatchObject(infraComponentSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        infraComponentServiceStub.find.resolves(infraComponentSample);
        const wrapper = shallowMount(InfraComponentUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
