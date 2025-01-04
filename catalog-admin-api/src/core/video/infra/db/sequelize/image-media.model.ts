import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import {
  Column,
  DataType,
  ForeignKey,
  Model,
  PrimaryKey,
  Table,
} from 'sequelize-typescript';
import { VideoModel } from './video.model';

export enum VideoImageMediaType {
  BANNER = 'banner',
  THUMBNAIL = 'thumbnail',
  THUMBNAIL_HALF = 'thumbnail_half',
}

export type ImageMediaModelProps = {
  imageMediaId: string;
  name: string;
  location: string;
  videoId: string;
  videoImageMediaType: VideoImageMediaType;
};

@Table({
  tableName: 'image_medias',
  timestamps: false,
  indexes: [{ fields: ['video_id', 'video_image_media_type'], unique: true }],
})
export class ImageMediaModel extends Model<ImageMediaModelProps> {
  @PrimaryKey
  @Column({
    field: 'image_media_id',
    type: DataType.UUID,
    defaultValue: () => new Uuid().id,
  })
  declare imageMediaId: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare name: string;

  @Column({ allowNull: false, type: DataType.STRING(255) })
  declare location: string;

  @ForeignKey(() => VideoModel)
  @Column({
    field: 'video_id',
    allowNull: false,
    type: DataType.UUID,
  })
  declare videoId: string;

  @Column({
    field: 'video_image_media_type',
    allowNull: false,
    type: DataType.STRING(20),
  })
  declare videoImageMediaType: VideoImageMediaType;
}
