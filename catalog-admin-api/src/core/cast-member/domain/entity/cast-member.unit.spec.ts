import { CastMemberType, CastMemberTypes } from './cast-member-type.vo';
import { CastMember, CastMemberId } from './cast-member.entity';

describe('CastMember', () => {
  beforeEach(() => {
    CastMember.prototype.validate = jest
      .fn()
      .mockImplementation(CastMember.prototype.validate);
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      const castMember = new CastMember({
        name: 'any_cast_member',
        type: CastMemberType.createAnActor(),
      });

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('any_cast_member');
      expect(castMember.type).toBeInstanceOf(CastMemberType);
      expect(castMember.createdAt).toBeInstanceOf(Date);
    });

    it('should create instance with given values', () => {
      const now = new Date();
      const castMember = new CastMember({
        castMemberId: new CastMemberId('f47ac10b-58cc-4372-a567-0e02b2c3d479'),
        name: 'any_cast_member',
        type: CastMemberType.createADirector(),
        createdAt: now,
      });

      expect(castMember.castMemberId.id).toBe(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      );
      expect(castMember.name).toBe('any_cast_member');
      expect(castMember.type).toBeInstanceOf(CastMemberType);
      expect(castMember.createdAt).toBe(now);
    });
  });

  describe('create', () => {
    it('should create instance with given values', () => {
      const castMember = CastMember.create({
        name: 'any_cast_member',
        type: CastMemberType.createAnActor(),
      });

      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(castMember.name).toBe('any_cast_member');
      expect(castMember.type).toBeInstanceOf(CastMemberType);
      expect(castMember.createdAt).toBeInstanceOf(Date);
      expect(castMember.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(false);
    });

    it('should have validation errors for invalid values', () => {
      const castMember = CastMember.create({
        name: 't'.repeat(256),
        type: CastMemberType.createAnActor(),
      });

      expect(castMember.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(true);
    });
  });

  describe('changeName', () => {
    it('should change name', () => {
      const castMember = new CastMember({
        name: 'any_cast_member',
        type: CastMemberType.createAnActor(),
      });

      castMember.changeName('new_cast_member');

      expect(castMember.name).toBe('new_cast_member');
      expect(castMember.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(false);
    });

    it('should have validation errors for invalid values', () => {
      const castMember = new CastMember({
        name: 'any_cast_member',
        type: CastMemberType.createAnActor(),
      });

      castMember.changeName('t'.repeat(256));

      expect(castMember.validate).toHaveBeenCalledTimes(1);
      expect(castMember.notification.hasErrors()).toBe(true);
    });
  });

  describe('changeType', () => {
    it('should change type', () => {
      const castMember = new CastMember({
        name: 'any_cast_member',
        type: CastMemberType.createAnActor(),
      });

      castMember.changeType(CastMemberType.createADirector());

      expect(castMember.type).toBeInstanceOf(CastMemberType);
      expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
    });
  });

  describe('toJSON', () => {
    it('should return JSON', () => {
      const castMember = new CastMember({
        name: 'any_cast_member',
        type: CastMemberType.createAnActor(),
      });

      expect(castMember.toJSON()).toEqual({
        castMemberId: castMember.castMemberId.id,
        name: 'any_cast_member',
        type: CastMemberTypes.ACTOR,
        createdAt: castMember.createdAt,
      });
    });
  });
});
