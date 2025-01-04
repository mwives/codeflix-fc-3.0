import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { GenresIdStorageValidator } from './genre-id-storage.validator';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';

describe('GenresIdStorageValidator Unit Tests', () => {
  let genreRepository: GenreInMemoryRepository;
  let validator: GenresIdStorageValidator;

  beforeEach(() => {
    genreRepository = new GenreInMemoryRepository();
    validator = new GenresIdStorageValidator(genreRepository);
  });

  it('should return many not found error when cast members id is not exists in storage', async () => {
    const genreId1 = new GenreId();
    const genreId2 = new GenreId();

    const spyExistsById = jest.spyOn(genreRepository, 'existsById');

    let [castMembersId, errorsGenresId] = await validator.validate([
      genreId1.id,
      genreId2.id,
    ]);

    expect(castMembersId).toStrictEqual(null);
    expect(errorsGenresId).toStrictEqual([
      new NotFoundError(genreId1.id, Genre),
      new NotFoundError(genreId2.id, Genre),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const genre1 = Genre.fake().aGenre().build();
    await genreRepository.insert(genre1);

    [castMembersId, errorsGenresId] = await validator.validate([
      genre1.genreId.id,
      genreId2.id,
    ]);

    expect(castMembersId).toStrictEqual(null);
    expect(errorsGenresId).toStrictEqual([
      new NotFoundError(genreId2.id, Genre),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of categories id', async () => {
    const genreId1 = Genre.fake().aGenre().build();
    const castMember2 = Genre.fake().aGenre().build();

    await genreRepository.bulkInsert([genreId1, castMember2]);

    const [castMembersId, errorsGenresId] = await validator.validate([
      genreId1.genreId.id,
      castMember2.genreId.id,
    ]);

    expect(castMembersId).toHaveLength(2);
    expect(errorsGenresId).toStrictEqual(null);
    expect(castMembersId[0]).toBeValueObject(genreId1.genreId);
    expect(castMembersId[1]).toBeValueObject(castMember2.genreId);
  });
});
