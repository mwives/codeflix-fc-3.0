import { ValueObject } from '../value-object/value-object';

export interface IDomainEvent {
  entityId: ValueObject;
  occurrenceDate: Date;
  eventVersion: number;
  getIntegrationEvent?(): IIntegrationEvent;
}

export interface IIntegrationEvent<T = any> {
  eventVersion: number;
  occurrenceDate: Date;
  payload: T;
  eventName: string;
}
