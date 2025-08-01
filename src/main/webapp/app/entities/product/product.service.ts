import axios from 'axios';

import { type IProduct } from '@/shared/model/product.model';
import type { ProductOverview } from '@/shared/model/product-overview.model.ts';

const baseApiUrl = 'api/products';

export default class ProductService {
  public find(id: number): Promise<IProduct> {
    return new Promise<IProduct>((resolve, reject) => {
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

  public create(entity: IProduct): Promise<IProduct> {
    return new Promise<IProduct>((resolve, reject) => {
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

  public update(entity: IProduct): Promise<IProduct> {
    return new Promise<IProduct>((resolve, reject) => {
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

  public partialUpdate(entity: IProduct): Promise<IProduct> {
    return new Promise<IProduct>((resolve, reject) => {
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


  public retrieveProductOverviews(): Promise<ProductOverview[]> {
    return new Promise<ProductOverview[]>((resolve, reject) => {
      axios
        .get(`${baseApiUrl}/product-overviews`)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
