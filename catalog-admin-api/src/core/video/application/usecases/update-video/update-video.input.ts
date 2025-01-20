import { RatingValues } from '@core/video/domain/entity/vo/rating.vo';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsOptional,
  IsString,
  IsUUID,
  Min,
  validateSync,
} from 'class-validator';

export type UpdateVideoInputConstructorProps = {
  id: string;
  title?: string;
  description?: string;
  releaseYear?: number;
  duration?: number;
  rating?: RatingValues;
  isNewRelease?: boolean;
  categoryIds?: string[];
  genreIds?: string[];
  castMemberIds?: string[];
};

export class UpdateVideoInput {
  @IsString()
  @IsNotEmpty()
  id: string;

  @IsString()
  @IsOptional()
  title?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @Min(1900)
  @IsInt()
  @IsOptional()
  releaseYear: number;

  @Min(1)
  @IsInt()
  @IsOptional()
  duration: number;

  @IsString()
  @IsOptional()
  rating: RatingValues;

  @IsBoolean()
  @IsOptional()
  isNewRelease: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  categoryIds?: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  genreIds?: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsOptional()
  castMemberIds?: string[];

  constructor(props?: UpdateVideoInputConstructorProps) {
    if (!props) return;
    this.id = props.id;
    if (props.title) this.title = props.title;
    if (props.description) this.description = props.description;
    if (props.releaseYear) this.releaseYear = props.releaseYear;
    if (props.duration) this.duration = props.duration;
    if (props.rating) this.rating = props.rating;
    if (props.isNewRelease !== null && props.isNewRelease !== undefined)
      this.isNewRelease = props.isNewRelease;
    if (props.categoryIds && props.categoryIds.length > 0)
      this.categoryIds = props.categoryIds;
    if (props.genreIds && props.genreIds.length > 0)
      this.genreIds = props.genreIds;
    if (props.castMemberIds && props.castMemberIds.length > 0)
      this.castMemberIds = props.castMemberIds;
  }
}

export class ValidateUpdateVideoInput {
  static validate(input: UpdateVideoInput) {
    return validateSync(input);
  }
}
