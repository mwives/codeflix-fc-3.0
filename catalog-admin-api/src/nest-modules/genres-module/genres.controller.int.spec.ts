import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { GenreOutputMapper } from '@core/genre/application/usecases/common/genre.output';
import { CreateGenreUseCase } from '@core/genre/application/usecases/create-genre/create-genre.usecase';
import { DeleteGenreUseCase } from '@core/genre/application/usecases/delete-genre/delete-genre.usecase';
import { GetGenreUseCase } from '@core/genre/application/usecases/get-genre/get-genre.usecase';
import { ListGenresUseCase } from '@core/genre/application/usecases/list-genres/list-genres.usecase';
import { UpdateGenreUseCase } from '@core/genre/application/usecases/update-genre/update-genre.usecase';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { IGenreRepository } from '@core/genre/domain/repository/genre.repository';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { getConnectionToken } from '@nestjs/sequelize';
import { Test, TestingModule } from '@nestjs/testing';
import { Sequelize } from 'sequelize';
import { CATEGORY_PROVIDERS } from '../categories-module/categories.providers';
import { ConfigModule } from '../config-module/config.module';
import { DatabaseModule } from '../database-module/database.module';
import { GenresController } from './genres.controller';
import { GenresModule } from './genres.module';
import { GenreCollectionPresenter } from './genres.presenter';
import { GENRES_PROVIDERS } from './genres.provider';
import {
  CreateGenreFixture,
  ListGenresFixture,
  UpdateGenreFixture,
} from './testing/genre.fixture';

