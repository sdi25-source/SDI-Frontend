import axios from 'axios';
import sinon from 'sinon';
import dayjs from 'dayjs';

import ModuleDeployementService from './module-deployement.service';
import { DATE_FORMAT } from '@/shared/composables/date-format';
import { ModuleDeployement } from '@/shared/model/module-deployement.model';

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
  describe('ModuleDeployement Service', () => {
    let service: ModuleDeployementService;
    let elemDefault;
    let currentDate: Date;

    beforeEach(() => {
      service = new ModuleDeployementService();
      currentDate = new Date();
      elemDefault = new ModuleDeployement(123, 'AAAAAAA', 'AAAAAAA', currentDate, currentDate);
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

      it('should create a ModuleDeployement', async () => {
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

      it('should not create a ModuleDeployement', async () => {
        axiosStub.post.rejects(error);

        return service
          .create({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should update a ModuleDeployement', async () => {
        const returnedFromService = {
          code: 'BBBBBB',
          notes: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
          ...elemDefault,
        };

        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };
        axiosStub.put.resolves({ data: returnedFromService });

        return service.update(expected).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not update a ModuleDeployement', async () => {
        axiosStub.put.rejects(error);

        return service
          .update({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should partial update a ModuleDeployement', async () => {
        const patchObject = {
          code: 'BBBBBB',
          notes: 'BBBBBB',
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
          ...new ModuleDeployement(),
        };
        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };
        axiosStub.patch.resolves({ data: returnedFromService });

        return service.partialUpdate(patchObject).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not partial update a ModuleDeployement', async () => {
        axiosStub.patch.rejects(error);

        return service
          .partialUpdate({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should return a list of ModuleDeployement', async () => {
        const returnedFromService = {
          code: 'BBBBBB',
          notes: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
          ...elemDefault,
        };
        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };
        axiosStub.get.resolves([returnedFromService]);
        return service.retrieve().then(res => {
          expect(res).toContainEqual(expected);
        });
      });

      it('should not return a list of ModuleDeployement', async () => {
        axiosStub.get.rejects(error);

        return service
          .retrieve()
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should delete a ModuleDeployement', async () => {
        axiosStub.delete.resolves({ ok: true });
        return service.delete(123).then(res => {
          expect(res.ok).toBeTruthy();
        });
      });

      it('should not delete a ModuleDeployement', async () => {
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
