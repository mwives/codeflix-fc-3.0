import { Category } from '../../../domain/entity/category.entity';
import { CategoryOutputMapper } from './category-output';

describe('CategoryOutput', () => {
  describe('toDTO', () => {
    it('should return a category output', () => {
      const category = Category.fake().aCategory().build();

      const result = CategoryOutputMapper.toDTO(category);

      expect(result).toEqual({
        id: category.categoryId.id,
        name: category.name,
        description: category.description,
        isActive: category.isActive,
        createdAt: category.createdAt,
      });
    });
  });
});
