import { CastMemberId } from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { IUseCase } from '@core/shared/application/use-case.interface';

export type DeleteCastMemberOutput = void;

export class DeleteCastMemberUseCase
  implements IUseCase<DeleteCastMemberInput, DeleteCastMemberOutput>
{
  constructor(private castMemberRepository: ICastMemberRepository) {}

  async execute(input: DeleteCastMemberInput): Promise<DeleteCastMemberOutput> {
    const castMemberId = new CastMemberId(input.id);
    await this.castMemberRepository.delete(castMemberId);
  }
}

export type DeleteCastMemberInput = {
  id: string;
};
