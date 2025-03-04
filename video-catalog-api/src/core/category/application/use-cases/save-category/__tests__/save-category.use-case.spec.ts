import { CategoryId, Category } from '@core/category/domain/category.aggregate';
import { CategoryInMemoryRepository } from '@core/category/infra/db/in-memory/category-in-memory.repository';
import { SaveCategoryInput } from '../save-category.input';
import { SaveCategoryUseCase } from '../save-category.use-case';

describe('SaveCategoryUseCase Unit Tests', () => {
  let useCase: SaveCategoryUseCase;
  let repository: CategoryInMemoryRepository;

  beforeEach(() => {
    repository = new CategoryInMemoryRepository();
    jest.spyOn(repository, 'hasOnlyOneActivateInRelated').mockImplementation();
    useCase = new SaveCategoryUseCase(repository);
  });

  it('should call createCategory method when category not exists in database', async () => {
    useCase['createCategory'] = jest.fn();

    const input = new SaveCategoryInput({
      category_id: new CategoryId().id,
      name: 'test',
      description: 'some description',
      is_active: false,
      created_at: new Date(),
    });

    await useCase.execute(input);

    expect(useCase['createCategory']).toHaveBeenCalledTimes(1);
    expect(useCase['createCategory']).toHaveBeenCalledWith(input);
  });

  it('should call updateCategory method when category exists in database', async () => {
    useCase['updateCategory'] = jest.fn();
    const category = Category.fake().aCategory().build();

    repository.insert(category);

    const input = new SaveCategoryInput({
      category_id: category.category_id.id,
      name: 'test',
      description: 'some description',
      is_active: false,
      created_at: new Date(),
    });

    await useCase.execute(input);

    expect(useCase['updateCategory']).toHaveBeenCalledTimes(1);
    expect(useCase['updateCategory']).toHaveBeenCalledWith(
      input,
      expect.any(Category),
    );
  });

  describe('execute createCategory method', () => {
    it('should throw an error when entity is not valid', async () => {
      const spyCreateCategory = jest.spyOn(useCase, 'createCategory' as any);

      const input = new SaveCategoryInput({
        category_id: new CategoryId().id,
        name: 't'.repeat(256),
        description: 'some description',
        is_active: false,
        created_at: new Date(),
      });

      await expect(() => useCase.execute(input)).rejects.toThrowError(
        'Entity Validation Error',
      );

      expect(spyCreateCategory).toHaveBeenCalledTimes(1);
    });

    it('should create a category', async () => {
      const spyInsert = jest.spyOn(repository, 'insert');

      const categoryId = new CategoryId().id;

      const input = new SaveCategoryInput({
        category_id: categoryId,
        name: 'test',
        description: 'some description',
        is_active: false,
        created_at: new Date(),
      });

      const output = await useCase.execute(input);

      expect(spyInsert).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: categoryId,
        created: true,
      });
    });
  });

  describe('execute calling updateCategory method', () => {
    it('should throw an error when entity is not valid', async () => {
      const category = Category.fake().aCategory().build();
      repository.items.push(category);

      const input = new SaveCategoryInput({
        category_id: category.category_id.id,
        name: 't'.repeat(256),
        description: 'some description',
        is_active: false,
        created_at: new Date(),
      });

      await expect(() => useCase.execute(input)).rejects.toThrow(
        'Entity Validation Error',
      );
    });

    it('should update a category', async () => {
      const spyUpdate = jest.spyOn(repository, 'update');

      const category = Category.fake().aCategory().build();
      repository.items.push(category);

      const input = new SaveCategoryInput({
        category_id: category.category_id.id,
        name: 'test',
        description: 'some description',
        is_active: false,
        created_at: new Date(),
      });

      const output = await useCase.execute(input);

      expect(spyUpdate).toHaveBeenCalledTimes(1);
      expect(output).toStrictEqual({
        id: repository.items[0].category_id.id,
        created: false,
      });
    });
  });
});
