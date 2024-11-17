import { IRepository } from '../../../shared/domain/repository/repository.interface'
import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from '../entity/category.entity'

export interface ICategoryRepository extends IRepository<Category, Uuid> {}
