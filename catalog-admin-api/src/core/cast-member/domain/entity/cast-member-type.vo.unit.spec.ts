import {
  CastMemberType,
  CastMemberTypes,
  InvalidCastMemberTypeError,
} from './cast-member-type.vo';

describe('CastMemberType', () => {
  describe('create', () => {
    it('should create a valid CastMemberType', () => {
      const type = CastMemberTypes.ACTOR;
      const castMemberType = CastMemberType.create(type);
      expect(castMemberType).toBeInstanceOf(CastMemberType);
    });

    it('should throw an error if the type is invalid', () => {
      const type = 3;
      expect(() => CastMemberType.create(type as CastMemberTypes)).toThrow(
        InvalidCastMemberTypeError,
      );
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
