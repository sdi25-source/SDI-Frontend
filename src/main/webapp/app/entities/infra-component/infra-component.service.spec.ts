import axios from 'axios';
import sinon from 'sinon';
import dayjs from 'dayjs';

import InfraComponentService from './infra-component.service';
import { DATE_FORMAT } from '@/shared/composables/date-format';
import { InfraComponent } from '@/shared/model/infra-component.model';

const error = {
  response: {
    status: null,
    data: {
      type: null,
    },
  },
};

const axiosStub = {
  get: sinon.stub(axios, 'get'),
  post: sinon.stub(axios, 'post'),
  put: sinon.stub(axios, 'put'),
  patch: sinon.stub(axios, 'patch'),
  delete: sinon.stub(axios, 'delete'),
};

describe('Service Tests', () => {
  describe('InfraComponent Service', () => {
    let service: InfraComponentService;
    let elemDefault;
    let currentDate: Date;

    beforeEach(() => {
      service = new InfraComponentService();
      currentDate = new Date();
      elemDefault = new InfraComponent(123, 'AAAAAAA', 'AAAAAAA', 'AAAAAAA', currentDate);
    });

    describe('Service methods', () => {
      it('should find an element', async () => {
        const returnedFromService = { createDate: dayjs(currentDate).format(DATE_FORMAT), ...elemDefault };
        axiosStub.get.resolves({ data: returnedFromService });

        return service.find(123).then(res => {
          expect(res).toMatchObject(elemDefault);
        });
      });

      it('should not find an element', async () => {
        axiosStub.get.rejects(error);
        return service
          .find(123)
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should create a InfraComponent', async () => {
        const returnedFromService = { id: 123, createDate: dayjs(currentDate).format(DATE_FORMAT), ...elemDefault };
        const expected = { createDate: currentDate, ...returnedFromService };

        axiosStub.post.resolves({ data: returnedFromService });
        return service.create({}).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not create a InfraComponent', async () => {
        axiosStub.post.rejects(error);

        return service
          .create({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should update a InfraComponent', async () => {
        const returnedFromService = {
          name: 'BBBBBB',
          vendor: 'BBBBBB',
          notes: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          ...elemDefault,
        };

        const expected = { createDate: currentDate, ...returnedFromService };
        axiosStub.put.resolves({ data: returnedFromService });

        return service.update(expected).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not update a InfraComponent', async () => {
        axiosStub.put.rejects(error);

        return service
          .update({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should partial update a InfraComponent', async () => {
        const patchObject = { createDate: dayjs(currentDate).format(DATE_FORMAT), ...new InfraComponent() };
        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = { createDate: currentDate, ...returnedFromService };
        axiosStub.patch.resolves({ data: returnedFromService });

        return service.partialUpdate(patchObject).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not partial update a InfraComponent', async () => {
        axiosStub.patch.rejects(error);

        return service
          .partialUpdate({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should return a list of InfraComponent', async () => {
        const returnedFromService = {
          name: 'BBBBBB',
          vendor: 'BBBBBB',
          notes: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          ...elemDefault,
        };
        const expected = { createDate: currentDate, ...returnedFromService };
        axiosStub.get.resolves([returnedFromService]);
        return service.retrieve().then(res => {
          expect(res).toContainEqual(expected);
        });
      });

      it('should not return a list of InfraComponent', async () => {
        axiosStub.get.rejects(error);

        return service
          .retrieve()
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should delete a InfraComponent', async () => {
        axiosStub.delete.resolves({ ok: true });
        return service.delete(123).then(res => {
          expect(res.ok).toBeTruthy();
        });
      });

      it('should not delete a InfraComponent', async () => {
        axiosStub.delete.rejects(error);

        return service
          .delete(123)
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });
    });
  });
});
