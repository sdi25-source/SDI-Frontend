import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductDeployementDetailUpdate from './product-deployement-detail-update.vue';
import ProductDeployementDetailService from './product-deployement-detail.service';
import AlertService from '@/shared/alert/alert.service';

import ProductDeployementService from '@/entities/product-deployement/product-deployement.service';
import InfraComponentVersionService from '@/entities/infra-component-version/infra-component-version.service';
import ModuleVersionService from '@/entities/module-version/module-version.service';
import ProductVersionService from '@/entities/product-version/product-version.service';
import DeployementTypeService from '@/entities/deployement-type/deployement-type.service';

type ProductDeployementDetailUpdateComponentType = InstanceType<typeof ProductDeployementDetailUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productDeployementDetailSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ProductDeployementDetailUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ProductDeployementDetail Management Update Component', () => {
    let comp: ProductDeployementDetailUpdateComponentType;
    let productDeployementDetailServiceStub: SinonStubbedInstance<ProductDeployementDetailService>;

    beforeEach(() => {
      route = {};
      productDeployementDetailServiceStub = sinon.createStubInstance<ProductDeployementDetailService>(ProductDeployementDetailService);
      productDeployementDetailServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          productDeployementDetailService: () => productDeployementDetailServiceStub,
          productDeployementService: () =>
            sinon.createStubInstance<ProductDeployementService>(ProductDeployementService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          infraComponentVersionService: () =>
            sinon.createStubInstance<InfraComponentVersionService>(InfraComponentVersionService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          moduleVersionService: () =>
            sinon.createStubInstance<ModuleVersionService>(ModuleVersionService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          productVersionService: () =>
            sinon.createStubInstance<ProductVersionService>(ProductVersionService, {
              retrieve: sinon.stub().resolves({}),
            } as any),
          deployementTypeService: () =>
            sinon.createStubInstance<DeployementTypeService>(DeployementTypeService, {
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
        const wrapper = shallowMount(ProductDeployementDetailUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.productDeployementDetail = productDeployementDetailSample;
        productDeployementDetailServiceStub.update.resolves(productDeployementDetailSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(productDeployementDetailServiceStub.update.calledWith(productDeployementDetailSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        productDeployementDetailServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ProductDeployementDetailUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.productDeployementDetail = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(productDeployementDetailServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        productDeployementDetailServiceStub.find.resolves(productDeployementDetailSample);
        productDeployementDetailServiceStub.retrieve.resolves([productDeployementDetailSample]);

        // WHEN
        route = {
          params: {
            productDeployementDetailId: `${productDeployementDetailSample.id}`,
          },
        };
        const wrapper = shallowMount(ProductDeployementDetailUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.productDeployementDetail).toMatchObject(productDeployementDetailSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productDeployementDetailServiceStub.find.resolves(productDeployementDetailSample);
        const wrapper = shallowMount(ProductDeployementDetailUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
