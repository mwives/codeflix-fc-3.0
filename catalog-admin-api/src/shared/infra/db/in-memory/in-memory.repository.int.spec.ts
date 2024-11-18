import { Entity } from '../../../domain/entity/entity'
import { NotFoundError } from '../../../domain/error/not-found.error'
import { Uuid } from '../../../domain/value-object/value-objects/uuid.vo'
import { InMemoryRepository } from './in-memory.repository'

class StubEntity extends Entity {
  entityId: Uuid
  name: string
  price: number

  constructor(props: { entityId: Uuid; name: string; price: number }) {
    super()
    this.entityId = props.entityId
    this.name = props.name
    this.price = props.price
  }

  toJSON() {
    return {
      entityId: this.entityId.toString(),
      name: this.name,
      price: this.price,
    }
  }
}

export class StubInMemoryRepository extends InMemoryRepository<
  StubEntity,
  Uuid
> {
  getEntity(): new (...args: any[]) => StubEntity {
    return StubEntity
  }
}

describe('InMemoryRepository', () => {
  let repository: StubInMemoryRepository

  beforeEach(() => {
    repository = new StubInMemoryRepository()
  })

  it('should be defined', () => {
    expect(repository).toBeDefined()
  })

  describe('insert', () => {
    it('should insert entity', async () => {
      const entity = new StubEntity({
        entityId: new Uuid(),
        name: 'test',
        price: 10,
      })

      await repository.insert(entity)

      expect(repository.items).toHaveLength(1)
    })
  })

  describe('bulkInsert', () => {
    it('should insert entities', async () => {
      const entities = Array.from({ length: 5 }, (_, index) => {
        return new StubEntity({
          entityId: new Uuid(),
          name: `test-${index}`,
          price: 10 * index,
        })
      })

      await repository.bulkInsert(entities)

      expect(repository.items).toHaveLength(5)
    })
  })

  describe('update', () => {
    it('should update entity', async () => {
      const entity = new StubEntity({
        entityId: new Uuid(),
        name: 'test',
        price: 10,
      })

      await repository.insert(entity)

      entity.name = 'updated'
      entity.price = 20

      await repository.update(entity)

      expect(repository.items[0].name).toBe('updated')
      expect(repository.items[0].price).toBe(20)
    })

    it('should throw NotFoundError', async () => {
      const entity = new StubEntity({
        entityId: new Uuid(),
        name: 'test',
        price: 10,
      })

      await expect(repository.update(entity)).rejects.toThrow(NotFoundError)
    })
  })

  describe('delete', () => {
    it('should delete entity', async () => {
      const entity = new StubEntity({
        entityId: new Uuid(),
        name: 'test',
        price: 10,
      })

      await repository.insert(entity)

      await repository.delete(entity.entityId)

      expect(repository.items).toHaveLength(0)
    })

    it('should throw NotFoundError', async () => {
      const id = new Uuid()

      await expect(repository.delete(id)).rejects.toThrow(NotFoundError)
    })
  })

  describe('findById', () => {
    it('should find entity by id', async () => {
      const entity = new StubEntity({
        entityId: new Uuid(),
        name: 'test',
        price: 10,
      })

      await repository.insert(entity)

      const result = await repository.findById(entity.entityId)

      expect(result).toBeDefined()
      expect(result.entityId).toEqual(entity.entityId)
    })

    it('should return null', async () => {
      const id = new Uuid()

      const result = await repository.findById(id)

      expect(result).toBeNull()
    })
  })

  describe('findAll', () => {
    it('should return all entities', async () => {
      const entities = Array.from({ length: 5 }, (_, index) => {
        return new StubEntity({
          entityId: new Uuid(),
          name: `test-${index}`,
          price: 10 * index,
        })
      })

      await repository.bulkInsert(entities)

      const result = await repository.findAll()

      expect(result).toHaveLength(5)
    })
  })
})
