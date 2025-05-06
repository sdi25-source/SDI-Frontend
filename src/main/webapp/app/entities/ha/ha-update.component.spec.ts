import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import HAUpdate from './ha-update.vue';
import HAService from './ha.service';
import AlertService from '@/shared/alert/alert.service';

type HAUpdateComponentType = InstanceType<typeof HAUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const hASample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<HAUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('HA Management Update Component', () => {
    let comp: HAUpdateComponentType;
    let hAServiceStub: SinonStubbedInstance<HAService>;

    beforeEach(() => {
      route = {};
      hAServiceStub = sinon.createStubInstance<HAService>(HAService);
      hAServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          hAService: () => hAServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(HAUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.hA = hASample;
        hAServiceStub.update.resolves(hASample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(hAServiceStub.update.calledWith(hASample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        hAServiceStub.create.resolves(entity);
        const wrapper = shallowMount(HAUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.hA = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(hAServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        hAServiceStub.find.resolves(hASample);
        hAServiceStub.retrieve.resolves([hASample]);

        // WHEN
        route = {
          params: {
            hAId: `${hASample.id}`,
          },
        };
        const wrapper = shallowMount(HAUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.hA).toMatchObject(hASample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        hAServiceStub.find.resolves(hASample);
        const wrapper = shallowMount(HAUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
