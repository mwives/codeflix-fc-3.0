import { Category } from '@core/category/domain/entity/category.entity';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { DataType } from 'sequelize-typescript';
import { GenreCategoryModel, GenreModel } from './genre.model';

describe('GenreModel Integration Tests', () => {
  setupSequelize({
    models: [CategoryModel, GenreModel, GenreCategoryModel],
  });

  describe('Table and Mapping Properties', () => {
    it('should have the correct table name', () => {
      expect(GenreModel.tableName).toBe('genres');
    });

    it('should map the attributes correctly', () => {
      const attributesMap = GenreModel.getAttributes();
      const attributes = Object.keys(attributesMap);

      expect(attributes).toStrictEqual([
        'genreId',
        'name',
        'isActive',
        'createdAt',
      ]);

      const genreIdAttr = attributesMap.genreId;
      expect(genreIdAttr).toMatchObject({
        field: 'genre_id',
        fieldName: 'genreId',
        primaryKey: true,
        type: DataType.UUID(),
      });

      const nameAttr = attributesMap.name;
      expect(nameAttr).toMatchObject({
        field: 'name',
        fieldName: 'name',
        allowNull: false,
        type: DataType.STRING(255),
      });

      const isActiveAttr = attributesMap.isActive;
      expect(isActiveAttr).toMatchObject({
        field: 'is_active',
        fieldName: 'isActive',
        allowNull: false,
        type: DataType.BOOLEAN(),
      });

      const createdAtAttr = attributesMap.createdAt;
      expect(createdAtAttr).toMatchObject({
        field: 'created_at',
        fieldName: 'createdAt',
        allowNull: false,
        type: DataType.DATE(6),
      });
    });
  });

  describe('Mapping Associations', () => {
    it('should map the associations correctly', () => {
      const associationsMap = GenreModel.associations;
      const associations = Object.keys(associationsMap);

      expect(associations).toStrictEqual(['categoryIds', 'categories']);

      const categoriesIdRelation = associationsMap.categoryIds;
      expect(categoriesIdRelation).toMatchObject({
        associationType: 'HasMany',
        source: GenreModel,
        target: GenreCategoryModel,
        options: {
          foreignKey: { name: 'genreId' },
          as: 'categoryIds',
        },
      });

      const categoriesRelation = associationsMap.categories;
      expect(categoriesRelation).toMatchObject({
        associationType: 'BelongsToMany',
        source: GenreModel,
        target: CategoryModel,
        options: {
          through: { model: GenreCategoryModel },
          foreignKey: { name: 'genreId' },
          otherKey: { name: 'categoryId' },
          as: 'categories',
        },
      });
    });
  });

  describe('Database Operations', () => {
    it('should create and associate categories separately', async () => {
      const categories = Category.fake().theCategories(3).build();
      const categoryRepo = new CategorySequelizeRepository(CategoryModel);
      await categoryRepo.bulkInsert(categories);

      const genreData = {
        genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'test',
        isActive: true,
        createdAt: new Date(),
      };

      const genreModel = await GenreModel.create(genreData);
      await genreModel.$add('categories', [
        categories[0].categoryId.id,
        categories[1].categoryId.id,
        categories[2].categoryId.id,
      ]);

      const genreWithCategories = await GenreModel.findByPk(
        genreModel.genreId,
        {
          include: [{ model: CategoryModel, attributes: ['categoryId'] }],
        },
      );

      expect(genreWithCategories).toMatchObject(genreData);
      expect(genreWithCategories!.categories).toHaveLength(3);
      expect(genreWithCategories!.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            categoryId: categories[0].categoryId.id,
          }),
          expect.objectContaining({
            categoryId: categories[1].categoryId.id,
          }),
          expect.objectContaining({
            categoryId: categories[2].categoryId.id,
          }),
        ]),
      );
    });

    it('should create a genre with categories in a single transaction', async () => {
      const categories = Category.fake().theCategories(3).build();
      const categoryRepo = new CategorySequelizeRepository(CategoryModel);
      await categoryRepo.bulkInsert(categories);

      const genreModelData = {
        genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'test',
        isActive: true,
        categoryIds: [
          GenreCategoryModel.build({
            categoryId: categories[0].categoryId.id,
            genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
          }),
          GenreCategoryModel.build({
            categoryId: categories[1].categoryId.id,
            genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
          }),
          GenreCategoryModel.build({
            categoryId: categories[2].categoryId.id,
            genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
          }),
        ],
        createdAt: new Date(),
      };

      const genreModel = await GenreModel.create(genreModelData, {
        include: ['categoryIds'],
      });

      const genreWithCategories = await GenreModel.findByPk(
        genreModel.genreId,
        {
          include: [{ model: CategoryModel, attributes: ['categoryId'] }],
        },
      );

      const { categoryIds, ...genreCommonProps } = genreModelData;
      expect(genreWithCategories).toMatchObject(genreCommonProps);
      expect(genreWithCategories!.categories).toHaveLength(3);
      expect(genreWithCategories!.categories).toEqual(
        expect.arrayContaining([
          expect.objectContaining({
            categoryId: categories[0].categoryId.id,
          }),
          expect.objectContaining({
            categoryId: categories[1].categoryId.id,
          }),
          expect.objectContaining({
            categoryId: categories[2].categoryId.id,
          }),
        ]),
      );
    });
  });
});

describe('GenreCategoryModel Integration Tests', () => {
  setupSequelize({
    models: [CategoryModel, GenreModel, GenreCategoryModel],
  });

  describe('Table and Mapping Properties', () => {
    it('should have the correct table name', () => {
      expect(GenreCategoryModel.tableName).toBe('category_genre');
    });

    it('should map the attributes correctly', () => {
      const attributesMap = GenreCategoryModel.getAttributes();
      const attributes = Object.keys(attributesMap);

      expect(attributes).toStrictEqual(['genreId', 'categoryId']);

      const genreIdAttr = attributesMap.genreId;
      expect(genreIdAttr).toMatchObject({
        field: 'genre_id',
        fieldName: 'genreId',
        primaryKey: true,
        type: DataType.UUID(),
        references: {
          model: 'genres',
          key: 'genre_id',
        },
        unique: 'category_genre_genreId_categoryId_unique',
      });

      const categoryIdAttr = attributesMap.categoryId;
      expect(categoryIdAttr).toMatchObject({
        field: 'category_id',
        fieldName: 'categoryId',
        primaryKey: true,
        type: DataType.UUID(),
        references: {
          model: 'categories',
          key: 'category_id',
        },
        unique: 'category_genre_genreId_categoryId_unique',
      });
    });
  });
});
