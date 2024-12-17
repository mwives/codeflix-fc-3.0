import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import {
  BelongsToMany,
  Column,
  DataType,
  ForeignKey,
  HasMany,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';

export type GenreModelProps = {
  genreId: string;
  name: string;
  categoryIds?: GenreCategoryModel[];
  categories?: CategoryModel[];
  isActive: boolean;
  createdAt: Date;
};

@Table({ tableName: 'genres', timestamps: false })
export class GenreModel extends Model<GenreModelProps> {
  @PrimaryKey
  @Column({ type: DataType.UUID, field: 'genre_id' })
  declare genreId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.BOOLEAN, field: 'is_active' })
  declare isActive: boolean;

  @Column({ allowNull: false, type: DataType.DATE(6), field: 'created_at' })
  declare createdAt: Date;

  @HasMany(() => GenreCategoryModel, 'genreId')
  declare categoryIds: GenreCategoryModel[];

  @BelongsToMany(() => CategoryModel, () => GenreCategoryModel)
  declare categories: CategoryModel[];
}

export type GenreCategoryModelProps = {
  genreId: string;
  categoryId: string;
};

@Table({ tableName: 'category_genre', timestamps: false })
export class GenreCategoryModel extends Model<GenreCategoryModelProps> {
  @PrimaryKey
  @ForeignKey(() => GenreModel)
  @Column({ type: DataType.UUID, field: 'genre_id' })
  declare genreId: string;

  @PrimaryKey
  @ForeignKey(() => CategoryModel)
  @Column({ type: DataType.UUID, field: 'category_id' })
  declare categoryId: string;
}
