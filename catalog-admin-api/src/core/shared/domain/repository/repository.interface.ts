import { Entity } from '../entity/entity';
import { ValueObject } from '../value-object/value-object';
import { SearchParams } from './search-params';
import { SearchResult } from './search-result';

export interface IRepository<E extends Entity, ID extends ValueObject> {
  insert(entity: E): Promise<void>;
  bulkInsert(entities: E[]): Promise<void>;
  update(entity: E): Promise<void>;
  delete(id: ID): Promise<void>;

  findById(id: ID): Promise<E | null>;
  findByIds(ids: ID[]): Promise<E[]>;
  findAll(): Promise<E[]>;
  existsById(ids: ID[]): Promise<{
    existent: ID[];
    nonExistent: ID[];
  }>;

  getEntity(): new (...args: any[]) => E;
}

export interface ISearchableRepository<
  E extends Entity,
  ID extends ValueObject,
  Filter = string,
  SearchInput = SearchParams<Filter>,
  SearchOutput = SearchResult<E>,
> extends IRepository<E, ID> {
  sortableFields: string[];
  search(props: SearchInput): Promise<SearchOutput>;
}
