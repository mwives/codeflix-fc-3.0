import { RatingValues } from '@core/video/domain/entity/vo/rating.vo';
import {
  IsArray,
  IsBoolean,
  IsInt,
  IsNotEmpty,
  IsString,
  IsUUID,
  Min,
  validateSync,
} from 'class-validator';

export type CreateVideoInputConstructorProps = {
  title: string;
  description: string;
  releaseYear: number;
  duration: number;
  rating: RatingValues;
  isNewRelease: boolean;
  categoryIds: string[];
  genreIds: string[];
  castMemberIds: string[];
  isActive?: boolean;
};

export class CreateVideoInput {
  @IsString()
  @IsNotEmpty()
  title: string;

  @IsString()
  @IsNotEmpty()
  description: string;

  @Min(1900)
  @IsInt()
  @IsNotEmpty()
  releaseYear: number;

  @Min(1)
  @IsInt()
  @IsNotEmpty()
  duration: number;

  @IsString()
  @IsNotEmpty()
  rating: RatingValues;

  @IsBoolean()
  @IsNotEmpty()
  isNewRelease: boolean;

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  categoryIds: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  genreIds: string[];

  @IsUUID('4', { each: true })
  @IsArray()
  @IsNotEmpty()
  castMemberIds: string[];

  constructor(props?: CreateVideoInputConstructorProps) {
    if (!props) return;
    this.title = props.title;
    this.description = props.description;
    this.releaseYear = props.releaseYear;
    this.duration = props.duration;
    this.rating = props.rating;
    this.isNewRelease = props.isNewRelease;
    this.categoryIds = props.categoryIds;
    this.genreIds = props.genreIds;
    this.castMemberIds = props.castMemberIds;
  }
}

export class ValidateCreateVideoInput {
  static validate(input: CreateVideoInput) {
    return validateSync(input);
  }
}
