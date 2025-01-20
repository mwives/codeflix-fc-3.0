import { Column, DataType, Model, Table } from 'sequelize-typescript';

export type CategoryModelProps = {
  categoryId: string;
  name: string;
  description: string | null;
  isActive: boolean;
  createdAt: Date;
};

@Table({
  tableName: 'categories',
  timestamps: false,
})
export class CategoryModel extends Model<CategoryModelProps> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    unique: true,
    field: 'category_id',
  })
  declare categoryId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: true, type: DataType.TEXT })
  declare description: string | null;

  @Column({ field: 'is_active', allowNull: false, type: DataType.BOOLEAN })
  declare isActive: boolean | null;

  @Column({ field: 'created_at', allowNull: false, type: DataType.DATE(3) })
  declare createdAt: Date;
}
