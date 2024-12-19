import { Category } from '@core/category/domain/entity/category.entity';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import {
  GenreSearchParams,
  GenreSearchResult,
} from '@core/genre/domain/repository/genre.repository';
import { InvalidArgumentError } from '@core/shared/domain/error/invalid-argument.error';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { GenreSequelizeRepository } from './genre-sequelize.repository';
import { GenreCategoryModel, GenreModel } from './genre.model';

describe('GenreSequelizeRepository Integration Tests', () => {
  const sequelizeHelper = setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  let uow: UnitOfWorkSequelize;
  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;

  beforeEach(async () => {
    uow = new UnitOfWorkSequelize(sequelizeHelper.sequelize);
    genreRepository = new GenreSequelizeRepository(GenreModel, uow);
    categoryRepository = new CategorySequelizeRepository(CategoryModel);
  });

  describe('insert', () => {
    it('should insert a genre', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepository.insert(genre);

      const genreFound = await genreRepository.findById(genre.genreId);

      expect(genreFound.toJSON()).toEqual(genre.toJSON());
    });

    describe('with transaction', () => {
      it('should insert a genre with transaction', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.categoryId)
          .build();

        uow.start();
        await genreRepository.insert(genre);
        await uow.commit();

        const genreFound = await genreRepository.findById(genre.genreId);
        expect(genreFound.genreId).toBeValueObject(genre.genreId);
      });

      it('should rollback if an error occurs', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.categoryId)
          .build();

        uow.start();
        await genreRepository.insert(genre);
        await uow.rollback();

        await expect(
          genreRepository.findById(genre.genreId),
        ).resolves.toBeNull();
      });
    });
  });

  describe('bulkInsert', () => {
    it('should insert multiple genres', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepository.bulkInsert(categories);

      const genres = Genre.fake()
        .theGenres(2)
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .build();
      await genreRepository.bulkInsert(genres);

      const genresFound = await genreRepository.findAll();

      expect(genresFound).toHaveLength(genres.length);
      expect(genresFound[0].toJSON()).toEqual({
        ...genres[0].toJSON(),
        categoryIds: expect.arrayContaining([
          categories[0].categoryId.id,
          categories[1].categoryId.id,
          categories[2].categoryId.id,
        ]),
      });
    });

    describe('with transaction', () => {
      it('should insert multiple genres with transaction', async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);

        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(categories[0].categoryId)
          .addCategoryId(categories[1].categoryId)
          .addCategoryId(categories[2].categoryId)
          .build();

        uow.start();
        await genreRepository.bulkInsert(genres);
        await uow.commit();

        const genresFound = await genreRepository.findAll();

        expect(genresFound).toHaveLength(genres.length);
        expect(genresFound[0].toJSON()).toEqual({
          ...genres[0].toJSON(),
          categoryIds: expect.arrayContaining([
            categories[0].categoryId.id,
            categories[1].categoryId.id,
            categories[2].categoryId.id,
          ]),
        });
      });

      it('should rollback if an error occurs', async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);

        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(categories[0].categoryId)
          .addCategoryId(categories[1].categoryId)
          .addCategoryId(categories[2].categoryId)
          .build();

        uow.start();
        await genreRepository.bulkInsert(genres);
        await uow.rollback();

        const genresFound = await genreRepository.findAll();

        expect(genresFound).toHaveLength(0);
      });
    });
  });

  describe('findById', () => {
    it('should find a genre by id', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepository.insert(genre);

      const genreFound = await genreRepository.findById(genre.genreId);

      expect(genreFound.toJSON()).toEqual(genre.toJSON());
    });

    describe('with transaction', () => {
      it('should find a genre by id with transaction', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.categoryId)
          .build();

        uow.start();
        await genreRepository.insert(genre);

        const genreFound = await genreRepository.findById(genre.genreId);
        expect(genreFound.genreId).toBeValueObject(genre.genreId);

        await uow.commit();
      });
    });
  });

  describe('findAll', () => {
    it('should find all genres', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepository.bulkInsert(categories);

      const genres = Genre.fake()
        .theGenres(2)
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .build();
      await genreRepository.bulkInsert(genres);

      const genresFound = await genreRepository.findAll();

      expect(genresFound).toHaveLength(genres.length);
      expect(genresFound[0].toJSON()).toEqual({
        ...genres[0].toJSON(),
        categoryIds: expect.arrayContaining([
          categories[0].categoryId.id,
          categories[1].categoryId.id,
        ]),
      });
    });

    describe('with transaction', () => {
      it('should find all genres with transaction', async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);

        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(categories[0].categoryId)
          .addCategoryId(categories[1].categoryId)
          .build();

        uow.start();
        await genreRepository.bulkInsert(genres);

        const genresFound = await genreRepository.findAll();

        expect(genresFound).toHaveLength(genres.length);
        expect(genresFound[0].toJSON()).toEqual({
          ...genres[0].toJSON(),
          categoryIds: expect.arrayContaining([
            categories[0].categoryId.id,
            categories[1].categoryId.id,
          ]),
        });

        await uow.commit();
      });
    });
  });

  describe('findByIds', () => {
    it('should find genres by ids', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genres = Genre.fake()
        .theGenres(2)
        .addCategoryId(category.categoryId)
        .build();

      await genreRepository.bulkInsert(genres);

      const genresFound = await genreRepository.findByIds(
        genres.map((g) => g.genreId),
      );

      expect(genresFound).toHaveLength(genres.length);
    });

    describe('with transaction', () => {
      it('should find genres by ids with transaction', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(category.categoryId)
          .build();

        uow.start();
        await genreRepository.bulkInsert(genres);

        const genresFound = await genreRepository.findByIds(
          genres.map((g) => g.genreId),
        );
        expect(genresFound).toHaveLength(genres.length);

        await uow.commit();
      });
    });
  });

  describe('existsById', () => {
    it('should return exists and not exists genres', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genres = Genre.fake()
        .theGenres(2)
        .addCategoryId(category.categoryId)
        .build();

      await genreRepository.bulkInsert(genres);

      const genreIds = genres.map((g) => g.genreId);
      const genreIdsCopy = [...genreIds];
      genreIdsCopy.push(new GenreId());

      const result = await genreRepository.existsById(genreIdsCopy);

      expect(result.existent).toHaveLength(genreIds.length);
      expect(result.nonExistent).toHaveLength(1);
    });

    it('should throw an error if ids is an empty array', async () => {
      await expect(genreRepository.existsById([])).rejects.toThrow(
        InvalidArgumentError,
      );
    });

    describe('with transaction', () => {
      it('should return exists and not exists genres with transaction', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genres = Genre.fake()
          .theGenres(2)
          .addCategoryId(category.categoryId)
          .build();

        uow.start();
        await genreRepository.bulkInsert(genres);

        const genreIds = genres.map((g) => g.genreId);
        const genreIdsCopy = [...genreIds];
        genreIdsCopy.push(new GenreId());

        const result = await genreRepository.existsById(genreIdsCopy);

        expect(result.existent).toHaveLength(genreIds.length);
        expect(result.nonExistent).toHaveLength(1);

        await uow.commit();
      });
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepository.insert(genre);

      genre.changeName('new name');

      await genreRepository.update(genre);

      const genreFound = await genreRepository.findById(genre.genreId);

      expect(genreFound.toJSON()).toEqual(genre.toJSON());
      expect(genreFound.name).toBe('new name');
    });

    it('should throw an error if genre does not exist', async () => {
      const genre = Genre.fake().aGenre().build();

      await expect(genreRepository.update(genre)).rejects.toThrow(
        NotFoundError,
      );
    });

    describe('with transaction', () => {
      it('should update a genre with transaction', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.categoryId)
          .build();

        uow.start();
        await genreRepository.insert(genre);

        genre.changeName('new name');

        await genreRepository.update(genre);
        await uow.commit();

        const genreFound = await genreRepository.findById(genre.genreId);

        expect(genreFound.toJSON()).toEqual(genre.toJSON());
        expect(genreFound.name).toBe('new name');
      });

      it('should rollback if an error occurs', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.categoryId)
          .build();

        await genreRepository.insert(genre);

        genre.changeName('new name');

        await uow.start();
        await genreRepository.update(genre);
        await uow.rollback();

        const genreFound = await genreRepository.findById(genre.genreId);

        expect(genreFound.name).not.toBe('new name');
      });
    });
  });

  describe('delete', () => {
    it('should delete a genre', async () => {
      const category = Category.fake().aCategory().build();
      await categoryRepository.insert(category);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(category.categoryId)
        .build();
      await genreRepository.insert(genre);

      await genreRepository.delete(genre.genreId);

      const genreFound = await genreRepository.findById(genre.genreId);
      expect(genreFound).toBeNull();
    });

    it('should throw an error if genre does not exist', async () => {
      const genreId = new GenreId();

      await expect(genreRepository.delete(genreId)).rejects.toThrow(
        NotFoundError,
      );
    });

    describe('with transaction', () => {
      it('should delete a genre with transaction', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.categoryId)
          .build();
        await genreRepository.insert(genre);

        uow.start();
        await genreRepository.delete(genre.genreId);
        await uow.commit();

        const genreFound = await genreRepository.findById(genre.genreId);
        expect(genreFound).toBeNull();
      });

      it('should rollback if an error occurs', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepository.insert(category);

        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.categoryId)
          .build();
        await genreRepository.insert(genre);

        await uow.start();
        await genreRepository.delete(genre.genreId);
        await uow.rollback();

        const genreFound = await genreRepository.findById(genre.genreId);
        expect(genreFound).not.toBeNull();
      });
    });
  });

  describe('search', () => {
    it('should order by created_at DESC when search params are null', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepository.bulkInsert(categories);

      const genres = Genre.fake()
        .theGenres(16)
        .withCreatedAt((index) => new Date(new Date().getTime() + 100 + index))
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .build();
      await genreRepository.bulkInsert(genres);

      const searchOutput = await genreRepository.search(
        GenreSearchParams.create(),
      );

      expect(searchOutput).toBeInstanceOf(GenreSearchResult);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });
      expect(searchOutput.items).toHaveLength(15);
    });

    it('should order by name ASC when search params are provided', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepository.bulkInsert(categories);

      const genres = Genre.fake()
        .theGenres(16)
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .build();
      await genreRepository.bulkInsert(genres);

      const searchOutput = await genreRepository.search(
        GenreSearchParams.create({
          sort: 'name',
          sortDir: 'asc',
        }),
      );

      expect(searchOutput).toBeInstanceOf(GenreSearchResult);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 16,
        currentPage: 1,
        lastPage: 2,
        perPage: 15,
      });
      expect(searchOutput.items).toHaveLength(15);
    });

    it('should filter by name when search params are provided', async () => {
      const categories = Category.fake().theCategories(3).build();
      await categoryRepository.bulkInsert(categories);

      const genres = Genre.fake()
        .theGenres(16)
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .build();
      await genreRepository.bulkInsert(genres);

      const searchOutput = await genreRepository.search(
        GenreSearchParams.create({
          filter: {
            name: genres[0].name,
          },
        }),
      );

      expect(searchOutput).toBeInstanceOf(GenreSearchResult);
      expect(searchOutput.toJSON()).toMatchObject({
        total: 1,
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
      });
      expect(searchOutput.items).toHaveLength(1);
    });

    describe('with transaction', () => {
      it('should return genres with transaction', async () => {
        const categories = Category.fake().theCategories(3).build();
        await categoryRepository.bulkInsert(categories);

        const genres = Genre.fake()
          .theGenres(16)
          .addCategoryId(categories[0].categoryId)
          .addCategoryId(categories[1].categoryId)
          .addCategoryId(categories[2].categoryId)
          .build();

        uow.start();
        await genreRepository.bulkInsert(genres);

        const searchOutput = await genreRepository.search(
          GenreSearchParams.create(),
        );

        expect(searchOutput).toBeInstanceOf(GenreSearchResult);
        expect(searchOutput.toJSON()).toMatchObject({
          total: 16,
          currentPage: 1,
          lastPage: 2,
          perPage: 15,
        });
        expect(searchOutput.items).toHaveLength(15);

        await uow.commit();
      });
    });
  });
});
