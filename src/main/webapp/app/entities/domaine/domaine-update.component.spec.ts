import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import DomaineUpdate from './domaine-update.vue';
import DomaineService from './domaine.service';
import AlertService from '@/shared/alert/alert.service';

type DomaineUpdateComponentType = InstanceType<typeof DomaineUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const domaineSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<DomaineUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('Domaine Management Update Component', () => {
    let comp: DomaineUpdateComponentType;
    let domaineServiceStub: SinonStubbedInstance<DomaineService>;

    beforeEach(() => {
      route = {};
      domaineServiceStub = sinon.createStubInstance<DomaineService>(DomaineService);
      domaineServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          domaineService: () => domaineServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(DomaineUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.domaine = domaineSample;
        domaineServiceStub.update.resolves(domaineSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(domaineServiceStub.update.calledWith(domaineSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        domaineServiceStub.create.resolves(entity);
        const wrapper = shallowMount(DomaineUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.domaine = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(domaineServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        domaineServiceStub.find.resolves(domaineSample);
        domaineServiceStub.retrieve.resolves([domaineSample]);

        // WHEN
        route = {
          params: {
            domaineId: `${domaineSample.id}`,
          },
        };
        const wrapper = shallowMount(DomaineUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.domaine).toMatchObject(domaineSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        domaineServiceStub.find.resolves(domaineSample);
        const wrapper = shallowMount(DomaineUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
