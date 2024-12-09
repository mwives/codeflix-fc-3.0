import { CategoryOutputMapper } from '@core/category/application/use-cases/@shared/category-output';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { instanceToPlain } from 'class-transformer';
import { AppModule } from 'src/app.module';
import { CategoriesController } from 'src/nest-modules/categories-module/categories.controller';
import { CATEGORY_PROVIDERS } from 'src/nest-modules/categories-module/categories.providers';
import { CreateCategoryFixture } from 'src/nest-modules/categories-module/testing/category-fixture';
import { applyGlobalConfig } from 'src/nest-modules/global-config';
import request from 'supertest';

describe('CategoriesController (e2e)', () => {
  let app: INestApplication;
  let categoryRepository: ICategoryRepository;

  beforeAll(async () => {
    const module = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = module.createNestApplication();
    applyGlobalConfig(app);

    categoryRepository = module.get<ICategoryRepository>(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );

    await app.init();
  });

  describe('POST /categories', () => {
    describe('should create a category', () => {
      const arrange = CreateCategoryFixture.arrangeForCreate();

      test.each(arrange)(
        'when body is $sendData',
        async ({ sendData, expected }) => {
          const res = await request(app.getHttpServer())
            .post('/categories')
            .send(sendData)
            .expect(201);

          const keysInResponse = CreateCategoryFixture.keysInResponse;
          expect(Object.keys(res.body)).toStrictEqual(['data']);
          expect(Object.keys(res.body.data)).toStrictEqual(keysInResponse);
          const id = res.body.data.id;
          const categoryCreated = await categoryRepository.findById(
            new Uuid(id),
          );

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
  });
});
