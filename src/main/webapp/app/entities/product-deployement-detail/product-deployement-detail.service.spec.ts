import axios from 'axios';
import sinon from 'sinon';
import dayjs from 'dayjs';

import ProductDeployementDetailService from './product-deployement-detail.service';
import { DATE_FORMAT } from '@/shared/composables/date-format';
import { ProductDeployementDetail } from '@/shared/model/product-deployement-detail.model';

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
  describe('ProductDeployementDetail Service', () => {
    let service: ProductDeployementDetailService;
    let elemDefault;
    let currentDate: Date;

    beforeEach(() => {
      service = new ProductDeployementDetailService();
      currentDate = new Date();
      elemDefault = new ProductDeployementDetail(123, currentDate, currentDate, 'AAAAAAA');
    });

    describe('Service methods', () => {
      it('should find an element', async () => {
        const returnedFromService = {
          startDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          endDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          ...elemDefault,
        };
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

      it('should create a ProductDeployementDetail', async () => {
        const returnedFromService = {
          id: 123,
          startDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          endDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          ...elemDefault,
        };
        const expected = { startDeployementDate: currentDate, endDeployementDate: currentDate, ...returnedFromService };

        axiosStub.post.resolves({ data: returnedFromService });
        return service.create({}).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not create a ProductDeployementDetail', async () => {
        axiosStub.post.rejects(error);

        return service
          .create({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should update a ProductDeployementDetail', async () => {
        const returnedFromService = {
          startDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          endDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          notes: 'BBBBBB',
          ...elemDefault,
        };

        const expected = { startDeployementDate: currentDate, endDeployementDate: currentDate, ...returnedFromService };
        axiosStub.put.resolves({ data: returnedFromService });

        return service.update(expected).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not update a ProductDeployementDetail', async () => {
        axiosStub.put.rejects(error);

        return service
          .update({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should partial update a ProductDeployementDetail', async () => {
        const patchObject = {
          endDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          notes: 'BBBBBB',
          ...new ProductDeployementDetail(),
        };
        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = { startDeployementDate: currentDate, endDeployementDate: currentDate, ...returnedFromService };
        axiosStub.patch.resolves({ data: returnedFromService });

        return service.partialUpdate(patchObject).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not partial update a ProductDeployementDetail', async () => {
        axiosStub.patch.rejects(error);

        return service
          .partialUpdate({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should return a list of ProductDeployementDetail', async () => {
        const returnedFromService = {
          startDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          endDeployementDate: dayjs(currentDate).format(DATE_FORMAT),
          notes: 'BBBBBB',
          ...elemDefault,
        };
        const expected = { startDeployementDate: currentDate, endDeployementDate: currentDate, ...returnedFromService };
        axiosStub.get.resolves([returnedFromService]);
        return service.retrieve().then(res => {
          expect(res).toContainEqual(expected);
        });
      });

      it('should not return a list of ProductDeployementDetail', async () => {
        axiosStub.get.rejects(error);

        return service
          .retrieve()
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should delete a ProductDeployementDetail', async () => {
        axiosStub.delete.resolves({ ok: true });
        return service.delete(123).then(res => {
          expect(res.ok).toBeTruthy();
        });
      });

      it('should not delete a ProductDeployementDetail', async () => {
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
