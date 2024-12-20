import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { GetGenreUseCase } from './get-genre.usecase';

describe('GetGenreUsecase Unit Tests', () => {
  let useCase: GetGenreUseCase;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;

  beforeEach(() => {
    categoryRepository = new CategoryInMemoryRepository();
    genreRepository = new GenreInMemoryRepository();
    useCase = new GetGenreUseCase(genreRepository, categoryRepository);
  });

  describe('execute', () => {
    it('should get a genre', async () => {
      const genre = Genre.fake().aGenre().build();
      await genreRepository.insert(genre);

      const output = await useCase.execute({ id: genre.genreId.id });

      expect(output.id).toBe(genre.genreId.id);
    });

    it('should throw NotFoundError when genre does not exist', async () => {
      await expect(useCase.execute({ id: new GenreId().id })).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
