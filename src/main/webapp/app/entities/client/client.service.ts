import axios from 'axios';

import { type IClient } from '@/shared/model/client.model';
import type { ClientOverview } from '@/shared/model/ClientOverview.model.ts';

const baseApiUrl = 'api/clients';

export default class ClientService {
  public generateClientReport(id: number): Promise<Blob> {
    return new Promise<Blob>((resolve, reject) => {
      axios
        .get(`${baseApiUrl}/report/${id}`, { responseType: 'blob' })
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }

  public find(id: number): Promise<IClient> {
    return new Promise<IClient>((resolve, reject) => {
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

  public create(entity: IClient): Promise<IClient> {
    return new Promise<IClient>((resolve, reject) => {
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

  public update(entity: IClient): Promise<IClient> {
    return new Promise<IClient>((resolve, reject) => {
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

  public partialUpdate(entity: IClient): Promise<IClient> {
    return new Promise<IClient>((resolve, reject) => {
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

  public retrieveClientOverviews(): Promise<ClientOverview[]> {
    return new Promise<ClientOverview[]>((resolve, reject) => {
      axios
        .get(`${baseApiUrl}/client-overviews`)
        .then(res => {
          resolve(res.data);
        })
        .catch(err => {
          reject(err);
        });
    });
  }
}
