import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { GenreId, Genre } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { GenreOutputMapper, GenreOutput } from '../common/genre.output';
import { UpdateGenreInput } from './update-genre.input';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';

export class UpdateGenreUseCase
  implements IUseCase<UpdateGenreInput, UpdateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepo: IGenreRepository,
    private categoryRepo: ICategoryRepository,
    private categoryIdStorageValidator: CategoryIdStorageValidator,
  ) {}

  async execute(input: UpdateGenreInput): Promise<UpdateGenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepo.findById(genreId);

    if (!genre) {
      throw new NotFoundError(input.id, Genre);
    }

    input.name && genre.changeName(input.name);
    input.isActive ? genre.activate() : genre.deactivate();

    const notification = genre.notification;

    if (input.categoryIds) {
      const [validatedCategoryIds, categoryIdsValidationErrors] = (
        await this.categoryIdStorageValidator.validate(input.categoryIds)
      ).asArray();

      validatedCategoryIds && genre.syncCategoryIds(validatedCategoryIds);

      categoryIdsValidationErrors &&
        notification.setError(
          categoryIdsValidationErrors.map((e) => e.message),
          'categoryIds',
        );
    }

    if (genre.notification.hasErrors()) {
      throw new EntityValidationError(genre.notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepo.update(genre);
    });

    const categories = await this.categoryRepo.findByIds(
      Array.from(genre.categoryIds.values()),
    );

    return GenreOutputMapper.toDTO(genre, categories);
  }
}

export type UpdateGenreOutput = GenreOutput;
