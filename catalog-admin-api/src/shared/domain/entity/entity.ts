import { ValueObject } from '../value-object/value-object'

export abstract class Entity {
  abstract get entityId(): ValueObject
  abstract toJSON(): Record<string, any>
}
