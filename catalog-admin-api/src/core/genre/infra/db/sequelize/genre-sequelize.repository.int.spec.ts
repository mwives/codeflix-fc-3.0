import { Category } from '@core/category/domain/entity/category.entity';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import {
  GenreSearchParams,
  GenreSearchResult,
} from '@core/genre/domain/repository/genre.repository';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { GenreModelMapper } from './genre-model-mapper';
import { GenreSequelizeRepository } from './genre-sequelize.repository';
import { GenreCategoryModel, GenreModel } from './genre.model';
import { InvalidArgumentError } from '@core/shared/domain/error/invalid-argument.error';

describe('GenreSequelizeRepository Integration Tests', () => {
  setupSequelize({
    models: [GenreModel, GenreCategoryModel, CategoryModel],
  });

  let genreRepository: GenreSequelizeRepository;
  let categoryRepository: CategorySequelizeRepository;

  beforeEach(async () => {
    genreRepository = new GenreSequelizeRepository(GenreModel);
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

      expect(result.existing).toHaveLength(genreIds.length);
      expect(result.notExisting).toHaveLength(1);
    });

    it('should throw an error if ids is an empty array', async () => {
      await expect(genreRepository.existsById([])).rejects.toThrow(
        InvalidArgumentError,
      );
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
  });
});
