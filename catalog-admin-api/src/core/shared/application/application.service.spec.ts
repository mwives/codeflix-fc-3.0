import EventEmitter2 from 'eventemitter2';
import { AggregateRoot } from '../domain/entity/aggregate-root';
import { DomainEventMediator } from '../domain/events/domain-event-mediator';
import { IUnitOfWork } from '../domain/repository/unit-of-work.interface';
import { ValueObject } from '../domain/value-object/value-object';
import { UnitOfWorkInMemory } from '../infra/db/in-memory/unit-of-work-in-memory';
import { ApplicationService } from './application.service';

class StubAggregateRoot extends AggregateRoot {
  get entityId(): ValueObject {
    throw new Error('Method not implemented.');
  }

  toJSON(): Record<string, any> {
    throw new Error('Method not implemented.');
  }
}

describe('ApplicationService Unit Tests', () => {
  let uow: IUnitOfWork;
  let domainEventMediator: DomainEventMediator;
  let applicationService: ApplicationService;

  beforeEach(() => {
    uow = new UnitOfWorkInMemory();
    const eventEmitter = new EventEmitter2();
    domainEventMediator = new DomainEventMediator(eventEmitter);
    applicationService = new ApplicationService(uow, domainEventMediator);
  });

  describe('start', () => {
    it('should call start method of UnitOfWork', async () => {
      const startSpy = jest.spyOn(uow, 'start');
      await applicationService.start();
      expect(startSpy).toHaveBeenCalled();
    });
  });

  describe('finish', () => {
    it('should call commit method of UnitOfWork', async () => {
      const commitSpy = jest.spyOn(uow, 'commit');
      await applicationService.finish();
      expect(commitSpy).toHaveBeenCalled();
    });

    it('should call publish method of DomainEventMediator for each AggregateRoot', async () => {
      const aggregateRoot = new StubAggregateRoot();

      uow.addAggregateRoot(aggregateRoot);

      const publishSpy = jest.spyOn(domainEventMediator, 'publish');
      const publishIntegrationEventsSpy = jest.spyOn(
        domainEventMediator,
        'publishIntegrationEvents',
      );
      const commitSpy = jest.spyOn(uow, 'commit');

      await applicationService.finish();

      expect(publishSpy).toHaveBeenCalledWith(aggregateRoot);
      expect(commitSpy).toHaveBeenCalled();
      expect(publishIntegrationEventsSpy).toHaveBeenCalledWith(aggregateRoot);
    });
  });

  describe('fail', () => {
    it('should call rollback method of UnitOfWork', async () => {
      const rollbackSpy = jest.spyOn(uow, 'rollback');
      await applicationService.fail();
      expect(rollbackSpy).toHaveBeenCalled();
    });
  });

  describe('run', () => {
    it('should call start, finish and return the result of the callback', async () => {
      const callback = jest.fn().mockResolvedValue('result');

      const startSpy = jest.spyOn(applicationService, 'start');
      const finishSpy = jest.spyOn(applicationService, 'finish');

      const result = await applicationService.run(callback);

      expect(startSpy).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(finishSpy).toHaveBeenCalled();
      expect(result).toBe('result');
    });

    it('should call start, fail and throw the error of the callback', async () => {
      const error = new Error('error');
      const callback = jest.fn().mockRejectedValue(error);

      const startSpy = jest.spyOn(applicationService, 'start');
      const failSpy = jest.spyOn(applicationService, 'fail');

      await expect(applicationService.run(callback)).rejects.toThrow(error);

      expect(startSpy).toHaveBeenCalled();
      expect(callback).toHaveBeenCalled();
      expect(failSpy).toHaveBeenCalled();
    });
  });
});
