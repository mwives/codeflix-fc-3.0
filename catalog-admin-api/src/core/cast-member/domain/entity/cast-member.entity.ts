import { AggregateRoot } from '@core/shared/domain/entity/aggregate-root';
import { ValueObject } from '@core/shared/domain/value-object/value-object';
import { Uuid } from '@core/shared/domain/value-object/value-objects/uuid.vo';
import { CastMemberValidatorFactory } from '../validator/cast-member.validator';
import { CastMemberFakeBuilder } from './cast-member-fake.builder';
import { CastMemberType } from './cast-member-type.vo';

export type CastMemberProps = {
  castMemberId?: CastMemberId;
  name: string;
  type: CastMemberType;
  createdAt?: Date;
};

export type CastMemberCreateProps = {
  name: string;
  type: CastMemberType;
};

export class CastMemberId extends Uuid {}

export class CastMember extends AggregateRoot {
  castMemberId: CastMemberId;
  name: string;
  type: CastMemberType;
  createdAt: Date;

  constructor(props: CastMemberProps, _id?: CastMemberId) {
    super();
    this.castMemberId = props.castMemberId ?? new CastMemberId();
    this.name = props.name;
    this.type = props.type;
    this.createdAt = props.createdAt ?? new Date();
  }

  static create(props: CastMemberCreateProps): CastMember {
    const castMember = new CastMember(props);
    castMember.validate(['name']);
    return castMember;
  }

  changeName(name: string): void {
    this.name = name;
    this.validate(['name']);
  }

  changeType(type: CastMemberType): void {
    this.type = type;
  }

  validate(fields?: string[]): boolean {
    const validator = CastMemberValidatorFactory.create();
    return validator.validate(this.notification, this, fields);
  }

  static fake(): typeof CastMemberFakeBuilder {
    return CastMemberFakeBuilder;
  }

  get entityId(): ValueObject {
    return this.castMemberId;
  }

  toJSON() {
    return {
      castMemberId: this.castMemberId.id,
      name: this.name,
      type: this.type.type,
      createdAt: this.createdAt,
    };
  }
}
