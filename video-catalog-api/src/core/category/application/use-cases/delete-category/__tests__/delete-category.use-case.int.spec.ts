import { CategoryId, Category } from '@core/category/domain/category.aggregate';
import { CategoryElasticSearchRepository } from '@core/category/infra/db/elastic-search/category-elastic-search';
import { setupElasticsearch } from '@core/shared/infra/testing/global-helpers';
import { DeleteCategoryUseCase } from '../delete-category.use-case';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

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

  it('should throws error when entity not found', async () => {
    const categoryId = new CategoryId();
    await expect(() => useCase.execute({ id: categoryId.id })).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should delete a category', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    await useCase.execute({ id: category.category_id.id });

    const result = await repository.findById(category.category_id);

    expect(result?.deleted_at).not.toBeNull();
  });
});
