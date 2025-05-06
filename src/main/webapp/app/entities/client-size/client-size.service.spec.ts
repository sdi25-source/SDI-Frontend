import axios from 'axios';
import sinon from 'sinon';
import dayjs from 'dayjs';

import ClientSizeService from './client-size.service';
import { DATE_FORMAT } from '@/shared/composables/date-format';
import { ClientSize } from '@/shared/model/client-size.model';

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
  describe('ClientSize Service', () => {
    let service: ClientSizeService;
    let elemDefault;
    let currentDate: Date;

    beforeEach(() => {
      service = new ClientSizeService();
      currentDate = new Date();
      elemDefault = new ClientSize(123, 'AAAAAAA', 'AAAAAAA', 'AAAAAAA', currentDate, currentDate, 'AAAAAAA');
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

      it('should create a ClientSize', async () => {
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

      it('should not create a ClientSize', async () => {
        axiosStub.post.rejects(error);

        return service
          .create({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should update a ClientSize', async () => {
        const returnedFromService = {
          sizeName: 'BBBBBB',
          sizeCode: 'BBBBBB',
          sizeDescription: 'BBBBBB',
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

      it('should not update a ClientSize', async () => {
        axiosStub.put.rejects(error);

        return service
          .update({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should partial update a ClientSize', async () => {
        const patchObject = {
          sizeName: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          notes: 'BBBBBB',
          ...new ClientSize(),
        };
        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };
        axiosStub.patch.resolves({ data: returnedFromService });

        return service.partialUpdate(patchObject).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not partial update a ClientSize', async () => {
        axiosStub.patch.rejects(error);

        return service
          .partialUpdate({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should return a list of ClientSize', async () => {
        const returnedFromService = {
          sizeName: 'BBBBBB',
          sizeCode: 'BBBBBB',
          sizeDescription: 'BBBBBB',
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

      it('should not return a list of ClientSize', async () => {
        axiosStub.get.rejects(error);

        return service
          .retrieve()
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should delete a ClientSize', async () => {
        axiosStub.delete.resolves({ ok: true });
        return service.delete(123).then(res => {
          expect(res.ok).toBeTruthy();
        });
      });

      it('should not delete a ClientSize', async () => {
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
