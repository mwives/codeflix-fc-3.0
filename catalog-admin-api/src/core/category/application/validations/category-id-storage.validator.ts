import {
  Category,
  CategoryId,
} from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';

export class CategoryIdStorageValidator {
  constructor(private categoryRepository: ICategoryRepository) {}

  async validate(
    categoryIds: string[],
  ): Promise<Either<CategoryId[], NotFoundError[]>> {
    const categoriesId = categoryIds.map((v) => new CategoryId(v));

    const existsResult = await this.categoryRepository.existsById(categoriesId);

    return existsResult.nonExistent.length > 0
      ? Either.fail(
          existsResult.nonExistent.map(
            (c) => new NotFoundError(c.id, Category),
          ),
        )
      : Either.ok(categoriesId);
  }
}
