import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { AmqpConnection, Nack } from '@golevelup/nestjs-rabbitmq';
import { ArgumentsHost } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { RabbitmqConsumeErrorFilter } from './rabbitmq-consume-error.filter';

describe('RabbitmqConsumeErrorFilter Unit Tests', () => {
  let filter: RabbitmqConsumeErrorFilter<Error>;
  let amqpConnection: AmqpConnection;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitmqConsumeErrorFilter,
        { provide: AmqpConnection, useValue: { publish: jest.fn() } },
      ],
    }).compile();

    filter = module.get<RabbitmqConsumeErrorFilter<Error>>(
      RabbitmqConsumeErrorFilter,
    );
    amqpConnection = module.get<AmqpConnection>(AmqpConnection);
  });

  it('should be defined', () => {
    expect(filter).toBeDefined();
  });

  describe('catch', () => {
    it('should return Nack if error is not retriable', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn(),
      } as unknown as ArgumentsHost;

      const error = new EntityValidationError([
        {
          key: ['value'],
        },
      ]);

      const result = await filter.catch(error, host);

      expect(host.getType).toHaveBeenCalled();
      expect(result).toEqual(new Nack(false));
      expect(host.switchToRpc).not.toHaveBeenCalled();
    });

    it('should retry if error is retriable and retry count is less than max retries', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest.fn().mockReturnValue({
            properties: { headers: { 'x-retry-count': 1 } },
            fields: { routingKey: 'test' },
            content: Buffer.from('test'),
          }),
        }),
      } as unknown as ArgumentsHost;

      await filter.catch(new Error(), host);

      expect(host.getType).toHaveBeenCalled();
      expect(amqpConnection.publish).toHaveBeenCalledWith(
        'direct.delayed',
        'test',
        Buffer.from('test'),
        {
          correlationId: undefined,
          headers: {
            'x-retry-count': 2,
            'x-delay': 5000,
          },
        },
      );
    });

    it('should retry if error is retriable and retry count is less than max retries with custom delay', async () => {
      const host = {
        getType: jest.fn().mockReturnValue('rmq'),
        switchToRpc: jest.fn().mockReturnValue({
          getContext: jest.fn().mockReturnValue({
            properties: { headers: { 'x-retry-count': 3 } },
          }),
        }),
      } as unknown as ArgumentsHost;

      const retrySpy = jest.spyOn(filter, 'retry' as any);

      const error = new Error();
      const result = await filter.catch(error, host);
      expect(host.switchToRpc).toHaveBeenCalled();
      expect(retrySpy).not.toHaveBeenCalled();
      expect(result).toEqual(new Nack(false));
    });
  });
});
