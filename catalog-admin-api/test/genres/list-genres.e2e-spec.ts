import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import qs from 'qs';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { GENRES_PROVIDERS } from 'src/nest-modules/genres-module/genres.provider';
import { ListGenresFixture } from 'src/nest-modules/genres-module/testing/genre.fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('GenresController (e2e)', () => {
  describe('/genres (GET)', () => {
    describe('when there are no genres', () => {
      let genreRepository: IGenreRepository;
      let categoryRepository: ICategoryRepository;

      const nestApp = startApp();

      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        genreRepository = nestApp.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepository = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );

        await categoryRepository.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $label',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();
          const data = expected.entities.map((e) => ({
            id: e.genreId.id,
            name: e.name,
            isActive: e.isActive,
            categoryIds: expect.arrayContaining(
              Array.from(e.categoryIds.keys()),
            ),
            categories: expect.arrayContaining(
              Array.from(relations.categories.values())
                .filter((c) => e.categoryIds.has(c.categoryId.id))
                .map((c) => ({
                  id: c.categoryId.id,
                  name: c.name,
                  createdAt: c.createdAt.toISOString(),
                })),
            ),
            createdAt: e.createdAt.toISOString(),
          }));

          const response = await request(nestApp.app.getHttpServer())
            .get(`/genres/?${queryParams}`)
            .expect(200);

          expect(response.body).toStrictEqual({
            data: data,
            meta: expected.meta,
          });
        },
      );
    });

    describe('should return genres using paginate, filter and sort', () => {
      let genreRepo: IGenreRepository;
      let categoryRepo: ICategoryRepository;

      const nestApp = startApp();
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeUnsorted();

      beforeEach(async () => {
        genreRepo = nestApp.app.get<IGenreRepository>(
          GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
        );
        categoryRepo = nestApp.app.get<ICategoryRepository>(
          CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
        );

        await categoryRepo.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $label',
        async ({ sendData, expected }) => {
          const queryParams = qs.stringify(sendData as any);
          const data = expected.entities.map((e) => ({
            id: e.genreId.id,
            name: e.name,
            isActive: e.isActive,
            categoryIds: expect.arrayContaining(
              Array.from(e.categoryIds.keys()),
            ),
            categories: expect.arrayContaining(
              Array.from(relations.categories.values())
                .filter((c) => e.categoryIds.has(c.categoryId.id))
                .map((c) => ({
                  id: c.categoryId.id,
                  name: c.name,
                  createdAt: c.createdAt.toISOString(),
                })),
            ),
            createdAt: e.createdAt.toISOString(),
          }));

          const response = await request(nestApp.app.getHttpServer())
            .get(`/genres/?${queryParams}`)
            .expect(200);

          expect(response.body).toStrictEqual({
            data: data,
            meta: expected.meta,
          });
        },
      );
    });
  });
});
