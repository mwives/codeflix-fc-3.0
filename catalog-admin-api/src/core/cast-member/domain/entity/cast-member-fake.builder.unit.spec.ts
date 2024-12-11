import { Chance } from 'chance';
import { CastMemberFakeBuilder } from './cast-member-fake.builder';
import { CastMemberId } from './cast-member.entity';
import { CastMemberType, CastMemberTypes } from './cast-member-type.vo';

describe('CastMemberFakerBuilder', () => {
  describe('castMemberId prop', () => {
    const faker = CastMemberFakeBuilder.anActor();

    it('should be undefined', () => {
      expect(faker['_castMemberId']).toBeUndefined();
    });

    it('should throw error when any with methods has called', () => {
      expect(() => faker.castMemberId).toThrow(
        new Error(
          "Property castMemberId not have a factory, use 'with' methods",
        ),
      );
    });

    it('withCastMemberId', () => {
      const castMemberId = new CastMemberId();
      const $this = faker.withCastMemberId(castMemberId);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_castMemberId']).toBe(castMemberId);

      faker.withCastMemberId(() => castMemberId);
      //@ts-expect-error _castMemberId is a callable
      expect(faker['_castMemberId']()).toBe(castMemberId);

      expect(faker.castMemberId).toBe(castMemberId);
    });

    it('should pass index to castMemberId factory', () => {
      let mockFactory = jest.fn(() => new CastMemberId());
      faker.withCastMemberId(mockFactory);
      faker.build();
      expect(mockFactory).toHaveBeenCalledTimes(1);

      const castMemberId = new CastMemberId();
      mockFactory = jest.fn(() => castMemberId);
      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withCastMemberId(mockFactory);
      fakerMany.build();

      expect(mockFactory).toHaveBeenCalledTimes(2);
      expect(fakerMany.build()[0].castMemberId).toBe(castMemberId);
      expect(fakerMany.build()[1].castMemberId).toBe(castMemberId);
    });
  });

  describe('name prop', () => {
    const faker = CastMemberFakeBuilder.anActor();
    it('should be a function', () => {
      expect(typeof faker['_name']).toBe('function');
    });

    it('should call the word method', () => {
      const chance = Chance();
      const spyWordMethod = jest.spyOn(chance, 'word');
      faker['chance'] = chance;
      faker.build();

      expect(spyWordMethod).toHaveBeenCalled();
    });

    it('withName', () => {
      const $this = faker.withName('test name');
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_name']).toBe('test name');

      faker.withName(() => 'test name');
      //@ts-expect-error name is callable
      expect(faker['_name']()).toBe('test name');

      expect(faker.name).toBe('test name');
    });

    it('should pass index to name factory', () => {
      faker.withName((index) => `test name ${index}`);
      const castMember = faker.build();
      expect(castMember.name).toBe(`test name 0`);

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withName((index) => `test name ${index}`);
      const castMembers = fakerMany.build();

      expect(castMembers[0].name).toBe(`test name 0`);
      expect(castMembers[1].name).toBe(`test name 1`);
    });

    it('invalid too long case', () => {
      const $this = faker.withInvalidNameTooLong();
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_name'].length).toBe(256);

      const tooLong = 'a'.repeat(256);
      faker.withInvalidNameTooLong(tooLong);
      expect(faker['_name'].length).toBe(256);
      expect(faker['_name']).toBe(tooLong);
    });
  });

  describe('type prop', () => {
    const faker = CastMemberFakeBuilder.anActor();

    it('should be a CastMemberType', () => {
      expect(faker['_type']).toBeInstanceOf(CastMemberType);
    });

    it('withType', () => {
      const director = CastMemberType.createADirector();
      const $this = faker.withType(director);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker.type).toEqual(director);

      const actor = CastMemberType.createAnActor();
      faker.withType(() => actor);
      //@ts-expect-error name is callable
      expect(faker['_type']()).toEqual(actor);
      expect(faker.type).toEqual(actor);
    });
  });

  describe('createdAt prop', () => {
    const faker = CastMemberFakeBuilder.anActor();

    it('should throw error when any with methods has called', () => {
      const fakerCastMember = CastMemberFakeBuilder.anActor();
      expect(() => fakerCastMember.createdAt).toThrow(
        new Error("Property createdAt not have a factory, use 'with' methods"),
      );
    });

    it('should be undefined', () => {
      expect(faker['_createdAt']).toBeUndefined();
    });

    it('withCreatedAt', () => {
      const date = new Date();
      const $this = faker.withCreatedAt(date);
      expect($this).toBeInstanceOf(CastMemberFakeBuilder);
      expect(faker['_createdAt']).toBe(date);

      faker.withCreatedAt(() => date);
      //@ts-expect-error _createdAt is a callable
      expect(faker['_createdAt']()).toBe(date);
      expect(faker.createdAt).toBe(date);
    });

    it('should pass index to createdAt factory', () => {
      const date = new Date();
      faker.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const castMember = faker.build();
      expect(castMember.createdAt.getTime()).toBe(date.getTime() + 2);

      const fakerMany = CastMemberFakeBuilder.theCastMembers(2);
      fakerMany.withCreatedAt((index) => new Date(date.getTime() + index + 2));
      const castMembers = fakerMany.build();

      expect(castMembers[0].createdAt.getTime()).toBe(date.getTime() + 2);
      expect(castMembers[1].createdAt.getTime()).toBe(date.getTime() + 3);
    });
  });

  it('should create a cast member', () => {
    const faker = CastMemberFakeBuilder.anActor();
    let castMember = faker.build();

    expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
    expect(typeof castMember.name === 'string').toBeTruthy();
    expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
    expect(castMember.createdAt).toBeInstanceOf(Date);

    const createdAt = new Date();
    const castMemberId = new CastMemberId();
    castMember = faker
      .withCastMemberId(castMemberId)
      .withName('name test')
      .withType(CastMemberType.createADirector())
      .withCreatedAt(createdAt)
      .build();

    expect(castMember.castMemberId.id).toBe(castMemberId.id);
    expect(castMember.name).toBe('name test');
    expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
    expect(castMember.createdAt).toBe(createdAt);
  });

  it('should create many categories', () => {
    const faker = CastMemberFakeBuilder.theCastMembers(2);
    let castMembers = faker.build();

    castMembers.forEach((castMember) => {
      expect(castMember.castMemberId).toBeInstanceOf(CastMemberId);
      expect(typeof castMember.name === 'string').toBeTruthy();
      expect(castMember.type.type).toBe(CastMemberTypes.ACTOR);
      expect(castMember.createdAt).toBeInstanceOf(Date);
    });

    const createdAt = new Date();
    const castMemberId = new CastMemberId();
    castMembers = faker
      .withCastMemberId(castMemberId)
      .withName('name test')
      .withType(CastMemberType.createADirector())
      .withCreatedAt(createdAt)
      .build();

    castMembers.forEach((castMember) => {
      expect(castMember.castMemberId.id).toBe(castMemberId.id);
      expect(castMember.name).toBe('name test');
      expect(castMember.type.type).toBe(CastMemberTypes.DIRECTOR);
      expect(castMember.createdAt).toBe(createdAt);
    });
  });
});
