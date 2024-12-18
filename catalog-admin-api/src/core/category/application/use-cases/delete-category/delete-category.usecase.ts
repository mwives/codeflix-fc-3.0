import { CategoryId } from '@core/category/domain/entity/category.entity';
import { IUseCase } from '../../../../shared/application/use-case.interface';
import { ICategoryRepository } from '../../../domain/repository/category.repository';

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const categoryId = new CategoryId(input.id);
    await this.categoryRepo.delete(categoryId);
  }
}

export type DeleteCategoryInput = {
  id: string;
};

type DeleteCategoryOutput = void;
