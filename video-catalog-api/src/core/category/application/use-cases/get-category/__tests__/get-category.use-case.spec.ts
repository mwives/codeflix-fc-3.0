import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { GetCategoryUseCase } from '../get-category.use-case';

describe('GetCategoryUseCase Unit Tests', () => {
  let useCase: GetCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    useCase = new GetCategoryUseCase(repository);
  });

  it('should throws error when aggregate not found', async () => {
    const categoryId = new CategoryId();
    await expect(() => useCase.execute({ id: categoryId.id })).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should return a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    const categoryOutput = await useCase.execute({
      id: category.category_id.id,
    });

    expect(categoryOutput).toEqual({
      id: category.category_id.id,
      name: category.name,
      description: category.description,
      is_active: category.is_active,
      created_at: category.created_at,
      deleted_at: null,
    });
  });
});
