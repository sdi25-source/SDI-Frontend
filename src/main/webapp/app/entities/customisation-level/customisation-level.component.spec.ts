import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import CustomisationLevel from './customisation-level.vue';
import CustomisationLevelService from './customisation-level.service';
import AlertService from '@/shared/alert/alert.service';

type CustomisationLevelComponentType = InstanceType<typeof CustomisationLevel>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('CustomisationLevel Management Component', () => {
    let customisationLevelServiceStub: SinonStubbedInstance<CustomisationLevelService>;
    let mountOptions: MountingOptions<CustomisationLevelComponentType>['global'];

    beforeEach(() => {
      customisationLevelServiceStub = sinon.createStubInstance<CustomisationLevelService>(CustomisationLevelService);
      customisationLevelServiceStub.retrieve.resolves({ headers: {} });

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
          customisationLevelService: () => customisationLevelServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        customisationLevelServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(CustomisationLevel, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(customisationLevelServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.customisationLevels[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: CustomisationLevelComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(CustomisationLevel, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        customisationLevelServiceStub.retrieve.reset();
        customisationLevelServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        customisationLevelServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeCustomisationLevel();
        await comp.$nextTick(); // clear components

        // THEN
        expect(customisationLevelServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(customisationLevelServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
