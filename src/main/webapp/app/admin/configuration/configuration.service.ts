import axios from 'axios';

export default class ConfigurationService {
  public loadConfiguration(): Promise<any> {
    return new Promise(resolve => {
      axios.get('management/configprops').then(res => {
        const properties = [];
        const propertiesObject = this.getConfigPropertiesObjects(res.data);
        for (const key in propertiesObject) {
          if (Object.hasOwn(propertiesObject, key)) {
            properties.push(propertiesObject[key]);
          }
        }

        properties.sort((propertyA, propertyB) => {
          const comparePrefix = propertyA.prefix < propertyB.prefix ? -1 : 1;
          return propertyA.prefix === propertyB.prefix ? 0 : comparePrefix;
        });
        resolve(properties);
      });
    });
  }

  public loadEnvConfiguration(): Promise<any> {
    return new Promise(resolve => {
      axios.get<any>('management/env').then(res => {
        const properties = {};
        const propertySources = res.data.propertySources;

        for (const propertyObject of propertySources) {
          const name = propertyObject.name;
          const detailProperties = propertyObject.properties;
          const vals = [];
          for (const keyDetail in detailProperties) {
            if (Object.hasOwn(detailProperties, keyDetail)) {
              vals.push({ key: keyDetail, val: detailProperties[keyDetail].value });
            }
          }
          properties[name] = vals;
        }
        resolve(properties);
      });
    });
  }

  private getConfigPropertiesObjects(res): any {
    // This code is for Spring Boot 2
    if (res.contexts !== undefined) {
      for (const key in res.contexts) {
        // If the key is not bootstrap, it will be the ApplicationContext Id
        // For default app, it is baseName
        // For microservice, it is baseName-1
        if (!key.startsWith('bootstrap')) {
          return res.contexts[key].beans;
        }
      }
    }
    // by default, use the default ApplicationContext Id
    return res.contexts.sdiFrontend.beans;
  }
}
