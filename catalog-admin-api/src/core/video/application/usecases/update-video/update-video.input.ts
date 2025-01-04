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
    props.title && (this.title = props.title);
    props.description && (this.description = props.description);
    props.releaseYear && (this.releaseYear = props.releaseYear);
    props.duration && (this.duration = props.duration);
    props.rating && (this.rating = props.rating);
    props.isNewRelease !== null &&
      props.isNewRelease !== undefined &&
      (this.isNewRelease = props.isNewRelease);
    props.categoryIds &&
      props.categoryIds.length > 0 &&
      (this.categoryIds = props.categoryIds);
    props.genreIds &&
      props.genreIds.length > 0 &&
      (this.genreIds = props.genreIds);
    props.castMemberIds &&
      props.castMemberIds.length > 0 &&
      (this.castMemberIds = props.castMemberIds);
  }
}

export class ValidateUpdateVideoInput {
  static validate(input: UpdateVideoInput) {
    return validateSync(input);
  }
}
