import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductVersionUpdate from './product-version-update.vue';
import ProductVersionService from './product-version.service';
import AlertService from '@/shared/alert/alert.service';

import ProductService from '@/entities/product/product.service';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';

type ProductVersionUpdateComponentType = InstanceType<typeof ProductVersionUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productVersionSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ProductVersionUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ProductVersion Management Update Component', () => {
    let comp: ProductVersionUpdateComponentType;
    let productVersionServiceStub: SinonStubbedInstance<ProductVersionService>;

    beforeEach(() => {
      route = {};
      productVersionServiceStub = sinon.createStubInstance<ProductVersionService>(ProductVersionService);
      productVersionServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          productVersionService: () => productVersionServiceStub,
          productService: () =>
            sinon.createStubInstance<ProductService>(ProductService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          moduleVersionService: () =>
            sinon.createStubInstance<ModuleVersionService>(ModuleVersionService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          infraComponentVersionService: () =>
            sinon.createStubInstance<InfraComponentVersionService>(InfraComponentVersionService, {
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
        const wrapper = shallowMount(ProductVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.productVersion = productVersionSample;
        productVersionServiceStub.update.resolves(productVersionSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(productVersionServiceStub.update.calledWith(productVersionSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        productVersionServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ProductVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.productVersion = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(productVersionServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        productVersionServiceStub.find.resolves(productVersionSample);
        productVersionServiceStub.retrieve.resolves([productVersionSample]);

        // WHEN
        route = {
          params: {
            productVersionId: `${productVersionSample.id}`,
          },
        };
        const wrapper = shallowMount(ProductVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.productVersion).toMatchObject(productVersionSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productVersionServiceStub.find.resolves(productVersionSample);
        const wrapper = shallowMount(ProductVersionUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
