import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ClientSizeUpdate from './client-size-update.vue';
import ClientSizeService from './client-size.service';
import AlertService from '@/shared/alert/alert.service';

type ClientSizeUpdateComponentType = InstanceType<typeof ClientSizeUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const clientSizeSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ClientSizeUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ClientSize Management Update Component', () => {
    let comp: ClientSizeUpdateComponentType;
    let clientSizeServiceStub: SinonStubbedInstance<ClientSizeService>;

    beforeEach(() => {
      route = {};
      clientSizeServiceStub = sinon.createStubInstance<ClientSizeService>(ClientSizeService);
      clientSizeServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          clientSizeService: () => clientSizeServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(ClientSizeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientSize = clientSizeSample;
        clientSizeServiceStub.update.resolves(clientSizeSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientSizeServiceStub.update.calledWith(clientSizeSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        clientSizeServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ClientSizeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.clientSize = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(clientSizeServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        clientSizeServiceStub.find.resolves(clientSizeSample);
        clientSizeServiceStub.retrieve.resolves([clientSizeSample]);

        // WHEN
        route = {
          params: {
            clientSizeId: `${clientSizeSample.id}`,
          },
        };
        const wrapper = shallowMount(ClientSizeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.clientSize).toMatchObject(clientSizeSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        clientSizeServiceStub.find.resolves(clientSizeSample);
        const wrapper = shallowMount(ClientSizeUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
