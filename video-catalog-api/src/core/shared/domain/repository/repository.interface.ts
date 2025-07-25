import { AggregateRoot } from '../aggregate-root';
import { ValueObject } from '../value-object';
import { ICriteria } from './criteria.interface';
import { SearchParams, SortDirection } from './search-params';
import { SearchResult } from './search-result';

export interface IRepository<E extends AggregateRoot, ID extends ValueObject> {
  sortableFields: string[];
  scopes: Map<string, ICriteria>;
  insert(entity: E): Promise<void>;
  bulkInsert(entities: E[]): Promise<void>;
  findById(id: ID): Promise<E | null>;
  findOneBy(filter: Partial<E>): Promise<E | null>;
  findBy(
    filter: Partial<E>,
    order?: {
      field: string;
      direction: SortDirection;
    },
  ): Promise<E[]>;
  findAll(): Promise<E[]>;
  findByIds(ids: ID[]): Promise<{ exists: E[]; not_exists: ID[] }>;
  existsById(ids: ID[]): Promise<{
    exists: ID[];
    not_exists: ID[];
  }>;
  update(entity: E): Promise<void>;
  delete(id: ID): Promise<void>;
  ignoreSoftDeleted(): this;
  clearScopes(): this;
  getEntity(): new (...args: any[]) => E;
}

export interface ISearchableRepository<
  A extends AggregateRoot,
  AggregateId extends ValueObject,
  Filter = string,
  SearchInput = SearchParams<Filter>,
  SearchOutput = SearchResult<A>,
> extends IRepository<A, AggregateId> {
  sortableFields: string[];
  search(props: SearchInput): Promise<SearchOutput>;
  searchByCriteria(
    criterias: ICriteria[],
    searchParams: SearchInput,
  ): Promise<SearchOutput>;
}
