import { ValueObject } from '../value-object/value-object'

export abstract class Entity {
  [key: string]: any
  abstract get entityId(): ValueObject
  abstract toJSON(): Record<string, any>
}
