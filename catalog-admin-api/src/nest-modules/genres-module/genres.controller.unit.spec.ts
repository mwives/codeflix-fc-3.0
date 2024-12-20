import { CreateGenreOutput } from '@core/genre/application/usecases/create-genre/create-genre.usecase';
import { CreateGenreDto } from './dto/create-genre.dto';
import { GenresController } from './genres.controller';
import { GenreCollectionPresenter, GenrePresenter } from './genres.presenter';
import { ListGenresOutput } from '@core/genre/application/usecases/list-genres/list-genres.usecase';
import { UpdateGenreOutput } from '@core/genre/application/usecases/update-genre/update-genre.usecase';
import { SortDirection } from '@core/shared/domain/repository/search-params';

describe('GenresController Unit Tests', () => {
  let controller: GenresController;

  beforeEach(async () => {
    controller = new GenresController();
  });

  describe('create', () => {
    it('should create a genre', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const output: CreateGenreOutput = {
        id: uuid,
        name: 'any_name',
        categories: [
          {
            id: uuid,
            name: 'any_name',
            createdAt: new Date(),
          },
        ],
        isActive: true,
        categoryIds: [uuid],
        createdAt: new Date(),
      };

      const createUseCaseMock = {
        execute: jest.fn().mockResolvedValue(output),
      };

      // @ts-ignore
      controller['createUseCase'] = createUseCaseMock;

      const input: CreateGenreDto = {
        name: 'any_name',
        categoryIds: [uuid],
      };

      const presenter = await controller.create(input);

      expect(createUseCaseMock.execute).toHaveBeenCalledWith(input);
      expect(presenter).toBeInstanceOf(GenrePresenter);
      expect(presenter).toStrictEqual(new GenrePresenter(output));
    });
  });

  describe('findOne', () => {
    it('should return a genre', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const output: CreateGenreOutput = {
        id: uuid,
        name: 'any_name',
        categories: [
          {
            id: uuid,
            name: 'any_name',
            createdAt: new Date(),
          },
        ],
        isActive: true,
        categoryIds: [uuid],
        createdAt: new Date(),
      };

      const getUseCaseMock = {
        execute: jest.fn().mockResolvedValue(output),
      };

      // @ts-ignore
      controller['getUseCase'] = getUseCaseMock;

      const presenter = await controller.findOne(uuid);

      expect(getUseCaseMock.execute).toHaveBeenCalledWith({ id: uuid });
      expect(presenter).toBeInstanceOf(GenrePresenter);
      expect(presenter).toStrictEqual(new GenrePresenter(output));
    });
  });

  describe('search', () => {
    it('should return a list of genres', async () => {
      const output: ListGenresOutput = {
        items: [
          {
            id: '123e4567-e89b-12d3-a456-426614174000',
            name: 'any_name',
            categories: [
              {
                id: '123e4567-e89b-12d3-a456-426614174000',
                name: 'any_name',
                createdAt: new Date(),
              },
            ],
            isActive: true,
            categoryIds: ['123e4567-e89b-12d3-a456-426614174000'],
            createdAt: new Date(),
          },
        ],
        total: 1,
        currentPage: 1,
        lastPage: 1,
        perPage: 10,
      };

      const listUseCaseMock = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };

      // @ts-expect-error defined part of methods
      controller['listUseCase'] = listUseCaseMock;

      const searchParams = {
        page: 1,
        perPage: 10,
        sort: 'name',
        sortDir: 'asc' as SortDirection,
        filter: { name: 'any_name' },
      };

      const presenter = await controller.search(searchParams);

      expect(presenter).toBeInstanceOf(GenreCollectionPresenter);
      expect(listUseCaseMock.execute).toHaveBeenCalledWith(searchParams);
      expect(presenter).toEqual(new GenreCollectionPresenter(output));
    });
  });

  describe('update', () => {
    it('should update a genre', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const output: UpdateGenreOutput = {
        id: uuid,
        name: 'any_name',
        categories: [
          {
            id: uuid,
            name: 'any_name',
            createdAt: new Date(),
          },
        ],
        isActive: true,
        categoryIds: [uuid],
        createdAt: new Date(),
      };

      const updateUseCaseMock = {
        execute: jest.fn().mockResolvedValue(output),
      };

      // @ts-ignore
      controller['updateUseCase'] = updateUseCaseMock;

      const input = {
        name: 'any_name',
        categoryIds: [uuid],
      };

      const presenter = await controller.update(uuid, input);

      expect(updateUseCaseMock.execute).toHaveBeenCalledWith({
        id: uuid,
        ...input,
      });
      expect(presenter).toBeInstanceOf(GenrePresenter);
      expect(presenter).toStrictEqual(new GenrePresenter(output));
    });
  });

  describe('delete', () => {
    it('should delete a genre', async () => {
      const uuid = '123e4567-e89b-12d3-a456-426614174000';

      const deleteUseCaseMock = {
        execute: jest.fn().mockResolvedValue(undefined),
      };

      // @ts-ignore
      controller['deleteUseCase'] = deleteUseCaseMock;

      await controller.remove(uuid);

      expect(deleteUseCaseMock.execute).toHaveBeenCalledWith({ id: uuid });
    });
  });
});
