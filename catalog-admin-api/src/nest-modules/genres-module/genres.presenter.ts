import {
  GenreCategoryOutput,
  GenreOutput,
} from '@core/genre/application/usecases/common/genre.output';
import { ListGenresOutput } from '@core/genre/application/usecases/list-genres/list-genres.usecase';
import { Transform, Type } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/presenters/collection.presenter';

export class GenreCategoryPresenter {
  id: string;
  name: string;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: GenreCategoryOutput) {
    this.id = output.id;
    this.name = output.name;
    this.createdAt = output.createdAt;
  }
}

export class GenrePresenter {
  id: string;
  name: string;
  categoryIds: string[];
  @Type(() => GenreCategoryPresenter)
  categories: GenreCategoryPresenter[];
  isActive: boolean;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: GenreOutput) {
    this.id = output.id;
    this.name = output.name;
    this.categoryIds = output.categoryIds;
    this.categories = output.categories.map((item) => {
      return new GenreCategoryPresenter(item);
    });
    this.isActive = output.isActive;
    this.createdAt = output.createdAt;
  }
}

export class GenreCollectionPresenter extends CollectionPresenter {
  @Type(() => GenrePresenter)
  data: GenrePresenter[];

  constructor(output: ListGenresOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new GenrePresenter(item));
  }
}
