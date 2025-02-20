import { setupSequelize } from '../../../../shared/infra/testing/helpers';
import { Category } from '../../../domain/entity/category.entity';
import { CategorySequelizeRepository } from '../../../infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '../../../infra/db/sequelize/category.model';
import {
  ListCategoriesInput,
  ListCategoriesOutput,
  ListCategoriesUseCase,
} from './list-categories.usecase';

describe('ListCategoriesUseCase Integration Tests', () => {
  setupSequelize({ models: [CategoryModel] });

  let useCase: ListCategoriesUseCase;
  let repository: CategorySequelizeRepository;

  beforeEach(() => {
    repository = new CategorySequelizeRepository(CategoryModel);
    useCase = new ListCategoriesUseCase(repository);
  });

  describe('execute', () => {
    it('should return an empty list when no categories exist', async () => {
      const input: ListCategoriesInput = { page: 1, perPage: 10 };
      const output: ListCategoriesOutput = await useCase.execute(input);

      expect(output).toEqual({
        items: [],
        total: 0,
        currentPage: 1,
        perPage: 10,
        lastPage: 0,
      });
    });

    it('should return paginated categories', async () => {
      const categories = [
        Category.fake().aCategory().withName('category_1').build(),
        Category.fake().aCategory().withName('category_2').build(),
        Category.fake().aCategory().withName('category_3').build(),
      ];

      for (const category of categories) {
        await repository.insert(category);
      }

      const input: ListCategoriesInput = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'asc',
      };
      const output: ListCategoriesOutput = await useCase.execute(input);

      expect(output).toEqual({
        items: expect.arrayContaining([
          expect.objectContaining({ name: 'category_1' }),
          expect.objectContaining({ name: 'category_2' }),
        ]),
        total: 3,
        currentPage: 1,
        perPage: 2,
        lastPage: 2,
      });
    });

    it('should filter categories by name', async () => {
      const categories = [
        Category.fake().aCategory().build(),
        Category.fake().aCategory().build(),
        Category.fake().aCategory().withName('any_name').build(),
      ];

      for (const category of categories) {
        await repository.insert(category);
      }

      const input: ListCategoriesInput = { filter: 'any_name' };
      const output: ListCategoriesOutput = await useCase.execute(input);

      expect(output).toEqual({
        items: expect.arrayContaining([
          expect.objectContaining({ name: 'any_name' }),
        ]),
        total: 1,
        currentPage: 1,
        perPage: 15,
        lastPage: 1,
      });
    });
  });
});
