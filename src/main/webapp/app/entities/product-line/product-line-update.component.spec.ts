import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';
import { type RouteLocation } from 'vue-router';

import ProductLineUpdate from './product-line-update.vue';
import ProductLineService from './product-line.service';
import AlertService from '@/shared/alert/alert.service';

type ProductLineUpdateComponentType = InstanceType<typeof ProductLineUpdate>;

let route: Partial<RouteLocation>;
const routerGoMock = vitest.fn();

vitest.mock('vue-router', () => ({
  useRoute: () => route,
  useRouter: () => ({ go: routerGoMock }),
}));

const productLineSample = { id: 123 };

describe('Component Tests', () => {
  let mountOptions: MountingOptions<ProductLineUpdateComponentType>['global'];
  let alertService: AlertService;

  describe('ProductLine Management Update Component', () => {
    let comp: ProductLineUpdateComponentType;
    let productLineServiceStub: SinonStubbedInstance<ProductLineService>;

    beforeEach(() => {
      route = {};
      productLineServiceStub = sinon.createStubInstance<ProductLineService>(ProductLineService);
      productLineServiceStub.retrieve.onFirstCall().resolves(Promise.resolve([]));

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
          productLineService: () => productLineServiceStub,
        },
      };
    });

    afterEach(() => {
      vitest.resetAllMocks();
    });

    describe('save', () => {
      it('Should call update service on save for existing entity', async () => {
        // GIVEN
        const wrapper = shallowMount(ProductLineUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.productLine = productLineSample;
        productLineServiceStub.update.resolves(productLineSample);

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(productLineServiceStub.update.calledWith(productLineSample)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });

      it('Should call create service on save for new entity', async () => {
        // GIVEN
        const entity = {};
        productLineServiceStub.create.resolves(entity);
        const wrapper = shallowMount(ProductLineUpdate, { global: mountOptions });
        comp = wrapper.vm;
        comp.productLine = entity;

        // WHEN
        comp.save();
        await comp.$nextTick();

        // THEN
        expect(productLineServiceStub.create.calledWith(entity)).toBeTruthy();
        expect(comp.isSaving).toEqual(false);
      });
    });

    describe('Before route enter', () => {
      it('Should retrieve data', async () => {
        // GIVEN
        productLineServiceStub.find.resolves(productLineSample);
        productLineServiceStub.retrieve.resolves([productLineSample]);

        // WHEN
        route = {
          params: {
            productLineId: `${productLineSample.id}`,
          },
        };
        const wrapper = shallowMount(ProductLineUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(comp.productLine).toMatchObject(productLineSample);
      });
    });

    describe('Previous state', () => {
      it('Should go previous state', async () => {
        productLineServiceStub.find.resolves(productLineSample);
        const wrapper = shallowMount(ProductLineUpdate, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();

        comp.previousState();
        await comp.$nextTick();

        expect(routerGoMock).toHaveBeenCalledWith(-1);
      });
    });
  });
});
