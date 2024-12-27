import { CategoryIdStorageValidator } from '@core/category/application/validations/category-id-storage.validator';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { GenreOutput, GenreOutputMapper } from '../common/genre.output';
import { CreateGenreInput } from './create-genre.input';

export class CreateGenreUseCase
  implements IUseCase<CreateGenreInput, CreateGenreOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
    private categoryIdStorageValidator: CategoryIdStorageValidator,
  ) {}

  async execute({
    categoryIds,
    name,
    isActive,
  }: CreateGenreInput): Promise<CreateGenreOutput> {
    const [categoriesId, errorsCategoriesIds] = (
      await this.categoryIdStorageValidator.validate(categoryIds)
    ).asArray();

    const genre = Genre.create({
      name,
      categoryIds: errorsCategoriesIds ? [] : categoriesId,
      isActive,
    });

    const notification = genre.notification;

    if (errorsCategoriesIds) {
      notification.setError(
        errorsCategoriesIds.map((e) => e.message),
        'categoryIds',
      );
    }

    if (notification.hasErrors()) {
      throw new EntityValidationError(notification.toJSON());
    }

    await this.uow.do(async () => {
      return this.genreRepository.insert(genre);
    });

    const categories = await this.categoryRepository.findByIds(
      Array.from(genre.categoryIds.values()),
    );

    return GenreOutputMapper.toDTO(genre, categories);
  }
}

export type CreateGenreOutput = GenreOutput;
