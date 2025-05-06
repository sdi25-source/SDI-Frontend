import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import Feature from './feature.vue';
import FeatureService from './feature.service';
import AlertService from '@/shared/alert/alert.service';

type FeatureComponentType = InstanceType<typeof Feature>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('Feature Management Component', () => {
    let featureServiceStub: SinonStubbedInstance<FeatureService>;
    let mountOptions: MountingOptions<FeatureComponentType>['global'];

    beforeEach(() => {
      featureServiceStub = sinon.createStubInstance<FeatureService>(FeatureService);
      featureServiceStub.retrieve.resolves({ headers: {} });

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
          featureService: () => featureServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        featureServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(Feature, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(featureServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.features[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: FeatureComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(Feature, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        featureServiceStub.retrieve.reset();
        featureServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        featureServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeFeature();
        await comp.$nextTick(); // clear components

        // THEN
        expect(featureServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(featureServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
