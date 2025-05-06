import { defineComponent, provide } from 'vue';

import DeployementTypeService from './deployement-type/deployement-type.service';
import CustomisationLevelService from './customisation-level/customisation-level.service';
import ProductVersionService from './product-version/product-version.service';
import ProductService from './product/product.service';
import ProductLineService from './product-line/product-line.service';
import ModuleVersionService from './module-version/module-version.service';
import ModuleService from './module/module.service';
import DomaineService from './domaine/domaine.service';
import FeatureService from './feature/feature.service';
import ProductDeployementService from './product-deployement/product-deployement.service';
import ProductDeployementDetailService from './product-deployement-detail/product-deployement-detail.service';
import ModuleDeployementService from './module-deployement/module-deployement.service';
import FeatureDeployementService from './feature-deployement/feature-deployement.service';
import RegionService from './region/region.service';
import ClientCertificationService from './client-certification/client-certification.service';
import ClientSizeService from './client-size/client-size.service';
import ClientService from './client/client.service';
import ClientTypeService from './client-type/client-type.service';
import CertificationService from './certification/certification.service';
import ClientEventService from './client-event/client-event.service';
import ClientEventTypeService from './client-event-type/client-event-type.service';
import CountryService from './country/country.service';
import HAService from './ha/ha.service';
import ComponentTypeService from './component-type/component-type.service';
import InfraComponentService from './infra-component/infra-component.service';
import InfraComponentVersionService from './infra-component-version/infra-component-version.service';
import RequestOfChangeService from './request-of-change/request-of-change.service';
import UserService from '@/entities/user/user.service';
// jhipster-needle-add-entity-service-to-entities-component-import - JHipster will import entities services here

export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'Entities',
  setup() {
    provide('userService', () => new UserService());
    provide('deployementTypeService', () => new DeployementTypeService());
    provide('customisationLevelService', () => new CustomisationLevelService());
    provide('productVersionService', () => new ProductVersionService());
    provide('productService', () => new ProductService());
    provide('productLineService', () => new ProductLineService());
    provide('moduleVersionService', () => new ModuleVersionService());
    provide('moduleService', () => new ModuleService());
    provide('domaineService', () => new DomaineService());
    provide('featureService', () => new FeatureService());
    provide('productDeployementService', () => new ProductDeployementService());
    provide('productDeployementDetailService', () => new ProductDeployementDetailService());
    provide('moduleDeployementService', () => new ModuleDeployementService());
    provide('featureDeployementService', () => new FeatureDeployementService());
    provide('regionService', () => new RegionService());
    provide('clientCertificationService', () => new ClientCertificationService());
    provide('clientSizeService', () => new ClientSizeService());
    provide('clientService', () => new ClientService());
    provide('clientTypeService', () => new ClientTypeService());
    provide('certificationService', () => new CertificationService());
    provide('clientEventService', () => new ClientEventService());
    provide('clientEventTypeService', () => new ClientEventTypeService());
    provide('countryService', () => new CountryService());
    provide('hAService', () => new HAService());
    provide('componentTypeService', () => new ComponentTypeService());
    provide('infraComponentService', () => new InfraComponentService());
    provide('infraComponentVersionService', () => new InfraComponentVersionService());
    provide('requestOfChangeService', () => new RequestOfChangeService());
    // jhipster-needle-add-entity-service-to-entities-component - JHipster will import entities services here
  },
});
