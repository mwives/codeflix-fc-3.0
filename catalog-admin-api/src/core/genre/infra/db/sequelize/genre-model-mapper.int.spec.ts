import { Category } from '@core/category/domain/entity/category.entity';
import { ICategoryRepository } from '@core/category/domain/repository/category.repository';
import { CategorySequelizeRepository } from '@core/category/infra/db/sequelize/category-sequelize.repository';
import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Genre, GenreId } from '@core/genre/domain/entity/genre.entity';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { GenreModelMapper } from './genre-model-mapper';
import { GenreCategoryModel, GenreModel } from './genre.model';

describe('GenreModelMapper Integration Tests', () => {
  setupSequelize({ models: [CategoryModel, GenreModel, GenreCategoryModel] });

  let categoryRepo: ICategoryRepository;

  beforeEach(() => {
    categoryRepo = new CategorySequelizeRepository(CategoryModel);
  });

  describe('Error Handling', () => {
    it('should throw error when genre is invalid', () => {
      const arrange = [
        {
          makeModel: () => {
            return GenreModel.build({
              genreId: '9366b7dc-2d71-4799-b91c-c64adb205104',
              name: 't'.repeat(256),
              categoryIds: [],
            });
          },
          expectedErrors: [
            {
              categoryIds: ['categoryIds should not be empty'],
            },
            {
              name: ['name must be shorter than or equal to 255 characters'],
            },
          ],
        },
      ];

      for (const item of arrange) {
        try {
          GenreModelMapper.toEntity(item.makeModel());
          fail('The genre is valid, but it should throw a LoadEntityError');
        } catch (err) {
          expect(err).toBeInstanceOf(LoadEntityError);
          expect(err.errors).toMatchObject(item.expectedErrors);
        }
      }
    });
  });

  describe('Entity Conversion', () => {
    it('should convert a genre model to a genre entity', async () => {
      const category1 = Category.fake().aCategory().build();
      const category2 = Category.fake().aCategory().build();
      await categoryRepo.bulkInsert([category1, category2]);

      const createdAt = new Date();
      const model = await GenreModel.create(
        {
          genreId: '5490020a-e866-4229-9adc-aa44b83234c4',
          name: 'some value',
          categoryIds: [
            GenreCategoryModel.build({
              genreId: '5490020a-e866-4229-9adc-aa44b83234c4',
              categoryId: category1.categoryId.id,
            }),
            GenreCategoryModel.build({
              genreId: '5490020a-e866-4229-9adc-aa44b83234c4',
              categoryId: category2.categoryId.id,
            }),
          ],
          isActive: true,
          createdAt,
        },
        { include: ['categoryIds'] },
      );

      const entity = GenreModelMapper.toEntity(model);

      expect(entity.toJSON()).toEqual(
        new Genre({
          genreId: new GenreId('5490020a-e866-4229-9adc-aa44b83234c4'),
          name: 'some value',
          categoryIds: new Map([
            [category1.categoryId.id, category1.categoryId],
            [category2.categoryId.id, category2.categoryId],
          ]),
          isActive: true,
          createdAt,
        }).toJSON(),
      );
    });
  });
});
