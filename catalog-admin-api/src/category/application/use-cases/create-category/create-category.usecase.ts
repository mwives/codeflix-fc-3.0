import { IUseCase } from '../../../../shared/application/use-case.interface'
import { Category } from '../../../domain/entity/category.entity'
import { ICategoryRepository } from '../../../domain/repository/category.repository'

export class CreateCategoryUseCase
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const entity = Category.create(input)

    await this.categoryRepository.insert(entity)

    return {
      id: entity.categoryId.id,
      name: entity.name,
      description: entity.description,
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    }
  }
}

export type CreateCategoryInput = {
  name: string
  description?: string
  isActive?: boolean
}

export type CreateCategoryOutput = {
  id: string
  name: string
  description?: string
  isActive: boolean
  createdAt: Date
}
