import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { CategoryOutputMapper } from './category-output';

describe('CategoryOutputMapper Unit Tests', () => {
  it('should convert a category in output', () => {
    const entity = Category.create({
      category_id: new CategoryId(),
      name: 'any_name',
      description: 'any_description',
      is_active: true,
      created_at: new Date(),
    });

    const spyToJSON = jest.spyOn(entity, 'toJSON');

    const output = CategoryOutputMapper.toOutput(entity);

    expect(spyToJSON).toHaveBeenCalled();
    expect(output).toStrictEqual({
      id: entity.category_id.id,
      name: 'any_name',
      description: 'any_description',
      is_active: true,
      created_at: entity.created_at,
      deleted_at: null,
    });

    entity.markAsDeleted();

    const outputDeleted = CategoryOutputMapper.toOutput(entity);
    expect(outputDeleted).toStrictEqual({
      id: entity.category_id.id,
      name: 'any_name',
      description: 'any_description',
      is_active: true,
      created_at: entity.created_at,
      deleted_at: entity.deleted_at,
    });
  });
});
