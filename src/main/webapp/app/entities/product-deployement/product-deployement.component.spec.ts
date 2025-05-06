import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ProductDeployement from './product-deployement.vue';
import ProductDeployementService from './product-deployement.service';
import AlertService from '@/shared/alert/alert.service';

type ProductDeployementComponentType = InstanceType<typeof ProductDeployement>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ProductDeployement Management Component', () => {
    let productDeployementServiceStub: SinonStubbedInstance<ProductDeployementService>;
    let mountOptions: MountingOptions<ProductDeployementComponentType>['global'];

    beforeEach(() => {
      productDeployementServiceStub = sinon.createStubInstance<ProductDeployementService>(ProductDeployementService);
      productDeployementServiceStub.retrieve.resolves({ headers: {} });

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
          productDeployementService: () => productDeployementServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productDeployementServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ProductDeployement, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(productDeployementServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.productDeployements[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ProductDeployementComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ProductDeployement, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        productDeployementServiceStub.retrieve.reset();
        productDeployementServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        productDeployementServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeProductDeployement();
        await comp.$nextTick(); // clear components

        // THEN
        expect(productDeployementServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(productDeployementServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
