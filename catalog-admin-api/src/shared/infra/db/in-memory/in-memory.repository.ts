import { Entity } from '../../../domain/entity/entity'
import { NotFoundError } from '../../../domain/error/not-found.error'
import { IRepository } from '../../../domain/repository/repository.interface'
import { ValueObject } from '../../../domain/value-object/value-object'

export abstract class InMemoryRepository<
  T extends Entity,
  U extends ValueObject
> implements IRepository<T, U>
{
  items: T[] = []

  async insert(entity: T): Promise<void> {
    this.items.push(entity)
  }

  async bulkInsert(entities: T[]): Promise<void> {
    this.items.push(...entities)
  }

  async update(entity: T): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entityId.equals(entity.entityId)
    )
    if (index === -1) {
      throw new NotFoundError(entity.entityId, this.getEntity())
    }
    this.items[index] = entity
  }

  async delete(id: U): Promise<void> {
    const index = this.items.findIndex((item) => item.entityId.equals(id))
    if (index === -1) {
      throw new NotFoundError(id, this.getEntity())
    }
    this.items.splice(index, 1)
  }

  async findById(id: U): Promise<T> {
    return this._get(id)
  }

  protected async _get(id: U): Promise<T> {
    const entity = this.items.find((item) => item.entityId.equals(id))
    return typeof entity === 'undefined' ? null : entity
  }

  async findAll(): Promise<T[]> {
    return this.items
  }

  abstract getEntity(): new (...args: any[]) => T
}
