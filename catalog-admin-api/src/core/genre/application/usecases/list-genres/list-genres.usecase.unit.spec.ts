import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { GenreInMemoryRepository } from '@core/genre/infra/db/in-memory/genre-in-memory.repository';
import { ListGenresUseCase } from './list-genres.usecase';
import { Category } from '@core/category/domain/entity/category.entity';
import { Genre } from '@core/genre/domain/entity/genre.entity';

describe('ListGenresUseCase Unit Tests', () => {
  let useCase: ListGenresUseCase;
  let categoryRepository: CategoryInMemoryRepository;
  let genreRepository: GenreInMemoryRepository;

  beforeEach(() => {
    categoryRepository = new CategoryInMemoryRepository();
    genreRepository = new GenreInMemoryRepository();
    useCase = new ListGenresUseCase(genreRepository, categoryRepository);
  });

  describe('execute', () => {
    const createGenres = async (count: number) => {
      const categories = Category.fake().theCategories(count).build();
      await categoryRepository.bulkInsert(categories);

      return Promise.all(
        categories.map(async (category) => {
          return Genre.fake()
            .aGenre()
            .addCategoryId(category.categoryId)
            .build();
        }),
      );
    };

    it('should list genres', async () => {
      const genres = await createGenres(2);

      await genreRepository.bulkInsert(genres);

      const output = await useCase.execute({});

      expect(output.items).toHaveLength(2);
      expect(output).toMatchObject({
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
        total: 2,
      });
    });

    it('should list genres with pagination and sort', async () => {
      const genres = await createGenres(10);

      await genreRepository.bulkInsert(genres);

      const output = await useCase.execute({
        page: 2,
        perPage: 3,
        sort: 'name',
        sortDir: 'asc',
      });

      expect(output.items).toHaveLength(3);
      expect(output).toMatchObject({
        currentPage: 2,
        lastPage: 4,
        perPage: 3,
        total: 10,
      });
    });

    it('should list genres with filter', async () => {
      const genres = await createGenres(2);

      await genreRepository.bulkInsert(genres);

      const output = await useCase.execute({
        filter: {
          name: genres[0].name,
        },
      });

      expect(output.items).toHaveLength(1);
      expect(output).toMatchObject({
        currentPage: 1,
        lastPage: 1,
        perPage: 15,
        total: 1,
      });
    });
  });
});
