import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import ProductVersion from './product-version.vue';
import ProductVersionService from './product-version.service';
import AlertService from '@/shared/alert/alert.service';

type ProductVersionComponentType = InstanceType<typeof ProductVersion>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('ProductVersion Management Component', () => {
    let productVersionServiceStub: SinonStubbedInstance<ProductVersionService>;
    let mountOptions: MountingOptions<ProductVersionComponentType>['global'];

    beforeEach(() => {
      productVersionServiceStub = sinon.createStubInstance<ProductVersionService>(ProductVersionService);
      productVersionServiceStub.retrieve.resolves({ headers: {} });

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
          productVersionService: () => productVersionServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        productVersionServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(ProductVersion, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(productVersionServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.productVersions[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: ProductVersionComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(ProductVersion, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        productVersionServiceStub.retrieve.reset();
        productVersionServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        productVersionServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeProductVersion();
        await comp.$nextTick(); // clear components

        // THEN
        expect(productVersionServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(productVersionServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
