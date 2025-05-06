import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientEventUpdate from './client-event-update.vue';
import ClientEventService from './client-event.service';
import AlertService from '@/shared/alert/alert.service';

import ClientService from '@/entities/client/client.service';
import ClientEventTypeService from '@/entities/client-event-type/client-event-type.service';

type ClientEventUpdateComponentType = InstanceType<typeof ClientEventUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientEventSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ClientEventUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ClientEvent Management Update Component', () => {
    let comp: ClientEventUpdateComponentType;
    let clientEventServiceStub: SinonStubbedInstance<ClientEventService>;

    beforeEach(() => {
      route = {};
      clientEventServiceStub = sinon.createStubInstance<ClientEventService>(ClientEventService);
      clientEventServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          clientEventService: () => clientEventServiceStub,
          clientService: () =>
            sinon.createStubInstance<ClientService>(ClientService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          clientEventTypeService: () =>
            sinon.createStubInstance<ClientEventTypeService>(ClientEventTypeService, {
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
        const wrapper = shallowMount(ClientEventUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientEvent = clientEventSample;
        clientEventServiceStub.update.resolves(clientEventSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientEventServiceStub.update.calledWith(clientEventSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        clientEventServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ClientEventUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientEvent = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientEventServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        clientEventServiceStub.find.resolves(clientEventSample);
        clientEventServiceStub.retrieve.resolves([clientEventSample]);

        // WHEN
        route = {
          params: {
            clientEventId: `${clientEventSample.id}`,
          },
        };
        const wrapper = shallowMount(ClientEventUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.clientEvent).toMatchObject(clientEventSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientEventServiceStub.find.resolves(clientEventSample);
        const wrapper = shallowMount(ClientEventUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
