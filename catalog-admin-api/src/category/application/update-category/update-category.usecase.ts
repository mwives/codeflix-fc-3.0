import { IUseCase } from '../../../shared/application/use-case.interface'
import { NotFoundError } from '../../../shared/domain/error/not-found.error'
import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo'
import { Category } from '../../domain/entity/category.entity'
import { ICategoryRepository } from '../../domain/repository/category.repository'

export class UpdateCategoryUseCase
  implements IUseCase<UpdateCategoryInput, UpdateCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: UpdateCategoryInput): Promise<UpdateCategoryOutput> {
    const uuid = new Uuid(input.id)
    const category = await this.categoryRepo.findById(uuid)

    if (!category) {
      throw new NotFoundError(input.id, Category)
    }

    input.name && category.changeName(input.name)

    if ('description' in input) {
      category.changeDescription(input.description)
    }

    if (input.isActive === true) {
      category.activate()
    }

    if (input.isActive === false) {
      category.deactivate()
    }

    await this.categoryRepo.update(category)

    return {
      id: category.categoryId.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    }
  }
}

export type UpdateCategoryInput = {
  id: string
  name?: string
  description?: string
  isActive?: boolean
}

export type UpdateCategoryOutput = {
  id: string
  name: string
  description: string
  isActive: boolean
  createdAt: Date
}
