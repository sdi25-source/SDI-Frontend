import { Authority } from '@/shared/security/authority';
const Entities = () => import('@/entities/entities.vue');

const DeployementType = () => import('@/entities/deployement-type/deployement-type.vue');
const DeployementTypeUpdate = () => import('@/entities/deployement-type/deployement-type-update.vue');
const DeployementTypeDetails = () => import('@/entities/deployement-type/deployement-type-details.vue');

const CustomisationLevel = () => import('@/entities/customisation-level/customisation-level.vue');
const CustomisationLevelUpdate = () => import('@/entities/customisation-level/customisation-level-update.vue');
const CustomisationLevelDetails = () => import('@/entities/customisation-level/customisation-level-details.vue');

const ProductVersion = () => import('@/entities/product-version/product-version.vue');
const ProductVersionUpdate = () => import('@/entities/product-version/product-version-update.vue');
const ProductVersionDetails = () => import('@/entities/product-version/product-version-details.vue');

const Product = () => import('@/entities/product/product.vue');
const ProductUpdate = () => import('@/entities/product/product-update.vue');
const ProductDetails = () => import('@/entities/product/product-details.vue');

const ProductLine = () => import('@/entities/product-line/product-line.vue');
const ProductLineUpdate = () => import('@/entities/product-line/product-line-update.vue');
const ProductLineDetails = () => import('@/entities/product-line/product-line-details.vue');

const ModuleVersion = () => import('@/entities/module-version/module-version.vue');
const ModuleVersionUpdate = () => import('@/entities/module-version/module-version-update.vue');
const ModuleVersionDetails = () => import('@/entities/module-version/module-version-details.vue');

const Module = () => import('@/entities/module/module.vue');
const ModuleUpdate = () => import('@/entities/module/module-update.vue');
const ModuleDetails = () => import('@/entities/module/module-details.vue');

const Domaine = () => import('@/entities/domaine/domaine.vue');
const DomaineUpdate = () => import('@/entities/domaine/domaine-update.vue');
const DomaineDetails = () => import('@/entities/domaine/domaine-details.vue');

const Feature = () => import('@/entities/feature/feature.vue');
const FeatureUpdate = () => import('@/entities/feature/feature-update.vue');
const FeatureDetails = () => import('@/entities/feature/feature-details.vue');

const ProductDeployement = () => import('@/entities/product-deployement/product-deployement.vue');
const ProductDeployementUpdate = () => import('@/entities/product-deployement/product-deployement-update.vue');
const ProductDeployementDetails = () => import('@/entities/product-deployement/product-deployement-details.vue');

const ProductDeployementDetail = () => import('@/entities/product-deployement-detail/product-deployement-detail.vue');
const ProductDeployementDetailUpdate = () => import('@/entities/product-deployement-detail/product-deployement-detail-update.vue');
const ProductDeployementDetailDetails = () => import('@/entities/product-deployement-detail/product-deployement-detail-details.vue');

const ModuleDeployement = () => import('@/entities/module-deployement/module-deployement.vue');
const ModuleDeployementUpdate = () => import('@/entities/module-deployement/module-deployement-update.vue');
const ModuleDeployementDetails = () => import('@/entities/module-deployement/module-deployement-details.vue');

const FeatureDeployement = () => import('@/entities/feature-deployement/feature-deployement.vue');
const FeatureDeployementUpdate = () => import('@/entities/feature-deployement/feature-deployement-update.vue');
const FeatureDeployementDetails = () => import('@/entities/feature-deployement/feature-deployement-details.vue');

const Region = () => import('@/entities/region/region.vue');
const RegionUpdate = () => import('@/entities/region/region-update.vue');
const RegionDetails = () => import('@/entities/region/region-details.vue');

const ClientCertification = () => import('@/entities/client-certification/client-certification.vue');
const ClientCertificationUpdate = () => import('@/entities/client-certification/client-certification-update.vue');
const ClientCertificationDetails = () => import('@/entities/client-certification/client-certification-details.vue');

const ClientSize = () => import('@/entities/client-size/client-size.vue');
const ClientSizeUpdate = () => import('@/entities/client-size/client-size-update.vue');
const ClientSizeDetails = () => import('@/entities/client-size/client-size-details.vue');

