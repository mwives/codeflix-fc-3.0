import { CastMemberOutput } from '@core/cast-member/application/@shared/cast-member-output';
import { ListCastMembersOutput } from '@core/cast-member/application/list-cast-members/list-cast-members.usecase';
import { CastMemberTypes } from '@core/cast-member/domain/entity/cast-member-type.vo';
import { Transform } from 'class-transformer';
import { CollectionPresenter } from '../shared-module/presenters/collection.presenter';

export class CastMemberPresenter {
  id: string;
  name: string;
  type: CastMemberTypes;
  @Transform(({ value }: { value: Date }) => {
    return value.toISOString();
  })
  createdAt: Date;

  constructor(output: CastMemberOutput) {
    this.id = output.id;
    this.name = output.name;
    this.type = output.type;
    this.createdAt = output.createdAt;
  }
}

export class CastMemberCollectionPresenter extends CollectionPresenter {
  data: CastMemberPresenter[];

  constructor(output: ListCastMembersOutput) {
    const { items, ...paginationProps } = output;
    super(paginationProps);
    this.data = items.map((item) => new CastMemberPresenter(item));
  }
}
