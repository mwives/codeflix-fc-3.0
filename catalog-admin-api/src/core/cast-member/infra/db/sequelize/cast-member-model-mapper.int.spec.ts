import { CastMemberType } from '@core/cast-member/domain/entity/cast-member-type.vo';
import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import { LoadEntityError } from '@core/shared/domain/validators/validation.error';
import { InvalidUuidError } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModelMapper } from './cast-member-model-mapper';
import { CastMemberModel } from './cast-member.model';

describe('CastMemberModelMapper', () => {
  setupSequelize({ models: [CastMemberModel] });

  describe('toModel', () => {
    it('should return a CastMemberModel instance', () => {
      const castMember = new CastMember({
        castMemberId: new CastMemberId(),
        name: 'any_name',
        type: CastMemberType.createADirector(),
        createdAt: new Date(),
      });

      const result = CastMemberModelMapper.toModel(castMember);

      expect(result).toBeInstanceOf(CastMemberModel);
      expect(result).toMatchObject({
        castMemberId: castMember.castMemberId.id,
        name: castMember.name,
        type: castMember.type.type,
        createdAt: castMember.createdAt,
      });
    });
  });

  describe('toEntity', () => {
    it('should return a CastMember instance', () => {
      const castMemberModel = CastMemberModel.build({
        castMemberId: new CastMemberId().id,
        name: 'any_name',
        type: CastMemberType.createADirector().type,
        createdAt: new Date(),
      });

      const result = CastMemberModelMapper.toEntity(castMemberModel);

      expect(result).toBeInstanceOf(CastMember);
      expect(result).toMatchObject({
        castMemberId: new CastMemberId(castMemberModel.castMemberId),
        name: castMemberModel.name,
        type: CastMemberType.create(castMemberModel.type).ok,
        createdAt: castMemberModel.createdAt,
      });
    });

    it('should throw an InvalidUuidError if the entity has an invalid uuid', () => {
      const castMemberModel = CastMemberModel.build({
        castMemberId: 'invalid_uuid',
        name: 'any_name',
        type: 3,
        createdAt: new Date(),
      });

      expect(() => CastMemberModelMapper.toEntity(castMemberModel)).toThrow(
        InvalidUuidError,
      );
    });

    it('should throw an InvalidCastMemberTypeError if the entity has an invalid type', () => {
      const castMemberModel = CastMemberModel.build({
        castMemberId: new CastMemberId().id,
        name: 'any_name',
        type: 3,
        createdAt: new Date(),
      });

      expect(() => CastMemberModelMapper.toEntity(castMemberModel)).toThrow(
        LoadEntityError,
      );
    });
  });
});
