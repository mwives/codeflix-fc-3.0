import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.usecase';
import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.usecase';
import { GetCategoryUseCase } from '@core/category/application/use-cases/get-category/get-category.usecase';
import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-categories/list-categories.usecase';
import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.usecase';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Provider } from '@nestjs/common';
import { getModelToken } from '@nestjs/sequelize';

export const REPOSITORIES: { [key: string]: Provider } = {
  CATEGORY_REPOSITORY: {
    provide: 'CategoryRepository',
    useExisting: CategorySequelizeRepository,
  },
  CATEGORY_IN_MEMORY_REPOSITORY: {
    provide: CategoryInMemoryRepository,
    useClass: CategoryInMemoryRepository,
  },
  CATEGORY_SEQUELIZE_REPOSITORY: {
    provide: 'CategoryRepository',
    useFactory: (categoryModel: typeof CategoryModel) =>
      new CategorySequelizeRepository(categoryModel),
    inject: [getModelToken(CategoryModel)],
  },
};

export const USE_CASES: { [key: string]: Provider } = {
  CREATE_CATEGORY_USE_CASE: {
    provide: CreateCategoryUseCase,
    useFactory: (categoryRepository: ICategoryRepository) =>
      new CreateCategoryUseCase(categoryRepository),
    inject: ['CategoryRepository'],
  },
  LIST_CATEGORIES_USE_CASE: {
    provide: ListCategoriesUseCase,
    useFactory: (categoryRepository: ICategoryRepository) =>
      new ListCategoriesUseCase(categoryRepository),
    inject: ['CategoryRepository'],
  },
  GET_CATEGORY_USE_CASE: {
    provide: GetCategoryUseCase,
    useFactory: (categoryRepository: ICategoryRepository) =>
      new GetCategoryUseCase(categoryRepository),
    inject: ['CategoryRepository'],
  },
  UPDATE_CATEGORY_USE_CASE: {
    provide: UpdateCategoryUseCase,
    useFactory: (categoryRepository: ICategoryRepository) =>
      new UpdateCategoryUseCase(categoryRepository),
    inject: ['CategoryRepository'],
  },
  DELETE_CATEGORY_USE_CASE: {
    provide: DeleteCategoryUseCase,
    useFactory: (categoryRepository: ICategoryRepository) =>
      new DeleteCategoryUseCase(categoryRepository),
    inject: ['CategoryRepository'],
  },
};

export const CATEGORY_PROVIDERS = {
  REPOSITORIES,
  USE_CASES,
};
