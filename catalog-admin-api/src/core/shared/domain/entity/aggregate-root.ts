import EventEmitter2 from 'eventemitter2';
import { IDomainEvent } from '../events/domain-event.interface';
import { Entity } from './entity';

export abstract class AggregateRoot extends Entity {
  events: Set<IDomainEvent> = new Set<IDomainEvent>();
  localMediator = new EventEmitter2();

  applyEvent(event: IDomainEvent) {
    this.events.add(event);
    this.localMediator.emit(event.constructor.name, event);
  }

  registerHandler(event: string, handler: (event: IDomainEvent) => void) {
    this.localMediator.on(event, handler);
  }
}
