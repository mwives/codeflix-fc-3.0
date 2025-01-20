import EventEmitter2 from 'eventemitter2';
import { DomainEventMediator } from './domain-event-mediator';
import { AggregateRoot } from '../entity/aggregate-root';
import { Uuid } from '../value-object/value-objects/uuid.vo';
import { ValueObject } from '../value-object/value-object';
import { IDomainEvent, IIntegrationEvent } from './domain-event.interface';

class StubEvent implements IDomainEvent {
  occurrenceDate: Date;
  eventVersion: number;

  constructor(
    public entityId: Uuid,
    public name: string,
  ) {
    this.occurrenceDate = new Date();
    this.eventVersion = 1;
  }

  getIntegrationEvent(): StubIntegrationEvent {
    return new StubIntegrationEvent(this);
  }
}

class StubIntegrationEvent implements IIntegrationEvent {
  occurrenceDate: Date;
  eventVersion: number;
  payload: any;
  eventName: string;

  constructor(event: StubEvent) {
    this.occurrenceDate = event.occurrenceDate;
    this.eventVersion = event.eventVersion;
    this.payload = event;
    this.eventName = this.constructor.name;
  }
}

class StubAggregate extends AggregateRoot {
  id: Uuid;
  name: string;

  get entityId(): ValueObject {
    return this.id;
  }

  action(name) {
    this.name = name;
    this.applyEvent(new StubEvent(this.id, this.name));
  }

  toJSON() {
    return {
      id: this.id.toString(),
      name: this.name,
    };
  }
}

describe('DomainEventMediator', () => {
  let mediator: DomainEventMediator;

  beforeEach(() => {
    const eventEmitter = new EventEmitter2();
    mediator = new DomainEventMediator(eventEmitter);
  });

  describe('register', () => {
    it('should register an event', () => {
      const handler = jest.fn();
      mediator.register('VideoCreated', handler);

      expect(mediator['eventEmitter'].listeners('VideoCreated')).toHaveLength(
        1,
      );
    });
  });

  describe('publish', () => {
    it('should publish an event', async () => {
      mediator.register(StubEvent.name, async (event: StubEvent) => {
        expect(event.name).toBe('test');
      });

      const aggregate = new StubAggregate();
      aggregate.action('test');

      await mediator.publish(aggregate);
      await mediator.publish(aggregate);
    });

    it('should not publish an integration event', () => {
      const spyEmitAsync = jest.spyOn(mediator['eventEmitter'], 'emitAsync');

      const aggregate = new StubAggregate();
      aggregate.action('test');

      Array.from(aggregate.events)[0].getIntegrationEvent = undefined;
      mediator.publishIntegrationEvents(aggregate);

      expect(spyEmitAsync).not.toHaveBeenCalled();
    });

    it('should publish integration event', async () => {
      mediator.register(
        StubIntegrationEvent.name,
        async (event: StubIntegrationEvent) => {
          expect(event.eventName).toBe(StubIntegrationEvent.name);
          expect(event.eventVersion).toBe(1);
          expect(event.occurrenceDate).toBeInstanceOf(Date);
          expect(event.payload.name).toBe('test');
        },
      );

      const aggregate = new StubAggregate();
      aggregate.action('test');
      await mediator.publishIntegrationEvents(aggregate);
    });
  });
});
