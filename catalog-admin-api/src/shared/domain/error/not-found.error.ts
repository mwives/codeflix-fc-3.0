import { Entity } from '../entity/entity'

export class NotFoundError extends Error {
  constructor(id: any[] | any, entityClass: new (...args: any[]) => Entity) {
    const idList = Array.isArray(id) ? id.join(', ') : id
    super(`${entityClass.name} with id(s) ${idList} not found`)
    this.name = 'NotFoundError'
  }
}