const Client = () => import('@/entities/client/client.vue');
const ClientUpdate = () => import('@/entities/client/client-update.vue');
const ClientDetails = () => import('@/entities/client/client-details.vue');

const ClientType = () => import('@/entities/client-type/client-type.vue');
const ClientTypeUpdate = () => import('@/entities/client-type/client-type-update.vue');
const ClientTypeDetails = () => import('@/entities/client-type/client-type-details.vue');

const Certification = () => import('@/entities/certification/certification.vue');
const CertificationUpdate = () => import('@/entities/certification/certification-update.vue');
const CertificationDetails = () => import('@/entities/certification/certification-details.vue');

const ClientEvent = () => import('@/entities/client-event/client-event.vue');
const ClientEventUpdate = () => import('@/entities/client-event/client-event-update.vue');
const ClientEventDetails = () => import('@/entities/client-event/client-event-details.vue');

const ClientEventType = () => import('@/entities/client-event-type/client-event-type.vue');
const ClientEventTypeUpdate = () => import('@/entities/client-event-type/client-event-type-update.vue');
const ClientEventTypeDetails = () => import('@/entities/client-event-type/client-event-type-details.vue');

const Country = () => import('@/entities/country/country.vue');
const CountryUpdate = () => import('@/entities/country/country-update.vue');
const CountryDetails = () => import('@/entities/country/country-details.vue');

const HA = () => import('@/entities/ha/ha.vue');
const HAUpdate = () => import('@/entities/ha/ha-update.vue');
const HADetails = () => import('@/entities/ha/ha-details.vue');

const ComponentType = () => import('@/entities/component-type/component-type.vue');
const ComponentTypeUpdate = () => import('@/entities/component-type/component-type-update.vue');
const ComponentTypeDetails = () => import('@/entities/component-type/component-type-details.vue');

const InfraComponent = () => import('@/entities/infra-component/infra-component.vue');
const InfraComponentUpdate = () => import('@/entities/infra-component/infra-component-update.vue');
const InfraComponentDetails = () => import('@/entities/infra-component/infra-component-details.vue');

const InfraComponentVersion = () => import('@/entities/infra-component-version/infra-component-version.vue');
const InfraComponentVersionUpdate = () => import('@/entities/infra-component-version/infra-component-version-update.vue');
const InfraComponentVersionDetails = () => import('@/entities/infra-component-version/infra-component-version-details.vue');

const RequestOfChange = () => import('@/entities/request-of-change/request-of-change.vue');
const RequestOfChangeUpdate = () => import('@/entities/request-of-change/request-of-change-update.vue');
const RequestOfChangeDetails = () => import('@/entities/request-of-change/request-of-change-details.vue');

const DashClients = () => import('@/core/dashboards/dashboardClients/dashClients.vue');
const DashProducts = () => import('@/core/dashboards/dashboardProducts/dashProducts.vue');

