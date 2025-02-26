import { IRepository } from '@core/shared/domain/repository/repository.interface';
import { Genre, GenreId } from './genre.aggregate';

export type IGenreRepository = IRepository<Genre, GenreId>;
