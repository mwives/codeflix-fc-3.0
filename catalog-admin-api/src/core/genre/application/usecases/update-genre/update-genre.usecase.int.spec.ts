import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import { Category } from '@core/category/domain/entity/category.entity';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { UpdateGenreUseCase } from './update-genre.usecase';

describe('UpdateGenreUseCase Integration Tests', () => {
  const sequelizeHelper = setupSequelize({
    models: [GenreModel, CategoryModel, GenreCategoryModel],
  });

  let useCase: UpdateGenreUseCase;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let categoryIdStorageValidator: CategoryIdStorageValidator;
  let uow: UnitOfWorkSequelize;

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    categoryIdStorageValidator = new CategoryIdStorageValidator(
      categoryRepository,
    );
    useCase = new UpdateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoryIdStorageValidator,
    );
  });

  describe('execute', () => {
    it('should update a genre', async () => {
      const [oldCategory, newCategory] = Category.fake()
        .theCategories(2)
        .build();
      await categoryRepository.bulkInsert([oldCategory, newCategory]);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(oldCategory.categoryId)
        .build();
      await genreRepository.insert(genre);

      const uowSpy = jest.spyOn(uow, 'do');

      await useCase.execute({
        id: genre.genreId.id,
        name: 'new_name',
        isActive: true,
        categoryIds: [newCategory.categoryId.id],
      });

      const updatedGenre = await genreRepository.findById(genre.genreId);

      expect(uowSpy).toHaveBeenCalledTimes(1);
      expect(updatedGenre).toMatchObject({
        name: 'new_name',
        isActive: true,
      });
      expect(updatedGenre.categoryIds.has(newCategory.categoryId.id)).toBe(
        true,
      );
      expect(updatedGenre.categoryIds.has(oldCategory.categoryId.id)).toBe(
        false,
      );
    });
  });
});
