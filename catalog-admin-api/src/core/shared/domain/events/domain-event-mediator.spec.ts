import EventEmitter2 from 'eventemitter2';
import { DomainEventMediator } from './domain-event-mediator';
import { AggregateRoot } from '../entity/aggregate-root';
import { Uuid } from '../value-object/value-objects/uuid.vo';
import { ValueObject } from '../value-object/value-object';
import { IDomainEvent } from './domain-event.interface';

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
  });
});
