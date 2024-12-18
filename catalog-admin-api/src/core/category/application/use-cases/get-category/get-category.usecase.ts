import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/error/not-found.error';
import { Category, CategoryId } from '../../../domain/entity/category.entity';
import { ICategoryRepository } from '../../../domain/repository/category.repository';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../@shared/category-output';

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const categoryId = new CategoryId(input.id);
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    return CategoryOutputMapper.toDTO(category);
  }
}

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;
