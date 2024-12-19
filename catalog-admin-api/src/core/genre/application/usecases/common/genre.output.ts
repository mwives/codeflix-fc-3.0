import { Category } from '@core/category/domain/entity/category.entity';
import { Genre } from '@core/genre/domain/entity/genre.entity';

export type GenreCategoryOutput = {
  id: string;
  name: string;
  createdAt: Date;
};

export type GenreOutput = {
  id: string;
  name: string;
  categories: GenreCategoryOutput[];
  categoryIds: string[];
  isActive: boolean;
  createdAt: Date;
};

export class GenreOutputMapper {
  static toDTO(entity: Genre, categories: Category[]): GenreOutput {
    return {
      id: entity.genreId.id,
      name: entity.name,
      categories: categories.map((c) => ({
        id: c.categoryId.id,
        name: c.name,
        createdAt: c.createdAt,
      })),
      categoryIds: categories.map((c) => c.categoryId.id),
      isActive: entity.isActive,
      createdAt: entity.createdAt,
    };
  }
}
