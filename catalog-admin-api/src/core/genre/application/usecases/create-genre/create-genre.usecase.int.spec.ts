import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import {
  GenreModel,
  GenreCategoryModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CreateGenreUseCase } from './create-genre.usecase';
import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import { Category } from '@core/category/domain/entity/category.entity';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { DatabaseError } from 'sequelize';

describe('CreateGenreUseCase Integration Tests', () => {
  let uow: UnitOfWorkSequelize;
  let useCase: CreateGenreUseCase;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;
  let categoryIdStorageValidator: CategoryIdStorageValidator;

  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    categoryIdStorageValidator = new CategoryIdStorageValidator(
      categoryRepository,
    );
    useCase = new CreateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoryIdStorageValidator,
    );
  });

  describe('execute', () => {
    it('should create a genre', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const output = await useCase.execute({
        name: 'any_name',
        categoryIds: [category.categoryId.id],
      });

      const genreFound = await genreRepository.findById(new GenreId(output.id));

      expect(output).toMatchObject({
        id: genreFound.genreId.id,
        name: genreFound.name,
        isActive: genreFound.isActive,
        categories: [
          {
            id: category.categoryId.id,
            name: category.name,
            createdAt: category.createdAt,
          },
        ],
        createdAt: genreFound.createdAt,
      });
    });
  });
});
