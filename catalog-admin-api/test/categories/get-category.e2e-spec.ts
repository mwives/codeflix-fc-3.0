import { CategoryOutputMapper } from '@core/category/application/use-cases/@shared/category-output';
import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { GetCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const nestApp = startApp();

  describe('GET /categories/:id', () => {
    let categoryRepo: ICategoryRepository;

    beforeAll(() => {
      categoryRepo = nestApp.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
    });

    describe('Error scenarios', () => {
      const testCases = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          expected: {
            message:
              'Category with id(s) 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
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

      test.each(testCases)(
        'should return an error when ID is invalid or not found: $id',
        async ({ id, expected }) => {
          await request(nestApp.app.getHttpServer())
            .get(`/categories/${id}`)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('Success scenarios', () => {
      it('should return a category when ID is valid', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        const response = await request(nestApp.app.getHttpServer())
          .get(`/categories/${category.categoryId.id}`)
          .expect(200);

        const expectedKeys = GetCategoryFixture.keysInResponse;

        // Validate response structure
        expect(Object.keys(response.body)).toStrictEqual(['data']);
        expect(Object.keys(response.body.data)).toStrictEqual(expectedKeys);

        // Validate serialized output
        const presenter = CategoriesController.serialize(
          CategoryOutputMapper.toDTO(category),
        );
        const serialized = instanceToPlain(presenter);
        expect(response.body.data).toStrictEqual(serialized);
      });
    });
  });
});
