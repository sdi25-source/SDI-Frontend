import axios from 'axios';
import sinon from 'sinon';
import dayjs from 'dayjs';

import DeployementTypeService from './deployement-type.service';
import { DATE_FORMAT } from '@/shared/composables/date-format';
import { DeployementType } from '@/shared/model/deployement-type.model';

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
  describe('DeployementType Service', () => {
    let service: DeployementTypeService;
    let elemDefault;
    let currentDate: Date;

    beforeEach(() => {
      service = new DeployementTypeService();
      currentDate = new Date();
      elemDefault = new DeployementType(123, 'AAAAAAA', currentDate, currentDate, 'AAAAAAA');
    });

    describe('Service methods', () => {
      it('should find an element', async () => {
        const returnedFromService = {
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
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

      it('should create a DeployementType', async () => {
        const returnedFromService = {
          id: 123,
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
          ...elemDefault,
        };
        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };

        axiosStub.post.resolves({ data: returnedFromService });
        return service.create({}).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not create a DeployementType', async () => {
        axiosStub.post.rejects(error);

        return service
          .create({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should update a DeployementType', async () => {
        const returnedFromService = {
          type: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
          notes: 'BBBBBB',
          ...elemDefault,
        };

        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };
        axiosStub.put.resolves({ data: returnedFromService });

        return service.update(expected).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not update a DeployementType', async () => {
        axiosStub.put.rejects(error);

        return service
          .update({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should partial update a DeployementType', async () => {
        const patchObject = {
          type: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
          notes: 'BBBBBB',
          ...new DeployementType(),
        };
        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };
        axiosStub.patch.resolves({ data: returnedFromService });

        return service.partialUpdate(patchObject).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not partial update a DeployementType', async () => {
        axiosStub.patch.rejects(error);

        return service
          .partialUpdate({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should return a list of DeployementType', async () => {
        const returnedFromService = {
          type: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
          notes: 'BBBBBB',
          ...elemDefault,
        };
        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };
        axiosStub.get.resolves([returnedFromService]);
        return service.retrieve().then(res => {
          expect(res).toContainEqual(expected);
        });
      });

      it('should not return a list of DeployementType', async () => {
        axiosStub.get.rejects(error);

        return service
          .retrieve()
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should delete a DeployementType', async () => {
        axiosStub.delete.resolves({ ok: true });
        return service.delete(123).then(res => {
          expect(res.ok).toBeTruthy();
        });
      });

      it('should not delete a DeployementType', async () => {
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
