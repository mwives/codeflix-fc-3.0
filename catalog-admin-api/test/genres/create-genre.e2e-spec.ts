import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre.output';
import { GenreId } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { instanceToPlain } from 'class-transformer';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { GenresController } from 'src/nest-modules/genres-module/genres.controller';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { CreateGenreFixture } from 'src/nest-modules/genres-module/testing/genre.fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('GenresController (e2e)', () => {
  describe('POST /genres', () => {
    describe('should a response error with 422 when request body is invalid', () => {
      const appHelper = startApp();
      const invalidRequest = CreateGenreFixture.arrangeInvalidRequest();
      const arrange = Object.keys(invalidRequest).map((key) => ({
        label: key,
        value: invalidRequest[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should a response error with 422 when throw EntityValidationError', () => {
      const appHelper = startApp();
      const validationErrors =
        CreateGenreFixture.arrangeForEntityValidationError();
      const arrange = Object.keys(validationErrors).map((key) => ({
        label: key,
        value: validationErrors[key],
      }));

      test.each(arrange)('when body is $label', ({ value }) => {
        return request(appHelper.app.getHttpServer())
          .post('/genres')
          .send(value.sendData)
          .expect(422)
          .expect(value.expected);
      });
    });

    describe('should create a genre', () => {
      const app = startApp();
      const arrange = CreateGenreFixture.arrangeForSave();

      let genreRepository: IGenreRepository;
      let categoryRepository: ICategoryRepository;

      beforeEach(async () => {
        genreRepository = app.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepository = app.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );
      });

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected, relations }) => {
          await categoryRepository.bulkInsert(relations.categories);

          const res = await request(app.app.getHttpServer())
            .post('/genres')
            .send(sendData)
            .expect(201);

          const keyInResponse = CreateGenreFixture.keysInResponse;

          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keyInResponse);

          const id = res.body.data.id;
          const genreCreated = await genreRepository.findById(new GenreId(id));
          const presenter = GenresController.serialize(
            GenreOutputMapper.toDTO(genreCreated!, relations.categories),
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
  });
});
