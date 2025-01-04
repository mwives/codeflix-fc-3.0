import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { CastMemberInMemoryRepository } from '@core/cast-member/infra/db/in-memory/cast-member-in-memory.repository';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { CastMembersStorageValidator } from './cast-member-storage.validator';

describe('CastMembersStorageValidator', () => {
  let castMemberRepo: CastMemberInMemoryRepository;
  let validator: CastMembersStorageValidator;

  beforeEach(() => {
    castMemberRepo = new CastMemberInMemoryRepository();
    validator = new CastMembersStorageValidator(castMemberRepo);
  });

  it('should return many not found error when cast members id is not exists in storage', async () => {
    const castMemberId1 = new CastMemberId();
    const castMemberId2 = new CastMemberId();

    const spyExistsById = jest.spyOn(castMemberRepo, 'existsById');

    let [castMembersId, errorsCastMembersId] = await validator.validate([
      castMemberId1.id,
      castMemberId2.id,
    ]);

    expect(castMembersId).toStrictEqual(null);
    expect(errorsCastMembersId).toStrictEqual([
      new NotFoundError(castMemberId1.id, CastMember),
      new NotFoundError(castMemberId2.id, CastMember),
    ]);

    expect(spyExistsById).toHaveBeenCalledTimes(1);

    const castMember1 = CastMember.fake().aDirector().build();
    await castMemberRepo.insert(castMember1);

    [castMembersId, errorsCastMembersId] = await validator.validate([
      castMember1.castMemberId.id,
      castMemberId2.id,
    ]);

    expect(castMembersId).toStrictEqual(null);
    expect(errorsCastMembersId).toStrictEqual([
      new NotFoundError(castMemberId2.id, CastMember),
    ]);
    expect(spyExistsById).toHaveBeenCalledTimes(2);
  });

  it('should return a list of categories id', async () => {
    const castMember1 = CastMember.fake().aDirector().build();
    const castMember2 = CastMember.fake().aDirector().build();

    await castMemberRepo.bulkInsert([castMember1, castMember2]);

    const [castMembersId, errorsCastMembersId] = await validator.validate([
      castMember1.castMemberId.id,
      castMember2.castMemberId.id,
    ]);

    expect(castMembersId).toHaveLength(2);
    expect(errorsCastMembersId).toStrictEqual(null);
    expect(castMembersId[0]).toBeValueObject(castMember1.castMemberId);
    expect(castMembersId[1]).toBeValueObject(castMember2.castMemberId);
  });
});
