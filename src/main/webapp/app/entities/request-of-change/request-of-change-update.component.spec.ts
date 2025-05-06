import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import RequestOfChangeUpdate from './request-of-change-update.vue';
import RequestOfChangeService from './request-of-change.service';
import AlertService from '@/shared/alert/alert.service';

import ProductVersionService from '@/entities/product-version/product-version.service';
import ClientService from '@/entities/client/client.service';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import CustomisationLevelService from '@/entities/customisation-level/customisation-level.service';

type RequestOfChangeUpdateComponentType = InstanceType<typeof RequestOfChangeUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const requestOfChangeSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<RequestOfChangeUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('RequestOfChange Management Update Component', () => {
    let comp: RequestOfChangeUpdateComponentType;
    let requestOfChangeServiceStub: SinonStubbedInstance<RequestOfChangeService>;

    beforeEach(() => {
      route = {};
      requestOfChangeServiceStub = sinon.createStubInstance<RequestOfChangeService>(RequestOfChangeService);
      requestOfChangeServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          requestOfChangeService: () => requestOfChangeServiceStub,
          productVersionService: () =>
            sinon.createStubInstance<ProductVersionService>(ProductVersionService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          clientService: () =>
            sinon.createStubInstance<ClientService>(ClientService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          moduleVersionService: () =>
            sinon.createStubInstance<ModuleVersionService>(ModuleVersionService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          customisationLevelService: () =>
            sinon.createStubInstance<CustomisationLevelService>(CustomisationLevelService, {
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
        const wrapper = shallowMount(RequestOfChangeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.requestOfChange = requestOfChangeSample;
        requestOfChangeServiceStub.update.resolves(requestOfChangeSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(requestOfChangeServiceStub.update.calledWith(requestOfChangeSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        requestOfChangeServiceStub.create.resolves(entity);
        const wrapper = shallowMount(RequestOfChangeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.requestOfChange = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(requestOfChangeServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        requestOfChangeServiceStub.find.resolves(requestOfChangeSample);
        requestOfChangeServiceStub.retrieve.resolves([requestOfChangeSample]);

        // WHEN
        route = {
          params: {
            requestOfChangeId: `${requestOfChangeSample.id}`,
          },
        };
        const wrapper = shallowMount(RequestOfChangeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.requestOfChange).toMatchObject(requestOfChangeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        requestOfChangeServiceStub.find.resolves(requestOfChangeSample);
        const wrapper = shallowMount(RequestOfChangeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
