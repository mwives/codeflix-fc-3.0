import { IDomainEvent } from '../events/domain-event.interface';
import { Uuid } from '../value-object/value-objects/uuid.vo';
import { AggregateRoot } from './aggregate-root';

class TestEvent implements IDomainEvent {
  constructor(
    public entityId: Uuid,
    public occurrenceDate: Date,
    public eventVersion: number,
  ) {}
}

class TestAggregateRoot extends AggregateRoot {
  get entityId(): Uuid {
    throw new Error('Method not implemented.');
  }

  toJSON(): Record<string, any> {
    throw new Error('Method not implemented.');
  }
}

describe('AggregateRoot', () => {
  let aggregateRoot: TestAggregateRoot;
  let testEvent: TestEvent;

  beforeEach(() => {
    aggregateRoot = new TestAggregateRoot();
    testEvent = new TestEvent(new Uuid(), new Date(), 1);
  });

  it('should add an event to the events set when applyEvent is called', () => {
    aggregateRoot.applyEvent(testEvent);

    expect(aggregateRoot.events.has(testEvent)).toBe(true);
  });

  it('should trigger the registered handler when an event is emitted', () => {
    const handlerMock = jest.fn();

    aggregateRoot.registerHandler(TestEvent.name, handlerMock);
    aggregateRoot.applyEvent(testEvent);

    expect(handlerMock).toHaveBeenCalledTimes(1);
    expect(handlerMock).toHaveBeenCalledWith(testEvent);
  });

  it('should not call a handler for an unregistered event type', () => {
    const handlerMock = jest.fn();

    aggregateRoot.registerHandler('SomeOtherEvent', handlerMock);
    aggregateRoot.applyEvent(testEvent);

    expect(handlerMock).not.toHaveBeenCalled();
  });
});
