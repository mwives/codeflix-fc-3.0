import {
  Category,
  CategoryId,
} from '@core/category/domain/entity/category.entity';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategoryIdStorageValidator } from './category-id-storage.validator';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';

describe('CategoryIdStorageValidator', () => {
  let categoryRepository: CategoryInMemoryRepository;
  let validator: CategoryIdStorageValidator;

  beforeEach(() => {
    categoryRepository = new CategoryInMemoryRepository();
    validator = new CategoryIdStorageValidator(categoryRepository);
  });

  describe('validate', () => {
    it('should return the category ids when they exist', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();

      await categoryRepository.bulkInsert([category1, category2]);

      const existByIdSpy = jest.spyOn(categoryRepository, 'existsById');

      const [categoryIds, categoryIdsError] = await validator.validate([
        category1.categoryId.id,
        category2.categoryId.id,
      ]);

      expect(existByIdSpy).toHaveBeenCalledWith([
        category1.categoryId,
        category2.categoryId,
      ]);
      expect(categoryIds).toEqual([category1.categoryId, category2.categoryId]);
      expect(categoryIdsError).toEqual(null);
    });

    it('should return an error when a category id does not exist', async () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();

      const existByIdSpy = jest.spyOn(categoryRepository, 'existsById');

      const [categoryIds, categoryIdsError] = await validator.validate([
        categoryId1.id,
        categoryId2.id,
      ]);

      expect(existByIdSpy).toHaveBeenCalledWith([categoryId1, categoryId2]);
      expect(categoryIds).toEqual(null);
      expect(categoryIdsError).toEqual([
        new NotFoundError(categoryId1, Category),
        new NotFoundError(categoryId2, Category),
      ]);
    });
  });
});
