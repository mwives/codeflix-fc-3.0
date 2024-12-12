import { ISearchableRepository } from '@core/shared/domain/repository/repository.interface';
import {
  SearchParams as DefaultSearchParams,
  SearchParamsConstructorProps,
} from '@core/shared/domain/repository/search-params';
import { SearchResult as DefaultSearchResult } from '@core/shared/domain/repository/search-result';
import { SearchValidationError } from '@core/shared/domain/validators/validation.error';
import { CastMemberType, CastMemberTypes } from '../entity/cast-member-type.vo';
import { CastMember, CastMemberId } from '../entity/cast-member.entity';

export type CastMemberFilter = {
  name?: string | null;
  type?: CastMemberType | null;
};

export class CastMemberSearchParams extends DefaultSearchParams<CastMemberFilter> {
  private constructor(
    props: SearchParamsConstructorProps<CastMemberFilter> = {},
  ) {
    super(props);
  }

  static create(
    props: Omit<SearchParamsConstructorProps<CastMemberFilter>, 'filter'> & {
      filter?: {
        name?: string | null;
        type?: CastMemberTypes | null;
      };
    } = {},
  ) {
    try {
      const type = props.filter?.type
        ? CastMemberType.create(props.filter?.type)
        : null;
      return new CastMemberSearchParams({
        ...props,
        filter: {
          name: props.filter?.name,
          type,
        },
      });
    } catch (err) {
      const error = new SearchValidationError([{ type: [err.message] }]);
      throw error;
    }
  }

  get filter(): CastMemberFilter | null {
    return this._filter;
  }

  protected set filter(value: CastMemberFilter | null) {
    const _value =
      !value || (value as unknown) === '' || typeof value !== 'object'
        ? null
        : value;

    const filter = {
      ...(_value && _value.name && { name: `${_value?.name}` }),
      ...(_value && _value.type && { type: _value.type }),
    };

    this._filter = Object.keys(filter).length === 0 ? null : filter;
  }
}

export class CastMemberSearchResult extends DefaultSearchResult<CastMember> {}

export interface ICastMemberRepository
  extends ISearchableRepository<
    CastMember,
    CastMemberId,
    CastMemberFilter,
    CastMemberSearchParams,
    CastMemberSearchResult
  > {}
