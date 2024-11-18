import { IUseCase } from '../../../../shared/application/use-case.interface'
import { NotFoundError } from '../../../../shared/domain/error/not-found.error'
import { Uuid } from '../../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from '../../../domain/entity/category.entity'
import { ICategoryRepository } from '../../../domain/repository/category.repository'

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const uuid = new Uuid(input.id)
    const category = await this.categoryRepo.findById(uuid)
    if (!category) {
      throw new NotFoundError(input.id, Category)
    }

    return {
      id: category.categoryId.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    }
  }
}

export type GetCategoryInput = {
  id: string
}

export type GetCategoryOutput = {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: Date
}
