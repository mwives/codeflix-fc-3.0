import { Category } from '@core/category/domain/entity/category.entity';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { SortDirection } from '@core/shared/domain/repository/search-params';

const _keysInResponse = [
  'id',
  'name',
  'categoryIds',
  'categories',
  'isActive',
  'createdAt',
];

export class GetGenreFixture {
  static keysInResponse = _keysInResponse;
}

export class CreateGenreFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Genre.fake().aGenre().withName('test name');

    const category = Category.fake().aCategory().build();

    const case1 = {
      relations: {
        categories: [category],
      },
      sendData: {
        name: faker.name,
        categoryIds: [category.categoryId.id],
      },
      expected: {
        name: faker.name,
        categories: expect.arrayContaining([
          {
            id: category.categoryId.id,
            name: category.name,
            createdAt: category.createdAt.toISOString(),
          },
        ]),
        categoryIds: expect.arrayContaining([category.categoryId.id]),
        isActive: true,
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const case2 = {
      relations: {
        categories,
      },
      sendData: {
        name: faker.name,
        categoryIds: [
          categories[0].categoryId.id,
          categories[1].categoryId.id,
          categories[2].categoryId.id,
        ],
        categories: expect.arrayContaining([
          {
            id: categories[0].categoryId.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt.toISOString(),
          },
          {
            id: categories[1].categoryId.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt.toISOString(),
          },
          {
            id: categories[2].categoryId.id,
            name: categories[2].name,
            createdAt: categories[2].createdAt.toISOString(),
          },
        ]),
        isActive: false,
      },
      expected: {
        name: faker.name,
        categoryIds: expect.arrayContaining([
          categories[0].categoryId.id,
          categories[1].categoryId.id,
          categories[2].categoryId.id,
        ]),
        categories: expect.arrayContaining([
          {
            id: categories[0].categoryId.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt.toISOString(),
          },
          {
            id: categories[1].categoryId.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt.toISOString(),
          },
          {
            id: categories[2].categoryId.id,
            name: categories[2].name,
            createdAt: categories[2].createdAt.toISOString(),
          },
        ]),
        isActive: false,
      },
    };

    return [case1, case2];
  }

  static arrangeInvalidRequest() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      EMPTY: {
        sendData: {},
        expected: {
          message: [
            'name should not be empty',
            'name must be a string',
            'categoryIds should not be empty',
            'categoryIds must be an array',
            'each value in categoryIds must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      NAME_UNDEFINED: {
        sendData: {
          name: undefined,
          categoryIds: [faker.categoryIds[0].id],
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_NULL: {
        sendData: {
          name: null,
          categoryIds: [faker.categoryIds[0].id],
        },
        expected: {
          message: ['name should not be empty', 'name must be a string'],
          ...defaultExpected,
        },
      },
      NAME_EMPTY: {
        sendData: {
          name: '',
          categoryIds: [faker.categoryIds[0].id],
        },
        expected: {
          message: ['name should not be empty'],
          ...defaultExpected,
        },
      },
      categoryIds_UNDEFINED: {
        sendData: {
          name: faker.name,
          categoryIds: undefined,
        },
        expected: {
          message: [
            'categoryIds should not be empty',
            'categoryIds must be an array',
            'each value in categoryIds must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      categoryIds_NULL: {
        sendData: {
          name: faker.name,
          categoryIds: null,
        },
        expected: {
          message: [
            'categoryIds should not be empty',
            'categoryIds must be an array',
            'each value in categoryIds must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      categoryIds_EMPTY: {
        sendData: {
          name: faker.name,
          categoryIds: '',
        },
        expected: {
          message: [
            'categoryIds should not be empty',
            'categoryIds must be an array',
            'each value in categoryIds must be a UUID',
          ],
          ...defaultExpected,
        },
      },
      categoryIds_NOT_VALID: {
        sendData: {
          name: faker.name,
          categoryIds: ['a'],
        },
        expected: {
          message: ['each value in categoryIds must be a UUID'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      NAME_TOO_LONG: {
        sendData: {
          name: faker.withInvalidNameTooLong().name,
          categoryIds: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: [
            'name must be shorter than or equal to 255 characters',
            'Category with id(s) d8952775-5f69-42d5-9e94-00f097e1b98c not found',
          ],
          ...defaultExpected,
        },
      },
      CATEGORY_IDS_NOT_EXISTS: {
        sendData: {
          name: faker.withName('action').name,
          categoryIds: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: [
            'Category with id(s) d8952775-5f69-42d5-9e94-00f097e1b98c not found',
          ],
          ...defaultExpected,
        },
      },
    };
  }
}

export class UpdateGenreFixture {
  static keysInResponse = _keysInResponse;

  static arrangeForSave() {
    const faker = Genre.fake().aGenre().withName('test name');

    const category = Category.fake().aCategory().build();

    const case1 = {
      entity: faker.addCategoryId(category.categoryId).build(),
      relations: {
        categories: [category],
      },
      sendData: {
        name: faker.name,
        categoryIds: [category.categoryId.id],
      },
      expected: {
        name: faker.name,
        categoryIds: expect.arrayContaining([category.categoryId.id]),
        categories: expect.arrayContaining([
          {
            id: category.categoryId.id,
            name: category.name,
            createdAt: category.createdAt.toISOString(),
          },
        ]),
        isActive: false,
      },
    };

    const case2 = {
      entity: faker.addCategoryId(category.categoryId).build(),
      relations: {
        categories: [category],
      },
      sendData: {
        name: faker.name,
        categoryIds: [category.categoryId.id],
        isActive: false,
      },
      expected: {
        name: faker.name,
        categoryIds: expect.arrayContaining([category.categoryId.id]),
        categories: expect.arrayContaining([
          {
            id: category.categoryId.id,
            name: category.name,
            createdAt: category.createdAt.toISOString(),
          },
        ]),
        isActive: false,
      },
    };

    const categories = Category.fake().theCategories(3).build();
    const case3 = {
      entity: faker.addCategoryId(category.categoryId).build(),
      relations: {
        categories: [category, ...categories],
      },
      sendData: {
        name: faker.name,
        categoryIds: [
          categories[0].categoryId.id,
          categories[1].categoryId.id,
          categories[2].categoryId.id,
        ],
      },
      expected: {
        name: faker.name,
        categoryIds: expect.arrayContaining([
          categories[0].categoryId.id,
          categories[1].categoryId.id,
          categories[2].categoryId.id,
        ]),
        categories: expect.arrayContaining([
          {
            id: categories[0].categoryId.id,
            name: categories[0].name,
            createdAt: categories[0].createdAt.toISOString(),
          },
          {
            id: categories[1].categoryId.id,
            name: categories[1].name,
            createdAt: categories[1].createdAt.toISOString(),
          },
          {
            id: categories[2].categoryId.id,
            name: categories[2].name,
            createdAt: categories[2].createdAt.toISOString(),
          },
        ]),
        isActive: false,
      },
    };

    return [case1, case2, case3];
  }

  static arrangeInvalidRequest() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      categoryIds_NOT_VALID: {
        sendData: {
          name: faker.name,
          categoryIds: ['a'],
        },
        expected: {
          message: ['each value in categoryIds must be a UUID'],
          ...defaultExpected,
        },
      },
    };
  }

  static arrangeForEntityValidationError() {
    const faker = Genre.fake().aGenre();
    const defaultExpected = {
      statusCode: 422,
      error: 'Unprocessable Entity',
    };

    return {
      CATEGORY_IDS_NOT_EXISTS: {
        sendData: {
          name: faker.withName('action').name,
          categoryIds: ['d8952775-5f69-42d5-9e94-00f097e1b98c'],
        },
        expected: {
          message: [
            'Category with id(s) d8952775-5f69-42d5-9e94-00f097e1b98c not found',
          ],
          ...defaultExpected,
        },
      },
    };
  }
}

export class ListGenresFixture {
  static arrangeIncrementedWithCreatedAt() {
    const category = Category.fake().aCategory().build();
    const _entities = Genre.fake()
      .theGenres(4)
      .addCategoryId(category.categoryId)
      .withName((i) => i + '')
      .withCreatedAt((i) => new Date(new Date().getTime() + i * 2000))
      .build();

    const entitiesMap = {
      first: _entities[0],
      second: _entities[1],
      third: _entities[2],
      fourth: _entities[3],
    };

    const relations = {
      categories: new Map([[category.categoryId.id, category]]),
    };

    const arrange = [
      {
        sendData: {},
        expected: {
          entities: [
            entitiesMap.fourth,
            entitiesMap.third,
            entitiesMap.second,
            entitiesMap.first,
          ],
          meta: {
            currentPage: 1,
            lastPage: 1,
            perPage: 15,
            total: 4,
          },
        },
      },
      {
        sendData: {
          page: 1,
          perPage: 2,
        },
        expected: {
          entities: [entitiesMap.fourth, entitiesMap.third],
          meta: {
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
            total: 4,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
        },
        expected: {
          entities: [entitiesMap.second, entitiesMap.first],
          meta: {
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
            total: 4,
          },
        },
      },
    ];

    return { arrange, entitiesMap, relations };
  }

  static arrangeUnsorted() {
    const categories = Category.fake().theCategories(4).build();

    const relations = {
      categories: new Map(
        categories.map((category) => [category.categoryId.id, category]),
      ),
    };

    const createdAt = new Date();

    const entitiesMap = {
      test: Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .withName('test')
        .withCreatedAt(new Date(createdAt.getTime() + 1000))
        .build(),
      a: Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .withName('a')
        .withCreatedAt(new Date(createdAt.getTime() + 2000))
        .build(),
      TEST: Genre.fake()
        .aGenre()
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .withName('TEST')
        .withCreatedAt(new Date(createdAt.getTime() + 3000))
        .build(),
      e: Genre.fake()
        .aGenre()
        .addCategoryId(categories[3].categoryId)
        .withName('e')
        .withCreatedAt(new Date(createdAt.getTime() + 4000))
        .build(),
      TeSt: Genre.fake()
        .aGenre()
        .addCategoryId(categories[1].categoryId)
        .addCategoryId(categories[2].categoryId)
        .withName('TeSt')
        .withCreatedAt(new Date(createdAt.getTime() + 5000))
        .build(),
    };

    const arrange_filter_by_name_sort_name_asc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        get label() {
          return JSON.stringify(this.sendData);
        },
        expected: {
          entities: [entitiesMap.TEST, entitiesMap.TeSt],
          meta: {
            total: 3,
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'name',
          filter: { name: 'TEST' },
        },
        get label() {
          return JSON.stringify(this.sendData);
        },
        expected: {
          entities: [entitiesMap.test],
          meta: {
            total: 3,
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
    ];

    const arrange_filter_by_categoryIds_and_sort_by_created_desc = [
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'createdAt',
          sortDir: 'desc' as SortDirection,
          filter: { categoryIds: [categories[0].categoryId.id] },
        },
        get label() {
          return JSON.stringify({
            ...this.sendData,
            filter: { categoryIds_length: 1 },
          });
        },
        expected: {
          entities: [entitiesMap.TEST, entitiesMap.a],
          meta: {
            total: 3,
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'createdAt',
          sortDir: 'desc' as SortDirection,
          filter: { categoryIds: [categories[0].categoryId.id] },
        },
        get label() {
          return JSON.stringify({
            ...this.sendData,
            filter: { categoryIds_length: 1 },
          });
        },
        expected: {
          entities: [entitiesMap.test],
          meta: {
            total: 3,
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 1,
          perPage: 2,
          sort: 'createdAt',
          sortDir: 'desc' as SortDirection,
          filter: {
            categoryIds: [
              categories[0].categoryId.id,
              categories[1].categoryId.id,
            ],
          },
        },
        get label() {
          return JSON.stringify({
            ...this.sendData,
            filter: { categoryIds_length: 2 },
          });
        },
        expected: {
          entities: [entitiesMap.TeSt, entitiesMap.TEST],
          meta: {
            total: 4,
            currentPage: 1,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
      {
        sendData: {
          page: 2,
          perPage: 2,
          sort: 'createdAt',
          sortDir: 'desc' as SortDirection,
          filter: {
            categoryIds: [
              categories[0].categoryId.id,
              categories[1].categoryId.id,
            ],
          },
        },
        get label() {
          return JSON.stringify({
            ...this.sendData,
            filter: { categoryIds_length: 2 },
          });
        },
        expected: {
          entities: [entitiesMap.a, entitiesMap.test],
          meta: {
            total: 4,
            currentPage: 2,
            lastPage: 2,
            perPage: 2,
          },
        },
      },
    ];

    return {
      arrange: [
        ...arrange_filter_by_name_sort_name_asc,
        ...arrange_filter_by_categoryIds_and_sort_by_created_desc,
      ],
      entitiesMap,
      relations,
    };
  }
}
