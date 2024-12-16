import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from './cast-member-type.vo';

describe('CastMemberType', () => {
  describe('create', () => {
    it('should create a valid CastMemberType', () => {
      const type = CastMemberTypes.ACTOR;
      const [castMemberType, error] = CastMemberType.create(type);
      expect(error).toBeNull();
      expect(castMemberType).toBeInstanceOf(CastMemberType);
    });

    it('should throw an error if the type is invalid', () => {
      const type = 3;
      const [castMemberType, error] = CastMemberType.create(type as any);
      expect(castMemberType).toBeNull();
      expect(error).toBeInstanceOf(InvalidCastMemberTypeError);
    });
  });

  describe('createAnActor', () => {
    it('should create an actor CastMemberType', () => {
      const castMemberType = CastMemberType.createAnActor();
      expect(castMemberType.type).toBe(CastMemberTypes.ACTOR);
    });
  });

  describe('createADirector', () => {
    it('should create a director CastMemberType', () => {
      const castMemberType = CastMemberType.createADirector();
      expect(castMemberType.type).toBe(CastMemberTypes.DIRECTOR);
    });
  });
});
