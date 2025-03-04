import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('DeleteCategoryUseCase Unit Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    jest
      .spyOn(repository, 'hasOnlyOneNotDeletedInRelated')
      .mockImplementation();
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throws error when entity not found', async () => {
    const categoryId = new CategoryId();

    await expect(() => useCase.execute({ id: categoryId.id })).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should delete a category', async () => {
    const items = [
      new Category({
        category_id: new CategoryId(),
        name: 'Movie',
        description: 'some description',
        is_active: true,
        created_at: new Date(),
      }),
    ];
    repository.items = items;

    await useCase.execute({ id: items[0].category_id.id });

    const item = await repository.findById(items[0].category_id);
    expect(item?.deleted_at).not.toBeNull();
  });
});
