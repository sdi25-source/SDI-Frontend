import axios from 'axios';
import sinon from 'sinon';
import dayjs from 'dayjs';

import ClientService from './client.service';
import { DATE_FORMAT } from '@/shared/composables/date-format';
import { Client } from '@/shared/model/client.model';

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
  describe('Client Service', () => {
    let service: ClientService;
    let elemDefault;
    let currentDate: Date;

    beforeEach(() => {
      service = new ClientService();
      currentDate = new Date();
      elemDefault = new Client(
        123,
        'AAAAAAA',
        'AAAAAAA',
        'AAAAAAA',
        'AAAAAAA',
        'AAAAAAA',
        0,
        0,
        0,
        'AAAAAAA',
        'AAAAAAA',
        'AAAAAAA',
        currentDate,
        currentDate,
        'AAAAAAA',
      );
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

      it('should create a Client', async () => {
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

      it('should not create a Client', async () => {
        axiosStub.post.rejects(error);

        return service
          .create({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should update a Client', async () => {
        const returnedFromService = {
          clientLogo: 'BBBBBB',
          name: 'BBBBBB',
          code: 'BBBBBB',
          mainContactName: 'BBBBBB',
          mainContactEmail: 'BBBBBB',
          currentCardHolderNumber: 1,
          currentBruncheNumber: 1,
          currentCustomersNumber: 1,
          mainContactPhoneNumber: 'BBBBBB',
          url: 'BBBBBB',
          address: 'BBBBBB',
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

      it('should not update a Client', async () => {
        axiosStub.put.rejects(error);

        return service
          .update({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should partial update a Client', async () => {
        const patchObject = {
          clientLogo: 'BBBBBB',
          name: 'BBBBBB',
          code: 'BBBBBB',
          mainContactName: 'BBBBBB',
          currentCardHolderNumber: 1,
          currentCustomersNumber: 1,
          url: 'BBBBBB',
          address: 'BBBBBB',
          createDate: dayjs(currentDate).format(DATE_FORMAT),
          updateDate: dayjs(currentDate).format(DATE_FORMAT),
          notes: 'BBBBBB',
          ...new Client(),
        };
        const returnedFromService = Object.assign(patchObject, elemDefault);

        const expected = { createDate: currentDate, updateDate: currentDate, ...returnedFromService };
        axiosStub.patch.resolves({ data: returnedFromService });

        return service.partialUpdate(patchObject).then(res => {
          expect(res).toMatchObject(expected);
        });
      });

      it('should not partial update a Client', async () => {
        axiosStub.patch.rejects(error);

        return service
          .partialUpdate({})
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should return a list of Client', async () => {
        const returnedFromService = {
          clientLogo: 'BBBBBB',
          name: 'BBBBBB',
          code: 'BBBBBB',
          mainContactName: 'BBBBBB',
          mainContactEmail: 'BBBBBB',
          currentCardHolderNumber: 1,
          currentBruncheNumber: 1,
          currentCustomersNumber: 1,
          mainContactPhoneNumber: 'BBBBBB',
          url: 'BBBBBB',
          address: 'BBBBBB',
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

      it('should not return a list of Client', async () => {
        axiosStub.get.rejects(error);

        return service
          .retrieve()
          .then()
          .catch(err => {
            expect(err).toMatchObject(error);
          });
      });

      it('should delete a Client', async () => {
        axiosStub.delete.resolves({ ok: true });
        return service.delete(123).then(res => {
          expect(res.ok).toBeTruthy();
        });
      });

      it('should not delete a Client', async () => {
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
