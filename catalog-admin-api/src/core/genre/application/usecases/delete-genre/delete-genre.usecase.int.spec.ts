import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { GenreSequelizeRepository } from '@core/genre/infra/db/sequelize/genre-sequelize.repository';
import {
  GenreCategoryModel,
  GenreModel,
} from '@core/genre/infra/db/sequelize/genre.model';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { DeleteGenreUseCase } from './delete-genre.usecase';
import { Category } from '@core/category/domain/entity/category.entity';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';

describe('DeleteGenreUsecase Integration Tests', () => {
  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  let useCase: DeleteGenreUseCase;
  let categoryRepository: CategorySequelizeRepository;
  let genreRepository: GenreSequelizeRepository;
  let uow: UnitOfWorkSequelize;

  beforeEach(() => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    useCase = new DeleteGenreUseCase(uow, genreRepository);
  });

  describe('execute', () => {
    it('should delete a genre', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepository.insert(genre);

      expect(await genreRepository.findById(genre.genreId)).not.toBeNull();

      const uowSpy = jest.spyOn(uow, 'do');

      await useCase.execute({ id: genre.genreId.id });

      expect(uowSpy).toHaveBeenCalledTimes(1);
      expect(await genreRepository.findById(genre.genreId)).toBeNull();
    });

    it('should throw an error if genre does not exist', async () => {
      await expect(useCase.execute({ id: new GenreId().id })).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
