import { Category, CategoryId } from '@core/category/domain/category.aggregate';
import { ICategoryRepository } from '@core/category/domain/category.repository';
import { IUseCase } from '@core/shared/application/use-case-interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { SaveCategoryInput } from './save-category.input';

export type SaveCategoryOutput = { id: string; created: boolean };

export class SaveCategoryUseCase
  implements IUseCase<SaveCategoryInput, SaveCategoryOutput>
{
  constructor(private categoryRepository: ICategoryRepository) {}

  async execute(input: SaveCategoryInput): Promise<SaveCategoryOutput> {
    const categoryId = new CategoryId(input.category_id);
    const category = await this.categoryRepository.findById(categoryId);

    return category
      ? this.updateCategory(input, category)
      : this.createCategory(input);
  }

  private async createCategory(input: SaveCategoryInput) {
    const entity = Category.create({
      ...input,
      category_id: new CategoryId(input.category_id),
    });

    if (entity.notification.hasErrors()) {
      throw new EntityValidationError(entity.notification.toJSON());
    }

    await this.categoryRepository.insert(entity);

    return { id: entity.category_id.id, created: true };
  }

  private async updateCategory(input: SaveCategoryInput, category: Category) {
    if (input.is_active === false) {
      const hasOnlyOneActivateInRelated =
        await this.categoryRepository.hasOnlyOneActivateInRelated(
          category.category_id,
        );
      if (hasOnlyOneActivateInRelated) {
        throw new EntityValidationError([
          {
            is_active: ['At least one category must be active in related.'],
          },
        ]);
      }
    }

    category.changeName(input.name);
    category.changeDescription(input.description);

    if (input.is_active) {
      category.activate();
    } else {
      category.deactivate();
    }

    category.changeCreatedAt(input.created_at);

    if (category.notification.hasErrors()) {
      throw new EntityValidationError(category.notification.toJSON());
    }

    await this.categoryRepository.update(category);

    return { id: category.category_id.id, created: false };
  }
}
