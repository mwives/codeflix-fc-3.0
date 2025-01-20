import { CategoryOutputMapper } from '@core/category/application/use-cases/@shared/category-output';
import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.usecase';
import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.usecase';
import { GetCategoryUseCase } from '@core/category/application/use-cases/get-category/get-category.usecase';
import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-categories/list-categories.usecase';
import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.usecase';
import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { Test, TestingModule } from '@nestjs/testing';
import { AuthModule } from '../auth-module/auth.module';
import { ConfigModule } from '../config-module/config.module';
import { DatabaseModule } from '../database-module/database.module';
import { CategoriesController } from './categories.controller';
import { CategoriesModule } from './categories.module';
import {
  CategoryCollectionPresenter,
  CategoryPresenter,
} from './categories.presenter';
import {
  CreateCategoryFixture,
  ListCategoriesFixture,
  UpdateCategoryFixture,
} from './testing/category-fixture';

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        AuthModule,
        DatabaseModule,
        CategoriesModule,
      ],
    }).compile();
    controller = module.get<CategoriesController>(CategoriesController);
    repository = module.get<ICategoryRepository>('CategoryRepository');
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createCategoryUseCase']).toBeInstanceOf(
      CreateCategoryUseCase,
    );
    expect(controller['updateCategoryUseCase']).toBeInstanceOf(
      UpdateCategoryUseCase,
    );
    expect(controller['listCategoriesUseCase']).toBeInstanceOf(
      ListCategoriesUseCase,
    );
    expect(controller['getCategoryUseCase']).toBeInstanceOf(GetCategoryUseCase);
    expect(controller['deleteCategoryUseCase']).toBeInstanceOf(
      DeleteCategoryUseCase,
    );
  });

  describe('create', () => {
    const arrange = CreateCategoryFixture.arrangeForCreate();

    test.each(arrange)(
      'should create a category when body is $sendData',
      async ({ sendData, expected }) => {
        const presenter = await controller.create(sendData);
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity.toJSON()).toStrictEqual({
          categoryId: presenter.id,
          createdAt: presenter.createdAt,
          ...expected,
        });
        const output = CategoryOutputMapper.toDTO(entity);
        expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  describe('search', () => {
    describe('should return sorted categories by createdAt', () => {
      const { arrange, entitiesMap } =
        ListCategoriesFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toDTO),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });

    describe('should return sorted categories using pagination, sort and filter', () => {
      const { arrange, entitiesMap } = ListCategoriesFixture.arrangeUnsorted();

      beforeEach(async () => {
        await repository.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);
          const { entities, ...paginationProps } = expected;
          expect(presenter).toEqual(
            new CategoryCollectionPresenter({
              items: entities.map(CategoryOutputMapper.toDTO),
              ...paginationProps.meta,
            }),
          );
        },
      );
    });
  });

  describe('findOne', () => {
    it('should return a category', async () => {
      const category = Category.fake().aCategory().build();
      await repository.insert(category);
      const presenter = await controller.findOne(category.categoryId.id);

      expect(presenter.id).toBe(category.categoryId.id);
      expect(presenter.name).toBe(category.name);
      expect(presenter.description).toBe(category.description);
      expect(presenter.isActive).toBe(category.isActive);
      expect(presenter.createdAt).toEqual(category.createdAt);
    });
  });

  describe('update', () => {
    const arrange = UpdateCategoryFixture.arrangeForUpdate();
    const category = Category.fake().aCategory().build();

    beforeEach(async () => {
      await repository.insert(category);
    });

    test.each(arrange)(
      'should update a category when body is $sendData',
      async ({ sendData, expected }) => {
        const presenter = await controller.update(
          category.categoryId.id,
          sendData,
        );
        const entity = await repository.findById(new Uuid(presenter.id));
        expect(entity.toJSON()).toStrictEqual({
          categoryId: presenter.id,
          name: expected.name ?? category.name,
          description:
            'description' in expected
              ? expected.description
              : category.description,
          isActive:
            expected.isActive === true || expected.isActive === false
              ? expected.isActive
              : category.isActive,
          createdAt: presenter.createdAt,
        });
        const output = CategoryOutputMapper.toDTO(entity);
        expect(presenter).toEqual(new CategoryPresenter(output));
      },
    );
  });

  describe('remove', () => {
    it('should remove a category', async () => {
      const category = Category.fake().aCategory().build();
      await repository.insert(category);
      const response = await controller.remove(category.categoryId.id);
      expect(response).toBeUndefined();
      await expect(
        repository.findById(category.categoryId),
      ).resolves.toBeNull();
    });
  });
});