describe('GenresController Integration Tests', () => {
  let controller: GenresController;
  let genreRepo: IGenreRepository;
  let categoryRepo: ICategoryRepository;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      imports: [ConfigModule.forRoot(), DatabaseModule, GenresModule],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: (sequelize: Sequelize) => {
          return new UnitOfWorkSequelize(sequelize);
        },
        inject: [getConnectionToken()],
      })
      .compile();
    controller = module.get(GenresController);
    genreRepo = module.get(
      GENRES_PROVIDERS.REPOSITORIES.GENRE_REPOSITORY.provide,
    );
    categoryRepo = module.get(
      CATEGORY_PROVIDERS.REPOSITORIES.CATEGORY_REPOSITORY.provide,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
    expect(controller['createUseCase']).toBeInstanceOf(CreateGenreUseCase);
    expect(controller['updateUseCase']).toBeInstanceOf(UpdateGenreUseCase);
    expect(controller['listUseCase']).toBeInstanceOf(ListGenresUseCase);
    expect(controller['getUseCase']).toBeInstanceOf(GetGenreUseCase);
    expect(controller['deleteUseCase']).toBeInstanceOf(DeleteGenreUseCase);
  });

  describe('should create a category', () => {
    const arrange = CreateGenreFixture.arrangeForSave();

    test.each(arrange)(
      'when body is $sendData',
      async ({ sendData, expected, relations }) => {
        await categoryRepo.bulkInsert(relations.categories);
        const presenter = await controller.create(sendData);
        const entity = await genreRepo.findById(new Uuid(presenter.id));

        expect(entity!.toJSON()).toStrictEqual({
          genreId: presenter.id,
          createdAt: presenter.createdAt,
          name: expected.name,
          categoryIds: expected.categoryIds,
          isActive: expected.isActive,
        });

        const expectedPresenter = GenresController.serialize(
          GenreOutputMapper.toDTO(entity!, relations.categories),
        );
        expectedPresenter.categories = expect.arrayContaining(
          expectedPresenter.categories,
        );
        expectedPresenter.categoryIds = expect.arrayContaining(
          expectedPresenter.categoryIds,
        );
        expect(presenter).toEqual(expectedPresenter);
      },
    );
  });

  describe('should update a category', () => {
    const arrange = UpdateGenreFixture.arrangeForSave();

    test.each(arrange)(
      'with request $sendData',
      async ({ entity: genre, sendData, expected, relations }) => {
        await categoryRepo.bulkInsert(relations.categories);
        await genreRepo.insert(genre);

        const presenter = await controller.update(genre.genreId.id, sendData);
        const genreUpdated = await genreRepo.findById(
          new GenreId(presenter.id),
        );

        expect(genreUpdated!.toJSON()).toStrictEqual({
          genreId: presenter.id,
          createdAt: presenter.createdAt,
          name: expected.name ?? genre.name,
          categoryIds: expected.categoryIds
            ? expected.categoryIds
            : genre.categoryIds,
          isActive:
            expected.isActive != null ? expected.isActive : genre.isActive,
        });
        const categoriesOfGenre = relations.categories.filter((c) =>
          genreUpdated!.categoryIds.has(c.categoryId.id),
        );

        const expectedPresenter = GenresController.serialize(
          GenreOutputMapper.toDTO(genreUpdated!, categoriesOfGenre),
        );

        expectedPresenter.categories = expect.arrayContaining(
          expectedPresenter.categories,
        );
        expectedPresenter.categoryIds = expect.arrayContaining(
          expectedPresenter.categoryIds,
        );

        expect(presenter).toEqual(expectedPresenter);
      },
    );
  });

  it('should delete a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.categoryId)
      .build();
    await genreRepo.insert(genre);
    const response = await controller.remove(genre.genreId.id);
    expect(response).not.toBeDefined();
    await expect(genreRepo.findById(genre.genreId)).resolves.toBeNull();
  });

  it('should get a genre', async () => {
    const category = Category.fake().aCategory().build();
    await categoryRepo.insert(category);
    const genre = Genre.fake()
      .aGenre()
      .addCategoryId(category.categoryId)
      .build();
    await genreRepo.insert(genre);
    const presenter = await controller.findOne(genre.genreId.id);
    expect(presenter.id).toBe(genre.genreId.id);
    expect(presenter.name).toBe(genre.name);
    expect(presenter.categories).toEqual([
      {
        id: category.categoryId.id,
        name: category.name,
        createdAt: category.createdAt,
      },
    ]);
    expect(presenter.categoryIds).toEqual(
      expect.arrayContaining(Array.from(genre.categoryIds.keys())),
    );
    expect(presenter.createdAt).toStrictEqual(genre.createdAt);
  });

  describe('search method', () => {
    describe('should returns categories using query empty ordered by createdAt', () => {
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeIncrementedWithCreatedAt();

      beforeEach(async () => {
        await categoryRepo.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $sendData',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData);
          const { entities, ...paginationProps } = expected;
          const expectedPresenter = new GenreCollectionPresenter({
            items: entities.map((e) => ({
              ...e.toJSON(),
              id: e.genreId.id,
              categoryIds: expect.arrayContaining(
                Array.from(e.categoryIds.keys()),
              ),
              categories: Array.from(e.categoryIds.keys()).map((id) => ({
                id: relations.categories.get(id)!.categoryId.id,
                name: relations.categories.get(id)!.name,
                createdAt: relations.categories.get(id)!.createdAt,
              })),
            })),
            ...paginationProps.meta,
          });
          presenter.data = presenter.data.map((item) => ({
            ...item,
            categories: expect.arrayContaining(item.categories),
          }));
          expect(presenter).toEqual(expectedPresenter);
        },
      );
    });

    describe('should returns output using pagination, sort and filter', () => {
      const { relations, entitiesMap, arrange } =
        ListGenresFixture.arrangeUnsorted();

      beforeEach(async () => {
        await categoryRepo.bulkInsert(
          Array.from(relations.categories.values()),
        );
        await genreRepo.bulkInsert(Object.values(entitiesMap));
      });

      test.each(arrange)(
        'when sendData is $label',
        async ({ sendData, expected }) => {
          const presenter = await controller.search(sendData).catch((e) => {
            throw e;
          });
          const { entities, ...paginationProps } = expected;
          const expectedPresenter = new GenreCollectionPresenter({
            items: entities.map((e) => ({
              ...e.toJSON(),
              id: e.genreId.id,
              categoryIds: expect.arrayContaining(
                Array.from(e.categoryIds.keys()),
              ),
              categories: Array.from(e.categoryIds.keys()).map((id) => ({
                id: relations.categories.get(id)!.categoryId.id,
                name: relations.categories.get(id)!.name,
                createdAt: relations.categories.get(id)!.createdAt,
              })),
            })),
            ...paginationProps.meta,
          });
          presenter.data = presenter.data.map((item) => ({
            ...item,
            categories: expect.arrayContaining(item.categories),
          }));
          expect(presenter).toEqual(expectedPresenter);
        },
      );
    });
  });
});
