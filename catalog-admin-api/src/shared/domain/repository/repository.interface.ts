import { Entity } from '../entity/entity'
import { ValueObject } from '../value-object/value-object'

export interface IRepository<T extends Entity, U extends ValueObject> {
  insert(entity: T): Promise<void>
  bulkInsert(entities: T[]): Promise<void>
  update(entity: T): Promise<void>
  delete(id: U): Promise<void>

  findById(id: U): Promise<T | null>
  findAll(): Promise<T[]>

  getEntity(): new (...args: any[]) => T
}
