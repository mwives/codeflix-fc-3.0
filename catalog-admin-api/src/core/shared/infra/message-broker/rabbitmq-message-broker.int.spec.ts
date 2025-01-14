import { IDomainEvent } from '@core/shared/domain/events/domain-event.interface';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { ConsumeMessage } from 'amqplib';
import { Config } from '../config';
import { RabbitMQMessageBroker } from './rabbitmq-message-broker';

class TestEvent implements IDomainEvent {
  occurrenceDate: Date = new Date();
  eventVersion: number = 1;
  payload: any = {};
  eventName: string = 'TestEvent';

  constructor(readonly entityId: Uuid) {}
}

describe('RabbitMQMessageBroker Integration tests', () => {
  let service: RabbitMQMessageBroker;
  let connection: AmqpConnection;

  beforeEach(async () => {
    connection = new AmqpConnection({
      uri: Config.rabbitmqUri(),
      connectionInitOptions: { wait: true },
      logger: {
        debug: () => {},
        error: () => {},
        info: () => {},
        warn: () => {},
        log: () => {},
      } as any,
    });

    await connection.init();

    const channel = connection.channel;
    await channel.assertExchange('test-exchange', 'direct', {
      durable: false,
    });
    await channel.assertQueue('test-queue', { durable: false });
    await channel.purgeQueue('test-queue');
    await channel.bindQueue('test-queue', 'test-exchange', 'TestEvent');

    service = new RabbitMQMessageBroker(connection);
  });

  afterEach(async () => {
    try {
      await connection.managedConnection.close();
    } catch (err) {}
  });

  describe('publish', () => {
    it('should publish event', async () => {
      const event = new TestEvent(new Uuid());

      await service.publishEvent(event);

      const msg: ConsumeMessage = await new Promise((resolve) => {
        connection.channel.consume('test-queue', (msg) => {
          resolve(msg);
        });
      });
      const msgObj = JSON.parse(msg.content.toString());

      expect(msgObj).toEqual({
        entityId: { id: event.entityId.id },
        eventVersion: 1,
        occurrenceDate: event.occurrenceDate.toISOString(),
        eventName: 'TestEvent',
        payload: {},
      });
    });
  });
});
