import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { GenreId, Genre } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { GenreOutputMapper, GenreOutput } from '../common/genre.output';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';

export class GetGenreUseCase
  implements IUseCase<GetGenreInput, GetGenreOutput>
{
  constructor(
    private genreRepository: IGenreRepository,
    private categoryRepository: ICategoryRepository,
  ) {}

  async execute(input: GetGenreInput): Promise<GetGenreOutput> {
    const genreId = new GenreId(input.id);
    const genre = await this.genreRepository.findById(genreId);

    if (!genre) {
      throw new NotFoundError(input.id, Genre);
    }

    const categories = await this.categoryRepository.findByIds([
      ...genre.categoryIds.values(),
    ]);

    return GenreOutputMapper.toDTO(genre, categories);
  }
}

export type GetGenreInput = {
  id: string;
};

export type GetGenreOutput = GenreOutput;
