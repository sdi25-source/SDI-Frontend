import axios from 'axios';

import { type IProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';
import type { UnwrapRef } from 'vue';
import type { IProductVersion } from '@/shared/model/product-version.model.ts';

const baseApiUrl = 'api/product-deployement-details';

export default class ProductDeployementDetailService {
  public findByProductVersion(idPV: UnwrapRef<IProductVersion['id']> | undefined): Promise<IProductDeployementDetail> {
    return new Promise<IProductDeployementDetail>((resolve, reject) => {
      axios
        .get(`${baseApiUrl}/productVersion/${idPV}`)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public find(id: number): Promise<IProductDeployementDetail> {
    return new Promise<IProductDeployementDetail>((resolve, reject) => {
      axios
        .get(`${baseApiUrl}/${id}`)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public retrieve(): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      axios
        .get(baseApiUrl)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public delete(id: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      axios
        .delete(`${baseApiUrl}/${id}`)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public create(entity: IProductDeployementDetail): Promise<IProductDeployementDetail> {
    return new Promise<IProductDeployementDetail>((resolve, reject) => {
      axios
        .post(`${baseApiUrl}`, entity)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public update(entity: IProductDeployementDetail): Promise<IProductDeployementDetail> {
    return new Promise<IProductDeployementDetail>((resolve, reject) => {
      axios
        .put(`${baseApiUrl}/${entity.id}`, entity)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public partialUpdate(entity: IProductDeployementDetail): Promise<IProductDeployementDetail> {
    return new Promise<IProductDeployementDetail>((resolve, reject) => {
      axios
        .patch(`${baseApiUrl}/${entity.id}`, entity)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
  // À ajouter dans product-deployement-detail.service.ts
  public findByDeploymentId(deploymentId: number): Promise<any> {
    return new Promise<any>((resolve, reject) => {
      axios
        .get(`${baseApiUrl}?productDeployementId.equals=${deploymentId}`)
        .then(res => {
          resolve(res);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
