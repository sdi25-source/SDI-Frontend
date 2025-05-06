import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientTypeUpdate from './client-type-update.vue';
import ClientTypeService from './client-type.service';
import AlertService from '@/shared/alert/alert.service';

type ClientTypeUpdateComponentType = InstanceType<typeof ClientTypeUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientTypeSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ClientTypeUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ClientType Management Update Component', () => {
    let comp: ClientTypeUpdateComponentType;
    let clientTypeServiceStub: SinonStubbedInstance<ClientTypeService>;

    beforeEach(() => {
      route = {};
      clientTypeServiceStub = sinon.createStubInstance<ClientTypeService>(ClientTypeService);
      clientTypeServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          clientTypeService: () => clientTypeServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(ClientTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientType = clientTypeSample;
        clientTypeServiceStub.update.resolves(clientTypeSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientTypeServiceStub.update.calledWith(clientTypeSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        clientTypeServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ClientTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientType = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientTypeServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        clientTypeServiceStub.find.resolves(clientTypeSample);
        clientTypeServiceStub.retrieve.resolves([clientTypeSample]);

        // WHEN
        route = {
          params: {
            clientTypeId: `${clientTypeSample.id}`,
          },
        };
        const wrapper = shallowMount(ClientTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.clientType).toMatchObject(clientTypeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientTypeServiceStub.find.resolves(clientTypeSample);
        const wrapper = shallowMount(ClientTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
