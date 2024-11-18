import { IUseCase } from '../../../shared/application/use-case.interface'
import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo'
import { ICategoryRepository } from '../../domain/repository/category.repository'

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const uuid = new Uuid(input.id)
    await this.categoryRepo.delete(uuid)
  }
}

export type DeleteCategoryInput = {
  id: string
}

type DeleteCategoryOutput = void
