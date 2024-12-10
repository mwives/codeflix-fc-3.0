import { CategoryOutputMapper } from '@core/category/application/use-cases/@shared/category-output';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { ListCategoriesFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const nestApp = startApp();
  let categoryRepository: ICategoryRepository;

  beforeEach(() => {
    categoryRepository = nestApp.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('GET /categories', () => {
    describe('when no query parameters are provided', () => {
      const { entitiesMap, arrange } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await categoryRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'should return categories sorted by createdAt with query params: $sendData',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(CategoryOutputMapper.toDTO(e)),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });

    describe('when query parameters include pagination, filtering, or sorting', () => {
      const { entitiesMap, arrange } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await categoryRepository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'should return categories with the correct pagination, filtering, and sorting applied for query params: $sendData',
        async ({ sendData, expected }) => {
          const queryParams = new URLSearchParams(sendData as any).toString();
          return request(nestApp.app.getHttpServer())
            .get(`/categories/?${queryParams}`)
            .expect(200)
            .expect({
              data: expected.entities.map((e) =>
                instanceToPlain(
                  CategoriesController.serialize(CategoryOutputMapper.toDTO(e)),
                ),
              ),
              meta: expected.meta,
            });
        },
      );
    });
  });
});
