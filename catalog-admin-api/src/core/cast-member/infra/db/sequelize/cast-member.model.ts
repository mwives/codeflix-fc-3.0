import { Column, DataType, Model, Table } from 'sequelize-typescript';

export type CastMemberModelProps = {
  castMemberId: string;
  name: string;
  type: number;
  createdAt: Date;
};

@Table({
  tableName: 'cast_members',
  timestamps: false,
})
export class CastMemberModel extends Model<CastMemberModelProps> {
  @Column({
    type: DataType.UUID,
    primaryKey: true,
    allowNull: false,
    unique: true,
    field: 'cast_member_id',
  })
  declare castMemberId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.SMALLINT })
  declare type: number;

  @Column({ field: 'created_at', allowNull: false, type: DataType.DATE(3) })
  declare createdAt: Date;
}