export default {
  path: '/',
  component: Entities,
  children: [
    {
      path: 'dashClients',
      name: 'DashClients',
      component: DashClients,
      // meta: { authorities: [Authority.COMMERCIAL] },
    },
    {
      path: 'dashProducts',
      name: 'DashProducts',
      component: DashProducts,
      //  meta: { authorities: [Authority.COMMERCIAL, Authority.COMMERCIAL, Authority.ADMIN] },
    },
    {
      path: 'deployement-type',
      name: 'DeployementType',
      component: DeployementType,
    },
    {
      path: 'deployement-type/new',
      name: 'DeployementTypeCreate',
      component: DeployementTypeUpdate,
    },
    {
      path: 'deployement-type/:deployementTypeId/edit',
      name: 'DeployementTypeEdit',
      component: DeployementTypeUpdate,
    },
    {
      path: 'deployement-type/:deployementTypeId/view',
      name: 'DeployementTypeView',
      component: DeployementTypeDetails,
    },
    {
      path: 'customisation-level',
      name: 'CustomisationLevel',
      component: CustomisationLevel,
    },
    {
      path: 'customisation-level/new',
      name: 'CustomisationLevelCreate',
      component: CustomisationLevelUpdate,
    },
    {
      path: 'customisation-level/:customisationLevelId/edit',
      name: 'CustomisationLevelEdit',
      component: CustomisationLevelUpdate,
    },
    {
      path: 'customisation-level/:customisationLevelId/view',
      name: 'CustomisationLevelView',
      component: CustomisationLevelDetails,
    },
    {
      path: 'product-version',
      name: 'ProductVersion',
      component: ProductVersion,
    },
    {
      path: 'product-version/new',
      name: 'ProductVersionCreate',
      component: ProductVersionUpdate,
    },
    {
      path: '/product-deployement-detail/:detailId/view',
      name: 'ProductDeployementDetailView',
      component: ProductDeployementDetailDetails,
    },
    {
      path: 'product-version/:productVersionId/edit',
      name: 'ProductVersionEdit',
      component: ProductVersionUpdate,
    },
    {
      path: 'product-version/:productVersionId/view',
      name: 'ProductVersionView',
      component: ProductVersionDetails,
    },
    {
      path: 'product',
      name: 'Product',
      component: Product,
    },
    {
      path: 'product/new',
      name: 'ProductCreate',
      component: ProductUpdate,
    },
    {
      path: 'product/:productId/edit',
      name: 'ProductEdit',
      component: ProductUpdate,
    },
    {
      path: 'product/:productId/view',
      name: 'ProductView',
      component: ProductDetails,
    },
    {
      path: 'product-line',
      name: 'ProductLine',
      component: ProductLine,
    },
    {
      path: 'product-line/new',
      name: 'ProductLineCreate',
      component: ProductLineUpdate,
    },
    {
      path: 'product-line/:productLineId/edit',
      name: 'ProductLineEdit',
      component: ProductLineUpdate,
    },
    {
      path: 'product-line/:productLineId/view',
      name: 'ProductLineView',
      component: ProductLineDetails,
    },
    {
      path: 'module-version',
      name: 'ModuleVersion',
      component: ModuleVersion,
    },
    {
      path: 'module-version/new',
      name: 'ModuleVersionCreate',
      component: ModuleVersionUpdate,
    },
    {
      path: 'module-version/:moduleVersionId/edit',
      name: 'ModuleVersionEdit',
      component: ModuleVersionUpdate,
    },
    {
      path: 'module-version/:moduleVersionId/view',
      name: 'ModuleVersionView',
      component: ModuleVersionDetails,
    },
    {
      path: 'module',
      name: 'Module',
      component: Module,
    },
    {
      path: 'module/new',
      name: 'ModuleCreate',
      component: ModuleUpdate,
    },
    {
      path: 'module/:moduleId/edit',
      name: 'ModuleEdit',
      component: ModuleUpdate,
    },
    {
      path: 'module/:moduleId/view',
      name: 'ModuleView',
      component: ModuleDetails,
    },
    {
      path: 'domaine',
      name: 'Domaine',
      component: Domaine,
    },
    {
      path: 'domaine/new',
      name: 'DomaineCreate',
      component: DomaineUpdate,
    },
    {
      path: 'domaine/:domaineId/edit',
      name: 'DomaineEdit',
      component: DomaineUpdate,
    },
    {
      path: 'domaine/:domaineId/view',
      name: 'DomaineView',
      component: DomaineDetails,
    },
    {
      path: 'feature',
      name: 'Feature',
      component: Feature,
    },
    {
      path: 'feature/new',
      name: 'FeatureCreate',
      component: FeatureUpdate,
    },
    {
      path: 'feature/:featureId/edit',
      name: 'FeatureEdit',
      component: FeatureUpdate,
    },
    {
      path: 'feature/:featureId/view',
      name: 'FeatureView',
      component: FeatureDetails,
    },
    {
      path: 'product-deployement',
      name: 'ProductDeployement',
      component: ProductDeployement,
    },
    {
      path: 'product-deployement/new',
      name: 'ProductDeployementCreate',
      component: ProductDeployementUpdate,
    },
    {
      path: 'product-deployement/:productDeployementId/edit',
      name: 'ProductDeployementEdit',
      component: ProductDeployementUpdate,
    },
    {
      path: 'product-deployement/:productDeployementId/view',
      name: 'ProductDeployementView',
      component: ProductDeployementDetails,
    },
    {
      path: 'product-deployement-detail',
      name: 'ProductDeployementDetail',
      component: ProductDeployementDetail,
    },
    {
      path: 'product-deployement-detail/new',
      name: 'ProductDeployementDetailCreate',
      component: ProductDeployementDetailUpdate,
    },
    {
      path: 'product-deployement-detail/:productDeployementDetailId/edit',
      name: 'ProductDeployementDetailEdit',
      component: ProductDeployementDetailUpdate,
    },
    {
      path: 'product-deployement-detail/:productDeployementDetailId/view',
      name: 'ProductDeployementDetailView',
      component: ProductDeployementDetailDetails,
    },
    {
      path: 'module-deployement',
      name: 'ModuleDeployement',
      component: ModuleDeployement,
    },
    {
      path: 'module-deployement/new',
      name: 'ModuleDeployementCreate',
      component: ModuleDeployementUpdate,
    },
    {
      path: 'module-deployement/:moduleDeployementId/edit',
      name: 'ModuleDeployementEdit',
      component: ModuleDeployementUpdate,
    },
    {
      path: 'module-deployement/:moduleDeployementId/view',
      name: 'ModuleDeployementView',
      component: ModuleDeployementDetails,
    },
    {
      path: 'feature-deployement',
      name: 'FeatureDeployement',
      component: FeatureDeployement,
    },
    {
      path: 'feature-deployement/new',
      name: 'FeatureDeployementCreate',
      component: FeatureDeployementUpdate,
    },
    {
      path: 'feature-deployement/:featureDeployementId/edit',
      name: 'FeatureDeployementEdit',
      component: FeatureDeployementUpdate,
    },
    {
      path: 'feature-deployement/:featureDeployementId/view',
      name: 'FeatureDeployementView',
      component: FeatureDeployementDetails,
    },
    {
      path: 'region',
      name: 'Region',
      component: Region,
    },
    {
      path: 'region/new',
      name: 'RegionCreate',
      component: RegionUpdate,
    },
    {
      path: 'region/:regionId/edit',
      name: 'RegionEdit',
      component: RegionUpdate,
    },
    {
      path: 'region/:regionId/view',
      name: 'RegionView',
      component: RegionDetails,
    },
    {
      path: 'client-certification',
      name: 'ClientCertification',
      component: ClientCertification,
    },
    {
      path: 'client-certification/new',
      name: 'ClientCertificationCreate',
      component: ClientCertificationUpdate,
    },
    {
      path: 'client-certification/:clientCertificationId/edit',
      name: 'ClientCertificationEdit',
      component: ClientCertificationUpdate,
    },
    {
      path: 'client-certification/:clientCertificationId/view',
      name: 'ClientCertificationView',
      component: ClientCertificationDetails,
    },
    {
      path: 'client-size',
      name: 'ClientSize',
      component: ClientSize,
    },
    {
      path: 'client-size/new',
      name: 'ClientSizeCreate',
      component: ClientSizeUpdate,
    },
    {
      path: 'client-size/:clientSizeId/edit',
      name: 'ClientSizeEdit',
      component: ClientSizeUpdate,
    },
    {
      path: 'client-size/:clientSizeId/view',
      name: 'ClientSizeView',
      component: ClientSizeDetails,
    },
    {
      path: 'client',
      name: 'Client',
      component: Client,
    },
    {
      path: 'client/new',
      name: 'ClientCreate',
      component: ClientUpdate,
    },
    {
      path: 'client/:clientId/edit',
      name: 'ClientEdit',
      component: ClientUpdate,
    },
    {
      path: 'client/:clientId/view',
      name: 'ClientView',
      component: ClientDetails,
    },
    {
      path: 'client-type',
      name: 'ClientType',
      component: ClientType,
    },
    {
      path: 'client-type/new',
      name: 'ClientTypeCreate',
      component: ClientTypeUpdate,
    },
    {
      path: 'client-type/:clientTypeId/edit',
      name: 'ClientTypeEdit',
      component: ClientTypeUpdate,
    },
    {
      path: 'client-type/:clientTypeId/view',
      name: 'ClientTypeView',
      component: ClientTypeDetails,
    },
    {
      path: 'certification',
      name: 'Certification',
      component: Certification,
    },
    {
      path: 'certification/new',
      name: 'CertificationCreate',
      component: CertificationUpdate,
    },
    {
      path: 'certification/:certificationId/edit',
      name: 'CertificationEdit',
      component: CertificationUpdate,
    },
    {
      path: 'certification/:certificationId/view',
      name: 'CertificationView',
      component: CertificationDetails,
    },
    {
      path: 'client-event',
      name: 'ClientEvent',
      component: ClientEvent,
    },
    {
      path: 'client-event/new',
      name: 'ClientEventCreate',
      component: ClientEventUpdate,
    },
    {
      path: 'client-event/:clientEventId/edit',
      name: 'ClientEventEdit',
      component: ClientEventUpdate,
    },
    {
      path: 'client-event/:clientEventId/view',
      name: 'ClientEventView',
      component: ClientEventDetails,
    },
    {
      path: 'client-event-type',
      name: 'ClientEventType',
      component: ClientEventType,
    },
    {
      path: 'client-event-type/new',
      name: 'ClientEventTypeCreate',
      component: ClientEventTypeUpdate,
    },
    {
      path: 'client-event-type/:clientEventTypeId/edit',
      name: 'ClientEventTypeEdit',
      component: ClientEventTypeUpdate,
    },
    {
      path: 'client-event-type/:clientEventTypeId/view',
      name: 'ClientEventTypeView',
      component: ClientEventTypeDetails,
    },
    {
      path: 'country',
      name: 'Country',
      component: Country,
    },
    {
      path: 'country/new',
      name: 'CountryCreate',
      component: CountryUpdate,
    },
    {
      path: 'country/:countryId/edit',
      name: 'CountryEdit',
      component: CountryUpdate,
    },
    {
      path: 'country/:countryId/view',
      name: 'CountryView',
      component: CountryDetails,
    },
    {
      path: 'ha',
      name: 'HA',
      component: HA,
    },
    {
      path: 'ha/new',
      name: 'HACreate',
      component: HAUpdate,
    },
    {
      path: 'ha/:hAId/edit',
      name: 'HAEdit',
      component: HAUpdate,
    },
    {
      path: 'ha/:hAId/view',
      name: 'HAView',
      component: HADetails,
    },
    {
      path: 'component-type',
      name: 'ComponentType',
      component: ComponentType,
    },
    {
      path: 'component-type/new',
      name: 'ComponentTypeCreate',
      component: ComponentTypeUpdate,
    },
    {
      path: 'component-type/:componentTypeId/edit',
      name: 'ComponentTypeEdit',
      component: ComponentTypeUpdate,
    },
    {
      path: 'component-type/:componentTypeId/view',
      name: 'ComponentTypeView',
      component: ComponentTypeDetails,
    },
    {
      path: 'infra-component',
      name: 'InfraComponent',
      component: InfraComponent,
    },
    {
      path: 'infra-component/new',
      name: 'InfraComponentCreate',
      component: InfraComponentUpdate,
    },
    {
      path: 'infra-component/:infraComponentId/edit',
      name: 'InfraComponentEdit',
      component: InfraComponentUpdate,
    },
    {
      path: 'infra-component/:infraComponentId/view',
      name: 'InfraComponentView',
      component: InfraComponentDetails,
    },
    {
      path: 'infra-component-version',
      name: 'InfraComponentVersion',
      component: InfraComponentVersion,
    },
    {
      path: 'infra-component-version/new',
      name: 'InfraComponentVersionCreate',
      component: InfraComponentVersionUpdate,
    },
    {
      path: 'infra-component-version/:infraComponentVersionId/edit',
      name: 'InfraComponentVersionEdit',
      component: InfraComponentVersionUpdate,
    },
    {
      path: 'infra-component-version/:infraComponentVersionId/view',
      name: 'InfraComponentVersionView',
      component: InfraComponentVersionDetails,
    },
    {
      path: 'request-of-change',
      name: 'RequestOfChange',
      component: RequestOfChange,
    },
    {
      path: 'request-of-change/new',
      name: 'RequestOfChangeCreate',
      component: RequestOfChangeUpdate,
    },
    {
      path: 'request-of-change/:requestOfChangeId/edit',
      name: 'RequestOfChangeEdit',
      component: RequestOfChangeUpdate,
    },
    {
      path: 'request-of-change/:requestOfChangeId/view',
      name: 'RequestOfChangeView',
      component: RequestOfChangeDetails,
    },
    // jhipster-needle-add-entity-to-router - JHipster will add entities to the router here
  ],
};
