import { CreateCategoryUseCase } from '@core/category/application/use-cases/create-category/create-category.usecase';
import { DeleteCategoryUseCase } from '@core/category/application/use-cases/delete-category/delete-category.usecase';
import { GetCategoryUseCase } from '@core/category/application/use-cases/get-category/get-category.usecase';
import { ListCategoriesUseCase } from '@core/category/application/use-cases/list-categories/list-categories.usecase';
import { UpdateCategoryUseCase } from '@core/category/application/use-cases/update-category/update-category.usecase';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { Test, TestingModule } from '@nestjs/testing';
import { ConfigModule } from '../config-module/config.module';
import { DatabaseModule } from '../database-module/database.module';
import { CategoriesController } from './categories.controller';
import { CategoriesModule } from './categories.module';

describe('CategoriesController Integration Tests', () => {
  let controller: CategoriesController;
  let repository: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, CategoriesModule],
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
});
