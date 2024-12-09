import { CategoryOutputMapper } from '@core/category/application/use-cases/@shared/category-output';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { instanceToPlain } from 'class-transformer';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { CreateCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { startApp } from 'src/nest-modules/shared-module/testing/helpers';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  const appHelper = startApp();
  let categoryRepository: ICategoryRepository;

  beforeAll(async () => {
    categoryRepository = appHelper.app.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  describe('POST /categories', () => {
    describe('create a category with valid input', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();

      test.each(arrange)(
        'should create a category when request body $sendData',
        async ({ sendData, expected }) => {
          const res = await request(appHelper.app.getHttpServer())
            .post('/categories')
            .send(sendData)
            .expect(201);

          expect(res.body).toHaveProperty('data');

          // Validate response structure
          const keysInResponse = CreateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);

          // Verify persistence
          const categoryCreated = await categoryRepository.findById(
            new Uuid(res.body.data.id),
          );
          expect(categoryCreated).not.toBeNull();

          // Validate serialized response
          const presenter = CategoriesController.serialize(
            CategoryOutputMapper.toDTO(categoryCreated!),
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

    describe('create a category with invalid input', () => {
      describe('validation errors in request body:', () => {
        const invalidRequest = CreateCategoryFixture.arrangeInvalidRequest();
        const arrange = Object.keys(invalidRequest).map((key) => ({
          label: key,
          value: invalidRequest[key],
        }));

        test.each(arrange)(
          'should return 422 when body is $label',
          async ({ value }) => {
            const res = await request(appHelper.app.getHttpServer())
              .post('/categories')
              .send(value)
              .expect(422);

            expect(res.body).toHaveProperty('message');
            expect(res.body.error).toContain('Unprocessable Entity');
          },
        );
      });

      describe('validation errors in domain rules', () => {
        const invalidRequest =
          CreateCategoryFixture.arrangeForEntityValidationError();
        const arrange = Object.keys(invalidRequest).map((key) => ({
          label: key,
          value: invalidRequest[key],
        }));

        test.each(arrange)(
          'should return 422 for domain validation error: $label',
          async ({ value }) => {
            const res = await request(appHelper.app.getHttpServer())
              .post('/categories')
              .send(value)
              .expect(422);

            expect(res.body).toHaveProperty('message');
            expect(res.body.error).toContain('Unprocessable Entity');
          },
        );
      });
    });
  });
});
