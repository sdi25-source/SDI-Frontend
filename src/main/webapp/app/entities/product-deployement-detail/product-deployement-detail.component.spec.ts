import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ProductDeployementDetail from './product-deployement-detail.vue';
import ProductDeployementDetailService from './product-deployement-detail.service';
import AlertService from '@/shared/alert/alert.service';

type ProductDeployementDetailComponentType = InstanceType<typeof ProductDeployementDetail>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ProductDeployementDetail Management Component', () => {
    let productDeployementDetailServiceStub: SinonStubbedInstance<ProductDeployementDetailService>;
    let mountOptions: MountingOptions<ProductDeployementDetailComponentType>['global'];

    beforeEach(() => {
      productDeployementDetailServiceStub = sinon.createStubInstance<ProductDeployementDetailService>(ProductDeployementDetailService);
      productDeployementDetailServiceStub.retrieve.resolves({ headers: {} });

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
          productDeployementDetailService: () => productDeployementDetailServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productDeployementDetailServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ProductDeployementDetail, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(productDeployementDetailServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.productDeployementDetails[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ProductDeployementDetailComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ProductDeployementDetail, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        productDeployementDetailServiceStub.retrieve.reset();
        productDeployementDetailServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        productDeployementDetailServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeProductDeployementDetail();
        await comp.$nextTick(); // clear components

        // THEN
        expect(productDeployementDetailServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(productDeployementDetailServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
