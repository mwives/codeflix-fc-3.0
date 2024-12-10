import { CategoryOutputMapper } from '@core/category/application/use-cases/@shared/category-output';
import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { UpdateCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let categoryRepository: ICategoryRepository;

  beforeEach(() => {
    categoryRepository = appHelper.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  const uuid = '9366b7dc-2d71-4799-b91c-c64adb205104';

  describe('PATCH /categories/:id', () => {
    const sendPatchRequest = (id: string, data: any) =>
      request(appHelper.app.getHttpServer())
        .patch(`/categories/${id}`)
        .send(data);

    describe('when the category ID is invalid or not found', () => {
      const faker = Category.fake().aCategory();
      const testCases = [
        {
          id: '88ff2587-ce5a-4769-a8c6-1d63d29c5f7a',
          sendData: { name: faker.name },
          expected: {
            message:
              'Category with id(s) 88ff2587-ce5a-4769-a8c6-1d63d29c5f7a not found',
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

      test.each(testCases)(
        'should return an error for invalid or non-existent ID: $id',
        async ({ id, sendData, expected }) => {
          return sendPatchRequest(id, sendData)
            .expect(expected.statusCode)
            .expect(expected);
        },
      );
    });

    describe('when the request body is invalid', () => {
      const invalidRequests = UpdateCategoryFixture.arrangeInvalidRequest();
      const testCases = Object.entries(invalidRequests).map(
        ([label, value]) => ({
          label,
          ...value,
        }),
      );

      test.each(testCases)(
        'should return 422 when body is $label',
        async ({ sendData, expected }) => {
          return sendPatchRequest(
            '9366b7dc-2d71-4799-b91c-c64adb205104',
            sendData,
          )
            .expect(422)
            .expect(expected);
        },
      );
    });

    describe('when the entity is invalid', () => {
      const validationErrors =
        UpdateCategoryFixture.arrangeForEntityValidationError();
      const testCases = Object.entries(validationErrors).map(
        ([label, value]) => ({
          label,
          ...value,
        }),
      );

      test.each(testCases)(
        'should return 422 when body is $label',
        async ({ expected, sendData }) => {
          const category = Category.fake().aCategory().build();
          await categoryRepository.insert(category);
          return sendPatchRequest(category.categoryId.id, sendData)
            .expect(422)
            .expect(expected);
        },
      );
    });

    describe('when the category ID is valid', () => {
      const testCases = UpdateCategoryFixture.arrangeForUpdate();

      test.each(testCases)(
        'should update the category successfully with body: $sendData',
        async ({ sendData, expected }) => {
          const category = Category.fake().aCategory().build();
          await categoryRepository.insert(category);

          const res = await sendPatchRequest(
            category.categoryId.id,
            sendData,
          ).expect(200);

          const serializedCategory = CategoriesController.serialize(
            CategoryOutputMapper.toDTO(category),
          );
          const serialized = instanceToPlain(serializedCategory);

          expect(res.body.data).toStrictEqual({
            id: serialized.id,
            createdAt: serialized.createdAt,
            name: expected.name ?? category.name,
            description:
              'description' in expected
                ? expected.description
                : category!.description,
            isActive: expected.isActive ?? category.isActive,
          });

          const updatedCategory = await categoryRepository.findById(
            new Uuid(res.body.data.id),
          );
          expect(updatedCategory).not.toBeNull();
          expect(updatedCategory?.name).toBe(expected.name ?? category.name);
        },
      );
    });
  });
});
