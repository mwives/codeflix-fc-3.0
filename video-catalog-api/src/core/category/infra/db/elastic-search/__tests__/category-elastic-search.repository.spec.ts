import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { esMapping } from '@core/shared/infra/db/elastic-search/es-mapping';
import { ElasticsearchService } from '@nestjs/elasticsearch';
import {
  CategoryElasticSearchMapper,
  CategoryElasticSearchRepository,
} from '../category-elastic-search';
import { NotFoundError } from '@core/shared/domain/errors/not-found.error';

describe('CategoryElasticSearchRepository Integration Tests', () => {
  const esClient: ElasticsearchService = new ElasticsearchService({
    node: 'http://localhost:9200',
  });
  let repository: CategoryElasticSearchRepository;

  beforeEach(async () => {
    await esClient.indices.create({
      index: 'categories',
    });
    await esClient.indices.putMapping({
      index: 'categories',
      body: esMapping,
    });
    repository = new CategoryElasticSearchRepository(esClient, 'categories');
  });

  afterEach(async () => {
    try {
      await esClient.indices.delete({
        index: 'categories',
      });
    } catch (err) {
      console.error('Error deleting index:', err);
    }
  });

  test('should insert a entity', async () => {
    const category = Category.create({
      category_id: new CategoryId(),
      name: 'Movie',
      description: 'some description',
      is_active: false,
      created_at: new Date(),
    });
    await repository.insert(category);

    const document = await esClient.get({
      index: 'categories',
      id: category.category_id.id,
    });

    const entity = CategoryElasticSearchMapper.toEntity(
      category.category_id.id,
      document.body._source,
    );

    expect(entity!.toJSON()).toStrictEqual(category.toJSON());
  });

  test('should update a entity', async () => {
    const categories = Category.fake().theCategories(2).build();
    await repository.bulkInsert(categories);

    const result = await Promise.all(
      categories.map((c) =>
        esClient.get({ index: 'categories', id: c.category_id.id }),
      ),
    );

    const foundCategories = result.map((r) =>
      CategoryElasticSearchMapper.toEntity(r.body._id, r.body._source),
    );

    expect(foundCategories.length).toBe(2);
    expect(foundCategories[0].toJSON()).toStrictEqual(categories[0].toJSON());
    expect(foundCategories[1].toJSON()).toStrictEqual(categories[1].toJSON());
  });

  it('should finds a entity by id', async () => {
    let entityFound = await repository.findById(new CategoryId());
    expect(entityFound).toBeNull();

    const entity = Category.create({
      category_id: new CategoryId(),
      name: 'Movie',
      description: 'some description',
      is_active: false,
      created_at: new Date(),
    });

    await repository.insert(entity);

    entityFound = await repository.findById(entity.category_id);

    expect(entity.toJSON()).toStrictEqual(entityFound!.toJSON());
  });

  it('should find a entity by filter', async () => {
    const entity = Category.create({
      category_id: new CategoryId(),
      name: 'Movie',
      description: 'some description',
      is_active: false,
      created_at: new Date(),
    });
    await repository.insert(entity);

    let entityFound = await repository.findOneBy({
      category_id: entity.category_id,
    });

    expect(entity.toJSON()).toStrictEqual(entityFound!.toJSON());
    expect(repository.findOneBy({ is_active: true })).resolves.toBeNull();

    entityFound = await repository.findOneBy({
      category_id: entity.category_id,
      is_active: false,
    });

    expect(entityFound?.toJSON()).toStrictEqual(entity.toJSON());
  });

  it('should find entities by filter and order', async () => {
    const categories = [
      Category.fake().aCategory().withName('a').build(),
      Category.fake().aCategory().withName('b').build(),
    ];

    await repository.bulkInsert(categories);

    let entities = await repository.findBy(
      { is_active: true },
      {
        field: 'name',
        direction: 'asc',
      },
    );

    expect(entities).toStrictEqual([categories[0], categories[1]]);

    entities = await repository.findBy(
      { is_active: true },
      {
        field: 'name',
        direction: 'desc',
      },
    );

    expect(entities).toStrictEqual([categories[1], categories[0]]);
  });

  it('should find entities by filter', async () => {
    const entity = Category.create({
      category_id: new CategoryId(),
      name: 'Movie',
      description: 'some description',
      is_active: false,
      created_at: new Date(),
    });
    await repository.insert(entity);

    let entities = await repository.findBy({ category_id: entity.category_id });
    expect(entities).toHaveLength(1);
    expect(JSON.stringify(entities)).toBe(JSON.stringify([entity]));

    entities = await repository.findBy({ is_active: true });
    expect(entities).toHaveLength(0);

    entities = await repository.findBy({
      category_id: entity.category_id,
      is_active: false,
    });

    expect(entities).toHaveLength(1);
    expect(JSON.stringify(entities)).toBe(JSON.stringify([entity]));
  });

  it('should return all categories', async () => {
    const entity = new Category({
      category_id: new CategoryId(),
      name: 'Movie',
      description: 'some description',
      is_active: false,
      created_at: new Date(),
    });

    await repository.insert(entity);

    const entities = await repository.findAll();

    expect(entities).toHaveLength(1);
    expect(JSON.stringify(entities)).toBe(JSON.stringify([entity]));
  });

  it('should return a categories list by ids', async () => {
    const categories = Category.fake().theCategories(2).build();

    await repository.bulkInsert(categories);
    const { exists: foundCategories } = await repository.findByIds(
      categories.map((g) => g.category_id),
    );

    expect(foundCategories.length).toBe(2);
    expect(foundCategories[0].toJSON()).toStrictEqual(categories[0].toJSON());
    expect(foundCategories[1].toJSON()).toStrictEqual(categories[1].toJSON());
  });

  it('should return category id that exists', async () => {
    const category = Category.fake().aCategory().build();
    await repository.insert(category);

    const existsResult1 = await repository.existsById([category.category_id]);
    expect(existsResult1.exists[0]).toBeValueObject(category.category_id);
    expect(existsResult1.not_exists).toHaveLength(0);

    const categoryId1 = new CategoryId();
    const categoryId2 = new CategoryId();
    const notExistsResult = await repository.existsById([
      categoryId1,
      categoryId2,
    ]);
    expect(notExistsResult.exists).toHaveLength(0);
    expect(notExistsResult.not_exists).toHaveLength(2);
    expect(notExistsResult.not_exists[0]).toBeValueObject(categoryId1);
    expect(notExistsResult.not_exists[1]).toBeValueObject(categoryId2);

    const existsResult2 = await repository.existsById([
      category.category_id,
      categoryId1,
    ]);

    expect(existsResult2.exists).toHaveLength(1);
    expect(existsResult2.not_exists).toHaveLength(1);
    expect(existsResult2.exists[0]).toBeValueObject(category.category_id);
    expect(existsResult2.not_exists[0]).toBeValueObject(categoryId1);
  });

  it('should throw error on update when a entity not found', async () => {
    const entity = Category.fake().aCategory().build();
    await expect(repository.update(entity)).rejects.toThrow(
      new NotFoundError(entity.category_id.id, Category),
    );
  });

  it('should update a entity', async () => {
    const entity = Category.fake().aCategory().build();
    await repository.insert(entity);

    entity.changeName('Movie updated');
    await repository.update(entity);

    const entityFound = await repository.findById(entity.category_id);
    expect(entity.toJSON()).toStrictEqual(entityFound!.toJSON());
  });

  it('should throw error on delete when a entity not found', async () => {
    const categoryId = new CategoryId();
    await expect(repository.delete(categoryId)).rejects.toThrow(
      new NotFoundError(categoryId.id, Category),
    );
  });

  it('should delete a entity', async () => {
    const entity = new Category({
      category_id: new CategoryId(),
      name: 'Movie',
      description: 'some description',
      is_active: false,
      created_at: new Date(),
    });
    await repository.insert(entity);

    await repository.delete(entity.category_id);
    await expect(repository.findById(entity.category_id)).resolves.toBeNull();
  });
});
