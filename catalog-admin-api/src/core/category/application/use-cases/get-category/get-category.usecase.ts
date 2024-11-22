import { IUseCase } from '../../../../shared/application/use-case.interface';
import { NotFoundError } from '../../../../shared/domain/error/not-found.error';
import { Uuid } from '../../../../shared/domain/value-object/value-objects/uuid.vo';
import { Category } from '../../../domain/entity/category.entity';
import { ICategoryRepository } from '../../../domain/repository/category.repository';
import {
  CategoryOutput,
  CategoryOutputMapper,
} from '../@shared/category-output';

export class GetCategoryUseCase
  implements IUseCase<GetCategoryInput, GetCategoryOutput>
{
  constructor(private categoryRepo: ICategoryRepository) {}

  async execute(input: GetCategoryInput): Promise<GetCategoryOutput> {
    const uuid = new Uuid(input.id);
    const category = await this.categoryRepo.findById(uuid);
    if (!category) {
      throw new NotFoundError(input.id, Category);
    }

    return CategoryOutputMapper.toDTO(category);
  }
}

export type GetCategoryInput = {
  id: string;
};

export type GetCategoryOutput = CategoryOutput;
