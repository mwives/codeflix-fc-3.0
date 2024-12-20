import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre.output';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { instanceToPlain } from 'class-transformer';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { GenresController } from 'src/nest-modules/genres-module/genres.controller';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { UpdateGenreFixture } from 'src/nest-modules/genres-module/testing/genre.fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('GenresController (e2e)', () => {
  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('PATCH /genres/:id', () => {
    describe('should update a genre', () => {
      const app = startApp();
      const arrange = UpdateGenreFixture.arrangeForSave();
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;
      beforeEach(async () => {
        genreRepo = app.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepo = app.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected, relations }) => {
          const category = Category.fake().aCategory().build();
          await categoryRepo.bulkInsert([category, ...relations.categories]);
          const genreCreated = Genre.fake()
            .aGenre()
            .addCategoryId(category.categoryId)
            .build();
          await genreRepo.insert(genreCreated);

          const res = await request(app.app.getHttpServer())
            .patch(`/genres/${genreCreated.genreId.id}`)
            .send(sendData)
            .expect(200);

          const keyInResponse = UpdateGenreFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);
          const id = res.body.data.id;
          const genreUpdated = await genreRepo.findById(new GenreId(id));
          const presenter = GenresController.serialize(
            GenreOutputMapper.toDTO(genreUpdated, relations.categories),
          );
          const serialized = instanceToPlain(presenter);
          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            ...expected,
          });
        },
      );
    });

    describe('when genre not found', () => {
      const nestApp = startApp();
      const faker = Genre.fake().aGenre();
      const arrange = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          sendData: { name: faker.name },
          expected: {
            message:
              'Genre with id(s) 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
            statusCode: 404,
            error: 'Not Found',
          },
        },
        {
          id: 'fake id',
          sendData: { name: faker.name },
          expected: {
            statusCode: 422,
            message: 'Validation failed (uuid is expected)',
            error: 'Unprocessable Entity',
          },
        },
      ];

      test.each(arrange)(
        'when id is $id',
        async ({ id, sendData, expected }) => {
          return request(nestApp.app.getHttpServer())
            .patch(`/genres/${id}`)
            .send(sendData)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('when body is invalid', () => {
      const app = startApp();
      const invalidRequest = UpdateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));
      test.each(arrange)('when body is $label', ({ value }) => {
        return request(app.app.getHttpServer())
          .patch(`/genres/${uuid}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('when entity validation error', () => {
      const app = startApp();
      const validationErrors =
        UpdateGenreFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;

      beforeEach(() => {
        genreRepo = app.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepo = app.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });
      test.each(arrange)('when body is $label', async ({ value }) => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);
        const genre = Genre.fake()
          .aGenre()
          .addCategoryId(category.categoryId)
          .build();
        await genreRepo.insert(genre);
        return request(app.app.getHttpServer())
          .patch(`/genres/${genre.genreId.id}`)
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });
  });
});
