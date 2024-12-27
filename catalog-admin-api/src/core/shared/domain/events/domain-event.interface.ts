import { ValueObject } from '../value-object/value-object';

export interface IDomainEvent {
  entityId: ValueObject;
  occurrenceDate: Date;
  eventVersion: number;
}
