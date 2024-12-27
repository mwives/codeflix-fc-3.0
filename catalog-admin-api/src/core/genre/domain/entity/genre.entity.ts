import { CategoryId } from '@core/category/domain/entity/category.entity';
import { AggregateRoot } from '@core/shared/domain/entity/aggregate-root';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import GenreValidatorFactory from '../validator/genre.validator';
import { GenreFakeBuilder } from './genre-fake.builder';

export type GenreProps = {
  genreId?: GenreId;
  name: string;
  categoryIds: Map<string, CategoryId>;
  isActive?: boolean;
  createdAt?: Date;
};

export type GenreCreateProps = {
  name: string;
  categoryIds: CategoryId[];
  isActive?: boolean;
};

export class GenreId extends Uuid {}

export class Genre extends AggregateRoot {
  genreId: GenreId;
  name: string;
  categoryIds: Map<string, CategoryId>;
  isActive: boolean;
  createdAt: Date;

  constructor(props: GenreProps) {
    super();
    this.genreId = props.genreId ?? new GenreId();
    this.name = props.name;
    this.categoryIds = props.categoryIds;
    this.isActive = props.isActive ?? true;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: GenreCreateProps) {
    const genre = new Genre({
      ...props,
      categoryIds: new Map(
        props.categoryIds.map((categoryId) => [categoryId.id, categoryId]),
      ),
    });
    genre.validate();
    return genre;
  }

  changeName(name: string) {
    this.name = name;
    this.validate(['name']);
  }

  addCategoryId(categoryId: CategoryId) {
    this.categoryIds.set(categoryId.id, categoryId);
  }

  removeCategoryId(categoryId: CategoryId) {
    this.categoryIds.delete(categoryId.id);
  }

  syncCategoryIds(categoryIds: CategoryId[]) {
    if (!categoryIds.length) {
      throw new Error('CategoryIds cannot be empty');
    }

    this.categoryIds = new Map(
      categoryIds.map((categoryId) => [categoryId.id, categoryId]),
    );
  }

  activate() {
    this.isActive = true;
  }

  deactivate() {
    this.isActive = false;
  }

  validate(fields?: string[]) {
    const validator = GenreValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake() {
    return GenreFakeBuilder;
  }

  get entityId() {
    return this.genreId;
  }

  toJSON() {
    return {
      genreId: this.genreId.id,
      name: this.name,
      categoryIds: Array.from(this.categoryIds.values()).map(
        (categoryId) => categoryId.id,
      ),
      isActive: this.isActive,
      createdAt: this.createdAt,
    };
  }
}
