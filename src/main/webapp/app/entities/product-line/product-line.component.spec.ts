import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ProductLine from './product-line.vue';
import ProductLineService from './product-line.service';
import AlertService from '@/shared/alert/alert.service';

type ProductLineComponentType = InstanceType<typeof ProductLine>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ProductLine Management Component', () => {
    let productLineServiceStub: SinonStubbedInstance<ProductLineService>;
    let mountOptions: MountingOptions<ProductLineComponentType>['global'];

    beforeEach(() => {
      productLineServiceStub = sinon.createStubInstance<ProductLineService>(ProductLineService);
      productLineServiceStub.retrieve.resolves({ headers: {} });

      alertService = new AlertService({
        i18n: { t: vitest.fn() } as any,
        bvToast: {
          toast: vitest.fn(),
        } as any,
      });

      mountOptions = {
        stubs: {
          bModal: bModalStub as any,
          'font-awesome-icon': true,
          'b-badge': true,
          'b-button': true,
          'router-link': true,
        },
        directives: {
          'b-modal': {},
        },
        provide: {
          alertService,
          productLineService: () => productLineServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productLineServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ProductLine, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(productLineServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.productLines[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ProductLineComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ProductLine, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        productLineServiceStub.retrieve.reset();
        productLineServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        productLineServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeProductLine();
        await comp.$nextTick(); // clear components

        // THEN
        expect(productLineServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(productLineServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
