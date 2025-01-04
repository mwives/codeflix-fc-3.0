import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { ICastMemberRepository } from '@core/cast-member/domain/repository/cast-member.repository';
import { Either } from '@core/shared/domain/either';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';

export class CastMembersStorageValidator {
  constructor(private castMemberRepo: ICastMemberRepository) {}

  async validate(
    cast_members_id: string[],
  ): Promise<Either<CastMemberId[], NotFoundError[]>> {
    const castMembersId = cast_members_id.map((v) => new CastMemberId(v));

    const existsResult = await this.castMemberRepo.existsById(castMembersId);
    return existsResult.nonExistent.length > 0
      ? Either.fail(
          existsResult.nonExistent.map(
            (c) => new NotFoundError(c.id, CastMember),
          ),
        )
      : Either.ok(castMembersId);
  }
}
