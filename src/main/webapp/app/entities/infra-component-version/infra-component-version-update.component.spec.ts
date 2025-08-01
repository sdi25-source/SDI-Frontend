import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import InfraComponentVersionUpdate from './infra-component-version-update.vue';
import InfraComponentVersionService from './infra-component-version.service';
import AlertService from '@/shared/alert/alert.service';

import InfraComponentService from '@/entities/infra-component/infra-component.service';

type InfraComponentVersionUpdateComponentType = InstanceType<typeof InfraComponentVersionUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const infraComponentVersionSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<InfraComponentVersionUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('InfraComponentVersion Management Update Component', () => {
    let comp: InfraComponentVersionUpdateComponentType;
    let infraComponentVersionServiceStub: SinonStubbedInstance<InfraComponentVersionService>;

    beforeEach(() => {
      route = {};
      infraComponentVersionServiceStub = sinon.createStubInstance<InfraComponentVersionService>(InfraComponentVersionService);
      infraComponentVersionServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          infraComponentVersionService: () => infraComponentVersionServiceStub,
          infraComponentService: () =>
            sinon.createStubInstance<InfraComponentService>(InfraComponentService, {
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
        const wrapper = shallowMount(InfraComponentVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.infraComponentVersion = infraComponentVersionSample;
        infraComponentVersionServiceStub.update.resolves(infraComponentVersionSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(infraComponentVersionServiceStub.update.calledWith(infraComponentVersionSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        infraComponentVersionServiceStub.create.resolves(entity);
        const wrapper = shallowMount(InfraComponentVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.infraComponentVersion = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(infraComponentVersionServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        infraComponentVersionServiceStub.find.resolves(infraComponentVersionSample);
        infraComponentVersionServiceStub.retrieve.resolves([infraComponentVersionSample]);

        // WHEN
        route = {
          params: {
            infraComponentVersionId: `${infraComponentVersionSample.id}`,
          },
        };
        const wrapper = shallowMount(InfraComponentVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.infraComponentVersion).toMatchObject(infraComponentVersionSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        infraComponentVersionServiceStub.find.resolves(infraComponentVersionSample);
        const wrapper = shallowMount(InfraComponentVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
