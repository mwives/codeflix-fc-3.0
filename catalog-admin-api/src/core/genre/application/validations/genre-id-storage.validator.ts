import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';

export class GenresIdStorageValidator {
  constructor(private genreRepo: IGenreRepository) {}

  async validate(
    genres_id: string[],
  ): Promise<Either<GenreId[], NotFoundError[]>> {
    const genresId = genres_id.map((v) => new GenreId(v));

    const existsResult = await this.genreRepo.existsById(genresId);
    return existsResult.nonExistent.length > 0
      ? Either.fail(
          existsResult.nonExistent.map((c) => new NotFoundError(c.id, Genre)),
        )
      : Either.ok(genresId);
  }
}
