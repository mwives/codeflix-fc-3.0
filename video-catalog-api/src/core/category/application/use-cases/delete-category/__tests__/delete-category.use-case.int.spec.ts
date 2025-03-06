import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { CategoryElasticSearchRepository } from '@core/category/infra/db/elastic-search/category-elastic-search';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';
import { setupElasticsearch } from '@core/shared/infra/testing/global-helpers';
import { DeleteCategoryUseCase } from '../delete-category.use-case';

describe('DeleteCategoryUseCase Integration Tests', () => {
  let useCase: DeleteCategoryUseCase;
  let repository: CategoryElasticSearchRepository;

  const esHelper = setupElasticsearch();

  beforeEach(() => {
    repository = new CategoryElasticSearchRepository(
      esHelper.esClient,
      esHelper.indexName,
    );
    useCase = new DeleteCategoryUseCase(repository);
  });

  it('should throw an error when category does not exist', async () => {
    const categoryId = new CategoryId();
    await expect(() => useCase.execute({ id: categoryId.id })).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should throw an error when there is only one category not deleted in related and a only category valid is being deleted', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);
    await esHelper.esClient.create({
      index: esHelper.indexName,
      id: '1',
      body: {
        categories: [
          {
            category_id: category.category_id.id,
            category_name: 'test',
            is_active: true,
            deleted_at: null,
            is_deleted: false,
          },
        ],
      },
      refresh: true,
    });
    await expect(() =>
      useCase.execute({ id: category.category_id.id }),
    ).rejects.toThrow('At least one category must be present in related.');
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    await useCase.execute({ id: category.category_id.id });

    const result = await repository.findById(category.category_id);

    expect(result?.deleted_at).not.toBeNull();
  });
});
