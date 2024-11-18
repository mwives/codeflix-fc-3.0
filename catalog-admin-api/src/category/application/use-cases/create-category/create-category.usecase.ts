import { IUseCase } from '../../../../shared/application/use-case.interface'
import { Category } from '../../../domain/entity/category.entity'
import { ICategoryRepository } from '../../../domain/repository/category.repository'
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../@shared/category-output'

export class CreateCategoryUseCase
  implements IUseCase<CreateCategoryInput, CreateCategoryOutput>
{
  constructor(private readonly categoryRepository: ICategoryRepository) {}

  async execute(input: CreateCategoryInput): Promise<CreateCategoryOutput> {
    const category = Category.create(input)
    await this.categoryRepository.insert(category)
    return CategoryOutputMapper.toDTO(category)
  }
}

export type CreateCategoryInput = {
  name: string
  description?: string
  isActive?: boolean
}

export type CreateCategoryOutput = CategoryOutput
