import {
  CastMember,
  CastMemberId,
} from '@core/cast-member/domain/entity/cast-member.entity';
import {
  CastMemberSearchParams,
  CastMemberSearchResult,
  ICastMemberRepository,
} from '@core/cast-member/domain/repository/cast-member.repository';
import { InvalidArgumentError } from '@core/shared/domain/error/invalid-argument.error';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { literal, Op } from 'sequelize';
import { CastMemberModelMapper } from './cast-member-model-mapper';
import { CastMemberModel } from './cast-member.model';

export class CastMemberSequelizeRepository implements ICastMemberRepository {
  sortableFields: string[] = ['name', 'createdAt'];
  orderBy = {
    mysql: {
      name: (sortDir: SortDirection) => literal(`binary name ${sortDir}`),
    },
  };
  constructor(private castMemberModel: typeof CastMemberModel) {}

  async insert(entity: CastMember): Promise<void> {
    await this.castMemberModel.create(entity.toJSON());
  }

  async bulkInsert(entities: CastMember[]): Promise<void> {
    await this.castMemberModel.bulkCreate(entities.map((e) => e.toJSON()));
  }

  async findById(id: CastMemberId): Promise<CastMember> {
    const model = await this._get(id.id);
    return model ? CastMemberModelMapper.toEntity(model) : null;
  }

  async findAll(): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll();
    return models.map((m) => CastMemberModelMapper.toEntity(m));
  }

  async findByIds(ids: CastMemberId[]): Promise<CastMember[]> {
    const models = await this.castMemberModel.findAll({
      where: {
        castMemberId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    return models.map((m) => CastMemberModelMapper.toEntity(m));
  }

  async existsById(
    ids: CastMemberId[],
  ): Promise<{ exists: CastMemberId[]; notExists: CastMemberId[] }> {
    if (!ids.length) {
      throw new InvalidArgumentError(
        'ids must be an array with at least one element',
      );
    }

    const existsCastMemberModels = await this.castMemberModel.findAll({
      attributes: ['castMemberId'],
      where: {
        castMemberId: {
          [Op.in]: ids.map((id) => id.id),
        },
      },
    });
    const existsCastMemberIds = existsCastMemberModels.map(
      (m) => new CastMemberId(m.castMemberId),
    );
    const notExistsCastMemberIds = ids.filter(
      (id) => !existsCastMemberIds.some((e) => e.equals(id)),
    );
    return {
      exists: existsCastMemberIds,
      notExists: notExistsCastMemberIds,
    };
  }

  async update(entity: CastMember): Promise<void> {
    const castMemberId = entity.castMemberId.id;
    const castMember = await this._get(castMemberId);

    if (!castMember) {
      throw new NotFoundError(castMemberId, this.getEntity());
    }

    const model = CastMemberModelMapper.toModel(entity);
    await this.castMemberModel.update(model.toJSON(), {
      where: { castMemberId },
    });
  }
  async delete(castMemberId: CastMemberId): Promise<void> {
    const castMember = await this._get(castMemberId.id);

    if (!castMember) {
      throw new NotFoundError(castMemberId.id, this.getEntity());
    }

    await this.castMemberModel.destroy({
      where: { castMemberId: castMemberId.id },
    });
  }

  private async _get(id: string): Promise<CastMemberModel> {
    return this.castMemberModel.findByPk(id);
  }

  async search(props: CastMemberSearchParams): Promise<CastMemberSearchResult> {
    const offset = (props.page - 1) * props.perPage;
    const limit = props.perPage;

    const where = {};

    if (props.filter && (props.filter.name || props.filter.type)) {
      if (props.filter.name) {
        where['name'] = { [Op.like]: `%${props.filter.name}%` };
      }

      if (props.filter.type) {
        where['type'] = props.filter.type.type;
      }
    }

    const { rows: models, count } = await this.castMemberModel.findAndCountAll({
      ...(props.filter && {
        where,
      }),
      ...(props.sort && this.sortableFields.includes(props.sort)
        ? { order: this.formatSort(props.sort, props.sortDir) }
        : { order: [['createdAt', 'DESC']] }),
      offset,
      limit,
    });
    return new CastMemberSearchResult({
      items: models.map((m) => CastMemberModelMapper.toEntity(m)),
      currentPage: props.page,
      perPage: props.perPage,
      total: count,
    });
  }

  private formatSort(sort: string, sortDir: SortDirection) {
    const dialect = this.castMemberModel.sequelize.getDialect() as 'mysql';
    if (this.orderBy[dialect] && this.orderBy[dialect][sort]) {
      return this.orderBy[dialect][sort](sortDir);
    }
    return [[sort, sortDir]];
  }

  getEntity(): new (...args: any[]) => CastMember {
    return CastMember;
  }
}
