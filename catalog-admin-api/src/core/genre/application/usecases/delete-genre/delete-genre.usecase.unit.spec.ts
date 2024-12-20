import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { UnitOfWorkInMemory } from '@core/shared/infra/db/in-memory/unit-of-work-in-memory';
import { DeleteGenreUseCase } from './delete-genre.usecase';

describe('DeleteGenreUsecase Unit Tests', () => {
  let useCase: DeleteGenreUseCase;
  let genreRepository: GenreInMemoryRepository;
  let uow: UnitOfWorkInMemory;

  beforeEach(() => {
    uow = new UnitOfWorkInMemory();
    genreRepository = new GenreInMemoryRepository();
    useCase = new DeleteGenreUseCase(uow, genreRepository);
  });

  describe('execute', () => {
    it('should delete a genre', async () => {
      const genre = Genre.fake().aGenre().build();
      await genreRepository.insert(genre);

      const uowSpy = jest.spyOn(uow, 'do');

      await useCase.execute({ id: genre.genreId.id });

      expect(uowSpy).toHaveBeenCalledTimes(1);
      expect(await genreRepository.findById(genre.id)).toBeNull();
    });

    it('should throw an error if genre does not exist', async () => {
      await expect(useCase.execute({ id: new GenreId().id })).rejects.toThrow(
        NotFoundError,
      );
    });
  });
});
