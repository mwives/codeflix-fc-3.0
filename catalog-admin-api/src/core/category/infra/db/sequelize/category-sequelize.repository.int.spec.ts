import { NotFoundError } from '../../../../shared/domain/error/not-found.error';
import { Uuid } from '../../../../shared/domain/value-object/value-objects/uuid.vo';
import { setupSequelize } from '../../../../shared/infra/testing/helpers';
import { Category } from '../../../domain/entity/category.entity';
import { CategorySearchParams } from '../../../domain/repository/category.repository';
import { CategorySequelizeRepository } from './category-sequelize.repository';
import { CategoryModel } from './category.model';

describe('CategorySequelizeRepository', () => {
  let repository: CategorySequelizeRepository;

  setupSequelize({ models: [CategoryModel] });

  beforeEach(async () => {
    repository = new CategorySequelizeRepository(CategoryModel);
  });

  async function createCategory(): Promise<Category> {
    const category = Category.fake().aCategory().build();
    await CategoryModel.create({
      categoryId: category.categoryId.id,
      name: category.name,
      description: category.description,
      isActive: category.isActive,
      createdAt: category.createdAt,
    });
    return category;
  }

  describe('insert', () => {
    it('should insert a category', async () => {
      const category = Category.fake().aCategory().build();

      await repository.insert(category);

      const categoryInserted = await CategoryModel.findByPk(
        category.categoryId.id,
      );
      expect(categoryInserted.toJSON()).toMatchObject({
        categoryId: category.categoryId.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
      });
    });
  });

  describe('bulkInsert', () => {
    it('should insert multiple categories', async () => {
      const categories = [
        Category.fake().aCategory().build(),
        Category.fake().aCategory().build(),
      ];

      await repository.bulkInsert(categories);

      const categoriesInserted = await CategoryModel.findAll();
      expect(categoriesInserted).toHaveLength(2);
      expect(categoriesInserted[0].categoryId).toBe(
        categories[0].categoryId.id,
      );
      expect(categoriesInserted[1].categoryId).toBe(
        categories[1].categoryId.id,
      );
    });
  });

  describe('update', () => {
    it('should update a category', async () => {
      const category = await createCategory();

      category.name = 'new name';
      category.description = 'new description';

      await repository.update(category);

      const categoryUpdated = await CategoryModel.findByPk(
        category.categoryId.id,
      );
      expect(categoryUpdated.toJSON()).toMatchObject({
        categoryId: category.categoryId.id,
        name: categoryUpdated.name,
        description: categoryUpdated.description,
        isActive: categoryUpdated.isActive,
        createdAt: categoryUpdated.createdAt,
      });
    });

    it('should throw an error when category is not found', async () => {
      const category = Category.fake().aCategory().build();
      await expect(repository.update(category)).rejects.toThrow(NotFoundError);
    });
  });

  describe('delete', () => {
    it('should delete a category', async () => {
      const category = await createCategory();

      await repository.delete(category.categoryId);

      const categoryDeleted = await CategoryModel.findByPk(
        category.categoryId.id,
      );
      expect(categoryDeleted).toBeNull();
    });

    it('should throw an error when category is not found', async () => {
      const categoryId = new Uuid();
      await expect(repository.delete(categoryId)).rejects.toThrow(
        NotFoundError,
      );
    });
  });

  describe('findById', () => {
    it('should return a category by id', async () => {
      const category = await createCategory();

      const categoryFound = await repository.findById(category.categoryId);

      expect(categoryFound).toMatchObject(category);
    });

    it('should return null when category is not found', async () => {
      const categoryFound = await repository.findById(new Uuid());

      expect(categoryFound).toBeNull();
    });
  });

  describe('findAll', () => {
    it('should return all categories', async () => {
      const categories = [
        Category.fake().aCategory().build(),
        Category.fake().aCategory().build(),
      ];
      await CategoryModel.bulkCreate(
        categories.map((category) => ({
          categoryId: category.categoryId.id,
          name: category.name,
          description: category.description,
          isActive: category.isActive,
          createdAt: category.createdAt,
        })),
      );

      const categoriesFound = await repository.findAll();

      expect(categoriesFound).toHaveLength(2);
      expect(categoriesFound[0]).toMatchObject(categories[0]);
      expect(categoriesFound[1]).toMatchObject(categories[1]);
    });
  });

  describe('search', () => {
    async function createCategories() {
      const categories = [
        Category.fake().aCategory().withName('test').build(),
        Category.fake().aCategory().withName('TEST').build(),
        Category.fake().aCategory().withName('fake').build(),
      ];
      await CategoryModel.bulkCreate(
        categories.map((category) => ({
          categoryId: category.categoryId.id,
          name: category.name,
          description: category.description,
          isActive: category.isActive,
          createdAt: category.createdAt,
        })),
      );
      return categories;
    }

    it('should search categories', async () => {
      const categories = await createCategories();

      const categoriesFound = await repository.search(
        new CategorySearchParams({
          filter: 'TEST',
          sort: 'name',
          sortDir: 'asc',
        }),
      );

      expect(categoriesFound.total).toBe(2);
      expect(categoriesFound.items).toHaveLength(2);
      expect(categoriesFound.items[0]).toMatchObject(categories[1]);
      expect(categoriesFound.items[1]).toMatchObject(categories[0]);
    });

    it('should return all categories when filter is null', async () => {
      await createCategories();

      const categoriesFound = await repository.search(
        new CategorySearchParams({
          filter: null,
        }),
      );

      expect(categoriesFound.total).toBe(3);
      expect(categoriesFound.items).toHaveLength(3);
    });
  });
});
