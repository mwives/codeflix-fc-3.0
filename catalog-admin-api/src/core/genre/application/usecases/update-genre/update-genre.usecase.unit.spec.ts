import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import {
  Category,
  CategoryId,
} from '@core/category/domain/entity/category.entity';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { UnitOfWorkInMemory } from '@core/shared/infra/db/in-memory/unit-of-work-in-memory';
import { UpdateGenreUseCase } from './update-genre.usecase';
import { InvalidUuidError } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';

describe('UpdateGenreUseCase Unit Tests', () => {
  let useCase: UpdateGenreUseCase;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;
  let categoryIdStorageValidator: CategoryIdStorageValidator;
  let uow: UnitOfWorkInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkInMemory();
    genreRepository = new GenreInMemoryRepository();
    categoryRepository = new CategoryInMemoryRepository();
    categoryIdStorageValidator = new CategoryIdStorageValidator(
      categoryRepository,
    );
    useCase = new UpdateGenreUseCase(
      uow,
      genreRepository,
      categoryRepository,
      categoryIdStorageValidator,
    );
  });

  describe('execute', () => {
    it('should update a genre', async () => {
      const [oldCategory, newCategory] = Category.fake()
        .theCategories(2)
        .build();
      await categoryRepository.bulkInsert([oldCategory, newCategory]);

      const genre = Genre.fake()
        .aGenre()
        .addCategoryId(oldCategory.categoryId)
        .build();
      await genreRepository.insert(genre);

      const uowSpy = jest.spyOn(uow, 'do');

      await useCase.execute({
        id: genre.genreId.id,
        name: 'new_name',
        isActive: true,
        categoryIds: [newCategory.categoryId.id],
      });

      const updatedGenre = await genreRepository.findById(genre.genreId);

      expect(uowSpy).toHaveBeenCalledTimes(1);
      expect(updatedGenre).toMatchObject({
        name: 'new_name',
        isActive: true,
      });
      expect(updatedGenre.categoryIds.has(newCategory.categoryId.id)).toBe(
        true,
      );
      expect(updatedGenre.categoryIds.has(oldCategory.categoryId.id)).toBe(
        false,
      );
    });

    it('should throw NotFoundError if genre does not exist', async () => {
      await expect(
        useCase.execute({
          id: new GenreId().id,
        }),
      ).rejects.toThrow(NotFoundError);
    });

    it('should throw EntityValidationError if category does not exist', async () => {
      const genre = Genre.fake().aGenre().build();
      await genreRepository.insert(genre);

      const uowSpy = jest.spyOn(uow, 'do');

      await expect(
        useCase.execute({
          id: genre.genreId.id,
          categoryIds: [new CategoryId().id],
        }),
      ).rejects.toThrow(EntityValidationError);

      expect(uowSpy).toHaveBeenCalledTimes(0);
    });

    it('should throw an error if invalid fields are provided', async () => {
      const genre = Genre.fake().aGenre().build();
      await genreRepository.insert(genre);

      const uowSpy = jest.spyOn(uow, 'do');

      await expect(
        useCase.execute({
          id: genre.genreId.id,
          name: 'a'.repeat(256),
        }),
      ).rejects.toThrow(EntityValidationError);

      expect(uowSpy).toHaveBeenCalledTimes(0);
    });
  });
});
