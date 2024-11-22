import { Entity } from '../../../domain/entity/entity';
import { NotFoundError } from '../../../domain/error/not-found.error';
import {
  IRepository,
  ISearchableRepository,
} from '../../../domain/repository/repository.interface';
import {
  SearchParams,
  SortDirection,
} from '../../../domain/repository/search-params';
import { SearchResult } from '../../../domain/repository/search-result';
import { ValueObject } from '../../../domain/value-object/value-object';

export abstract class InMemoryRepository<
  E extends Entity,
  ID extends ValueObject,
> implements IRepository<E, ID>
{
  items: E[] = [];

  async insert(entity: E): Promise<void> {
    this.items.push(entity);
  }

  async bulkInsert(entities: E[]): Promise<void> {
    this.items.push(...entities);
  }

  async update(entity: E): Promise<void> {
    const index = this.items.findIndex((item) =>
      item.entityId.equals(entity.entityId),
    );
    if (index === -1) {
      throw new NotFoundError(entity.entityId, this.getEntity());
    }
    this.items[index] = entity;
  }

  async delete(id: ID): Promise<void> {
    const index = this.items.findIndex((item) => item.entityId.equals(id));
    if (index === -1) {
      throw new NotFoundError(id, this.getEntity());
    }
    this.items.splice(index, 1);
  }

  async findById(id: ID): Promise<E> {
    return this._get(id);
  }

  protected async _get(id: ID): Promise<E> {
    const entity = this.items.find((item) => item.entityId.equals(id));
    return typeof entity === 'undefined' ? null : entity;
  }

  async findAll(): Promise<E[]> {
    return this.items;
  }

  abstract getEntity(): new (...args: any[]) => E;
}

export abstract class InMemorySearchableRepository<
    E extends Entity,
    ID extends ValueObject,
    Filter = string,
  >
  extends InMemoryRepository<E, ID>
  implements ISearchableRepository<E, ID, Filter>
{
  sortableFields: string[];

  async search(props: SearchParams<Filter>): Promise<SearchResult<E>> {
    const filteredItems = await this.applyFilter(this.items, props.filter);
    const sortedItems = this.applySort(
      filteredItems,
      props.sort,
      props.sortDir,
    );
    const paginatedItems = this.applyPaginate(
      sortedItems,
      props.page,
      props.perPage,
    );

    return new SearchResult({
      items: paginatedItems,
      total: filteredItems.length,
      currentPage: props.page,
      perPage: props.perPage,
    });
  }

  protected abstract applyFilter(
    items: E[],
    filter: Filter | null,
  ): Promise<E[]>;

  protected applySort(
    items: E[],
    sort: string | null,
    sortDir: SortDirection | null,
    customGetter?: (sort: string, item: E) => any,
  ) {
    if (!sort || !this.sortableFields.includes(sort)) {
      return items;
    }

    return [...items].sort((a, b) => {
      const aValue = customGetter ? customGetter(sort, a) : a[sort];
      const bValue = customGetter ? customGetter(sort, b) : b[sort];
      if (aValue < bValue) {
        return sortDir === 'asc' ? -1 : 1;
      }

      if (aValue > bValue) {
        return sortDir === 'asc' ? 1 : -1;
      }

      return 0;
    });
  }

  protected applyPaginate(
    items: E[],
    page: SearchParams['page'],
    perPage: SearchParams['perPage'],
  ): E[] {
    const start = (page - 1) * perPage;
    const end = start + perPage;
    return items.slice(start, end);
  }
}
