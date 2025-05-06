import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientUpdate from './client-update.vue';
import ClientService from './client.service';
import AlertService from '@/shared/alert/alert.service';

import CountryService from '@/entities/country/country.service';
import ClientSizeService from '@/entities/client-size/client-size.service';
import ClientTypeService from '@/entities/client-type/client-type.service';

type ClientUpdateComponentType = InstanceType<typeof ClientUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ClientUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Client Management Update Component', () => {
    let comp: ClientUpdateComponentType;
    let clientServiceStub: SinonStubbedInstance<ClientService>;

    beforeEach(() => {
      route = {};
      clientServiceStub = sinon.createStubInstance<ClientService>(ClientService);
      clientServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          clientService: () => clientServiceStub,
          countryService: () =>
            sinon.createStubInstance<CountryService>(CountryService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          clientSizeService: () =>
            sinon.createStubInstance<ClientSizeService>(ClientSizeService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          clientTypeService: () =>
            sinon.createStubInstance<ClientTypeService>(ClientTypeService, {
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
        const wrapper = shallowMount(ClientUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.client = clientSample;
        clientServiceStub.update.resolves(clientSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientServiceStub.update.calledWith(clientSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        clientServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ClientUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.client = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        clientServiceStub.find.resolves(clientSample);
        clientServiceStub.retrieve.resolves([clientSample]);

        // WHEN
        route = {
          params: {
            clientId: `${clientSample.id}`,
          },
        };
        const wrapper = shallowMount(ClientUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.client).toMatchObject(clientSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientServiceStub.find.resolves(clientSample);
        const wrapper = shallowMount(ClientUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
