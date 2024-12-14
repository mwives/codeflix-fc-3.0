import {
  CastMemberSearchParams,
  CastMemberSearchResult,
  ICastMemberRepository,
} from '@core/cast-member/domain/repository/cast-member.repository';
import {
  PaginationOutput,
  PaginationOutputMapper,
} from '@core/shared/application/pagination-output';
import { IUseCase } from '@core/shared/application/use-case.interface';
import {
  CastMemberOutput,
  CastMemberOutputMapper,
} from '../@shared/cast-member-output';
import { ListCastMembersInput } from './list-cast-members.input';

export class ListCastMembersUseCase
  implements IUseCase<ListCastMembersInput, ListCastMembersOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: ListCastMembersInput): Promise<ListCastMembersOutput> {
    const params = CastMemberSearchParams.create(input);
    const searchResult = await this.castMemberRepository.search(params);
    return this.toOutput(searchResult);
  }

  private toOutput(
    searchResult: CastMemberSearchResult,
  ): ListCastMembersOutput {
    const { items: _items } = searchResult;
    const items = _items.map((i) => {
      return CastMemberOutputMapper.toDTO(i);
    });
    return PaginationOutputMapper.toOutput(items, searchResult);
  }
}

export type ListCastMembersOutput = PaginationOutput<CastMemberOutput>;
