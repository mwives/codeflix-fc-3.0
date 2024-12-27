import { Category } from '@core/category/domain/entity/category.entity';
import { Genre } from '@core/genre/domain/entity/genre.entity';
import { GenreOutputMapper } from './genre.output';

describe('GenreOutputMapper', () => {
  describe('toDTO', () => {
    it('should return a GenreOutput', () => {
      const categories = Category.fake().theCategories(2).build();
      const createdAt = new Date();

      const entity = Genre.fake()
        .aGenre()
        .withName('test')
        .addCategoryId(categories[0].categoryId)
        .addCategoryId(categories[1].categoryId)
        .withCreatedAt(createdAt)
        .build();

      const output = GenreOutputMapper.toDTO(entity, categories);

      expect(output).toEqual({
        id: entity.genreId.id,
        name: entity.name,
        categories: categories.map((c) => ({
          id: c.categoryId.id,
          name: c.name,
          createdAt: c.createdAt,
        })),
        categoryIds: categories.map((c) => c.categoryId.id),
        isActive: entity.isActive,
        createdAt,
      });
    });
  });
});
