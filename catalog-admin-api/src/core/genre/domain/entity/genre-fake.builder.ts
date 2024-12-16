import { Chance } from 'chance';
import { Genre, GenreId } from './genre.entity';
import { CategoryId } from '@core/category/domain/entity/category.entity';

type PropOrFactory<T> = T | ((index: number) => T);

export class GenreFakeBuilder<TBuild = any> {
  private _genreId: PropOrFactory<GenreId> | undefined = undefined;
  private _name: PropOrFactory<string> = (_index) => this.chance.word();
  private _categoryIds: PropOrFactory<CategoryId>[] = [];

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  private _isActive: PropOrFactory<boolean> = (_index) => true;
  // auto generated in entity
  private _createdAt: PropOrFactory<Date> | undefined = undefined;

  private countObjs;

  static aGenre() {
    return new GenreFakeBuilder<Genre>();
  }

  static theGenres(countObjs: number) {
    return new GenreFakeBuilder<Genre[]>(countObjs);
  }

  private chance: Chance.Chance;

  private constructor(countObjs: number = 1) {
    this.countObjs = countObjs;
    this.chance = Chance();
  }

  withGenreId(valueOrFactory: PropOrFactory<GenreId>) {
    this._genreId = valueOrFactory;
    return this;
  }

  withName(valueOrFactory: PropOrFactory<string>) {
    this._name = valueOrFactory;
    return this;
  }

  addCategoryId(valueOrFactory: PropOrFactory<CategoryId>) {
    this._categoryIds.push(valueOrFactory);
    return this;
  }

  activate() {
    this._isActive = true;
    return this;
  }

  deactivate() {
    this._isActive = false;
    return this;
  }

  withInvalidNameTooLong(value?: string) {
    this._name = value ?? this.chance.word({ length: 256 });
    return this;
  }

  withCreatedAt(valueOrFactory: PropOrFactory<Date>) {
    this._createdAt = valueOrFactory;
    return this;
  }

  build(): TBuild {
    const Genres = new Array(this.countObjs).fill(undefined).map((_, index) => {
      const categoryId = new CategoryId();
      const categoriesId = this._categoryIds.length
        ? this.callFactory(this._categoryIds, index)
        : [categoryId];

      const genre = new Genre({
        genreId: !this._genreId
          ? undefined
          : this.callFactory(this._genreId, index),
        name: this.callFactory(this._name, index),
        categoryIds: new Map(categoriesId.map((id) => [id.id, id])),
        isActive: this.callFactory(this._isActive, index),
        ...(this._createdAt && {
          createdAt: this.callFactory(this._createdAt, index),
        }),
      });
      genre.validate();
      return genre;
    });
    return this.countObjs === 1 ? (Genres[0] as TBuild) : (Genres as TBuild);
  }

  get genreId() {
    return this.getValue('genreId');
  }

  get name() {
    return this.getValue('name');
  }

  get categoryIds(): CategoryId[] {
    let categoryIds = this.getValue('categoryIds');

    if (!categoryIds.length) {
      categoryIds = [new CategoryId()];
    }
    return categoryIds;
  }

  get isActive() {
    return this.getValue('isActive');
  }

  get createdAt() {
    return this.getValue('createdAt');
  }

  private getValue(prop: any) {
    const optional = ['genreId', 'createdAt'];
    const privateProp = `_${prop}` as keyof this;
    if (!this[privateProp] && optional.includes(prop)) {
      throw new Error(
        `Property ${prop} not have a factory, use 'with' methods`,
      );
    }
    return this.callFactory(this[privateProp], 0);
  }

  private callFactory(factoryOrValue: PropOrFactory<any>, index: number) {
    if (typeof factoryOrValue === 'function') {
      return factoryOrValue(index);
    }

    if (factoryOrValue instanceof Array) {
      return factoryOrValue.map((value) => this.callFactory(value, index));
    }

    return factoryOrValue;
  }
}
