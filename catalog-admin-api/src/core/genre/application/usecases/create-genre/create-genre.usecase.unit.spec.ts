import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import {
  Category,
  CategoryId,
} from '@core/category/domain/entity/category.entity';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { UnitOfWorkInMemory } from '@core/shared/infra/db/in-memory/unit-of-work-in-memory';
import { CreateGenreUseCase } from './create-genre.usecase';
import { Genre } from '@core/genre/domain/entity/genre.entity';

describe('CreateGenreUseCase Unit Tests', () => {
  let useCase: CreateGenreUseCase;
  let genreRepository: GenreInMemoryRepository;
  let categoryRepository: CategoryInMemoryRepository;
  let categoryIdStorageValidator: CategoryIdStorageValidator;
  let uow: UnitOfWorkInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkInMemory();
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    categoryIdStorageValidator = new CategoryIdStorageValidator(
      categoryRepository,
    );
    useCase = new CreateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoryIdStorageValidator,
    );
  });

  describe('execute', () => {
    it('should create a genre', async () => {
      const categories = Category.fake().theCategories(2).build();
      await categoryRepository.bulkInsert(categories);

      const uowSpy = jest.spyOn(uow, 'do');

      const result = await useCase.execute({
        name: 'any_name',
        isActive: true,
        categoryIds: categories.map((category) => category.categoryId.id),
      });

      expect(uowSpy).toHaveBeenCalledTimes(1);
      expect(result).toMatchObject({
        id: expect.any(String),
        name: 'any_name',
        isActive: true,
        categories: categories.map((category) => ({
          id: expect.any(String),
          name: category.name,
          createdAt: category.createdAt,
        })),
        createdAt: expect.any(Date),
      });
    });

    it('should throw an error when categoryIds does not exist', async () => {
      await expect(
        useCase.execute({
          name: 'any_name',
          isActive: true,
          categoryIds: [new CategoryId().id],
        }),
      ).rejects.toThrow(EntityValidationError);
    });
  });
});
