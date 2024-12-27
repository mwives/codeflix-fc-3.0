import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre.output';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { instanceToPlain } from 'class-transformer';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { GenresController } from 'src/nest-modules/genres-module/genres.controller';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { GetGenreFixture } from 'src/nest-modules/genres-module/testing/genre.fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('GenresController (e2e)', () => {
  const nestApp = startApp();

  describe('GET /genres/:id', () => {
    it('should return a genre ', async () => {
      const genreRepository = nestApp.app.get<IGenreRepository>(
        GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
      );
      const categoryRepository = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );

      const categories = Category.fake().theCategories(3).build();
      await categoryRepository.bulkInsert(categories);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .build();
      await genreRepository.insert(genre);

      const res = await request(nestApp.app.getHttpServer())
        .get(`/genres/${genre.genreId.id}`)
        .expect(200);

      const keyInResponse = GetGenreFixture.keysInResponse;
      expect(Object.keys(res.body)).toStrictEqual(['data']);
      expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

      const presenter = GenresController.serialize(
        GenreOutputMapper.toDTO(genre, categories),
      );

      const serialized = instanceToPlain(presenter);
      serialized.categoryIds = expect.arrayContaining(serialized.categoryIds);

      serialized.categories = expect.arrayContaining(
        serialized.categories.map((category) => ({
          id: category.id,
          name: category.name,
          createdAt: category.createdAt,
        })),
      );

      expect(res.body.data).toEqual(serialized);
    });
  });

  describe('when genre does not exist', () => {
    const arrange = [
      {
        id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
        expected: {
          message:
            'Genre with id(s) 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
          statusCode: 404,
          error: 'Not Found',
        },
      },
      {
        id: 'fake id',
        expected: {
          statusCode: 422,
          message: 'Validation failed (uuid is expected)',
          error: 'Unprocessable Entity',
        },
      },
    ];

    test.each(arrange)('when id is $id', async ({ id, expected }) => {
      return request(nestApp.app.getHttpServer())
        .get(`/genres/${id}`)
        .expect(expected.statusCode)
        .expect(expected);
    });
  });
});
