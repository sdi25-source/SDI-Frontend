import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import FeatureDeployement from './feature-deployement.vue';
import FeatureDeployementService from './feature-deployement.service';
import AlertService from '@/shared/alert/alert.service';

type FeatureDeployementComponentType = InstanceType<typeof FeatureDeployement>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('FeatureDeployement Management Component', () => {
    let featureDeployementServiceStub: SinonStubbedInstance<FeatureDeployementService>;
    let mountOptions: MountingOptions<FeatureDeployementComponentType>['global'];

    beforeEach(() => {
      featureDeployementServiceStub = sinon.createStubInstance<FeatureDeployementService>(FeatureDeployementService);
      featureDeployementServiceStub.retrieve.resolves({ headers: {} });

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
          featureDeployementService: () => featureDeployementServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        featureDeployementServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(FeatureDeployement, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(featureDeployementServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.featureDeployements[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: FeatureDeployementComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(FeatureDeployement, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        featureDeployementServiceStub.retrieve.reset();
        featureDeployementServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        featureDeployementServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeFeatureDeployement();
        await comp.$nextTick(); // clear components

        // THEN
        expect(featureDeployementServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(featureDeployementServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
