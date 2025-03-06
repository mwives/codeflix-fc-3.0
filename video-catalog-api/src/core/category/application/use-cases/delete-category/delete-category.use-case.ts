import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IUseCase } from '@core/shared/application/use-case-interface';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

export class DeleteCategoryUseCase
  implements IUseCase<DeleteCategoryInput, DeleteCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: DeleteCategoryInput): Promise<DeleteCategoryOutput> {
    const categoryId = new CategoryId(input.id);
    const category = await this.categoryRepo.findById(categoryId);
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    const hasOnlyOneNotDeletedInRelated =
      await this.categoryRepo.hasOnlyOneNotDeletedInRelated(
        category.category_id,
      );

    if (hasOnlyOneNotDeletedInRelated) {
      throw new Error('At least one category must be present in related.');
    }

    category.markAsDeleted();

    await this.categoryRepo.update(category);
  }
}

export type DeleteCategoryInput = {
  id: string;
};

export type DeleteCategoryOutput = void;
