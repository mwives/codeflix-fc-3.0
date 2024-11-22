import { NotFoundError } from '../../../../shared/domain/error/not-found.error';
import { Category } from '../../../domain/entity/category.entity';
import { CategoryInMemoryRepository } from '../../../infra/db/in-memory/category-in-memory.repository';
import { UpdateCategoryUseCase } from '../update-category/update-category.usecase';
import { DeleteCategoryUseCase } from './delete-category.usecase';

describe('DeleteCategoryUseCase Unit Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new DeleteCategoryUseCase(repository);
  });

  describe('execute', () => {
    it('should throw NotFoundError when category does not exist', async () => {
      const input = { id: '123e4567-e89b-12d3-a456-426614174000' };
      await expect(useCase.execute(input)).rejects.toThrow(
        new NotFoundError(input.id, Category),
      );
    });

    it('should delete category', async () => {
      const category = Category.fake().aCategory().build();

      await repository.insert(category);

      const input = {
        id: category.categoryId.id,
      };

      await useCase.execute(input);

      const result = await repository.findById(category.categoryId);

      expect(result).toBeNull();
    });
  });
});
