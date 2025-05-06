import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientCertificationUpdate from './client-certification-update.vue';
import ClientCertificationService from './client-certification.service';
import AlertService from '@/shared/alert/alert.service';

import ClientService from '@/entities/client/client.service';
import CertificationService from '@/entities/certification/certification.service';

type ClientCertificationUpdateComponentType = InstanceType<typeof ClientCertificationUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientCertificationSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ClientCertificationUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ClientCertification Management Update Component', () => {
    let comp: ClientCertificationUpdateComponentType;
    let clientCertificationServiceStub: SinonStubbedInstance<ClientCertificationService>;

    beforeEach(() => {
      route = {};
      clientCertificationServiceStub = sinon.createStubInstance<ClientCertificationService>(ClientCertificationService);
      clientCertificationServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          clientCertificationService: () => clientCertificationServiceStub,
          clientService: () =>
            sinon.createStubInstance<ClientService>(ClientService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          certificationService: () =>
            sinon.createStubInstance<CertificationService>(CertificationService, {
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
        const wrapper = shallowMount(ClientCertificationUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientCertification = clientCertificationSample;
        clientCertificationServiceStub.update.resolves(clientCertificationSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientCertificationServiceStub.update.calledWith(clientCertificationSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        clientCertificationServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ClientCertificationUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientCertification = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientCertificationServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        clientCertificationServiceStub.find.resolves(clientCertificationSample);
        clientCertificationServiceStub.retrieve.resolves([clientCertificationSample]);

        // WHEN
        route = {
          params: {
            clientCertificationId: `${clientCertificationSample.id}`,
          },
        };
        const wrapper = shallowMount(ClientCertificationUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.clientCertification).toMatchObject(clientCertificationSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientCertificationServiceStub.find.resolves(clientCertificationSample);
        const wrapper = shallowMount(ClientCertificationUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
