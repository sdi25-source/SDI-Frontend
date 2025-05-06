import { vitest } from 'vitest';
import { type MountingOptions, shallowMount } from '@vue/test-utils';
import sinon, { type SinonStubbedInstance } from 'sinon';

import InfraComponentVersion from './infra-component-version.vue';
import InfraComponentVersionService from './infra-component-version.service';
import AlertService from '@/shared/alert/alert.service';

type InfraComponentVersionComponentType = InstanceType<typeof InfraComponentVersion>;

const bModalStub = {
  render: () => {},
  methods: {
    hide: () => {},
    show: () => {},
  },
};

describe('Component Tests', () => {
  let alertService: AlertService;

  describe('InfraComponentVersion Management Component', () => {
    let infraComponentVersionServiceStub: SinonStubbedInstance<InfraComponentVersionService>;
    let mountOptions: MountingOptions<InfraComponentVersionComponentType>['global'];

    beforeEach(() => {
      infraComponentVersionServiceStub = sinon.createStubInstance<InfraComponentVersionService>(InfraComponentVersionService);
      infraComponentVersionServiceStub.retrieve.resolves({ headers: {} });

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
          infraComponentVersionService: () => infraComponentVersionServiceStub,
        },
      };
    });

    describe('Mount', () => {
      it('Should call load all on init', async () => {
        // GIVEN
        infraComponentVersionServiceStub.retrieve.resolves({ headers: {}, data: [{ id: 123 }] });

        // WHEN
        const wrapper = shallowMount(InfraComponentVersion, { global: mountOptions });
        const comp = wrapper.vm;
        await comp.$nextTick();

        // THEN
        expect(infraComponentVersionServiceStub.retrieve.calledOnce).toBeTruthy();
        expect(comp.infraComponentVersions[0]).toEqual(expect.objectContaining({ id: 123 }));
      });
    });
    describe('Handles', () => {
      let comp: InfraComponentVersionComponentType;

      beforeEach(async () => {
        const wrapper = shallowMount(InfraComponentVersion, { global: mountOptions });
        comp = wrapper.vm;
        await comp.$nextTick();
        infraComponentVersionServiceStub.retrieve.reset();
        infraComponentVersionServiceStub.retrieve.resolves({ headers: {}, data: [] });
      });

      it('Should call delete service on confirmDelete', async () => {
        // GIVEN
        infraComponentVersionServiceStub.delete.resolves({});

        // WHEN
        comp.prepareRemove({ id: 123 });

        comp.removeInfraComponentVersion();
        await comp.$nextTick(); // clear components

        // THEN
        expect(infraComponentVersionServiceStub.delete.called).toBeTruthy();

        // THEN
        await comp.$nextTick(); // handle component clear watch
        expect(infraComponentVersionServiceStub.retrieve.callCount).toEqual(1);
      });
    });
  });
});
