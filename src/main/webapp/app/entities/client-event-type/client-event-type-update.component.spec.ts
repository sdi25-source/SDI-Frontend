import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientEventTypeUpdate from './client-event-type-update.vue';
import ClientEventTypeService from './client-event-type.service';
import AlertService from '@/shared/alert/alert.service';

type ClientEventTypeUpdateComponentType = InstanceType<typeof ClientEventTypeUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientEventTypeSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ClientEventTypeUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ClientEventType Management Update Component', () => {
    let comp: ClientEventTypeUpdateComponentType;
    let clientEventTypeServiceStub: SinonStubbedInstance<ClientEventTypeService>;

    beforeEach(() => {
      route = {};
      clientEventTypeServiceStub = sinon.createStubInstance<ClientEventTypeService>(ClientEventTypeService);
      clientEventTypeServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          clientEventTypeService: () => clientEventTypeServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(ClientEventTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientEventType = clientEventTypeSample;
        clientEventTypeServiceStub.update.resolves(clientEventTypeSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientEventTypeServiceStub.update.calledWith(clientEventTypeSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        clientEventTypeServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ClientEventTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientEventType = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientEventTypeServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        clientEventTypeServiceStub.find.resolves(clientEventTypeSample);
        clientEventTypeServiceStub.retrieve.resolves([clientEventTypeSample]);

        // WHEN
        route = {
          params: {
            clientEventTypeId: `${clientEventTypeSample.id}`,
          },
        };
        const wrapper = shallowMount(ClientEventTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.clientEventType).toMatchObject(clientEventTypeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientEventTypeServiceStub.find.resolves(clientEventTypeSample);
        const wrapper = shallowMount(ClientEventTypeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
