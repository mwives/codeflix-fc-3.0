import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();

  describe('DELETE /categories/:id', () => {
    let categoryRepo: ICategoryRepository;

    beforeEach(() => {
      categoryRepo = appHelper.app.get<ICategoryRepository>(
        CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
      );
    });

    describe('when the category ID is invalid or not found', () => {
      const cases = [
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

      test.each(cases)(
        'should return an error for invalid or non-existent ID: $id',
        async ({ id, expected }) => {
          await request(appHelper.app.getHttpServer())
            .delete(`/categories/${id}`)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('when the category ID is valid', () => {
      it('should delete the category and return status 204', async () => {
        const category = Category.fake().aCategory().build();
        await categoryRepo.insert(category);

        await request(appHelper.app.getHttpServer())
          .delete(`/categories/${category.categoryId.id}`)
          .expect(204);

        await expect(
          categoryRepo.findById(category.categoryId),
        ).resolves.toBeNull();
      });
    });
  });
});
