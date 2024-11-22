import { Notification } from '../validators/notification';
import { ValueObject } from '../value-object/value-object';

export abstract class Entity {
  notification: Notification = new Notification();

  [key: string]: any;
  abstract get entityId(): ValueObject;
  abstract toJSON(): Record<string, any>;
}
