import { CreateCastMemberOutput } from '@core/cast-member/application/create-cast-member/create-cast-member.usecase';
import { GetCastMemberOutput } from '@core/cast-member/application/get-cast-member/get-cast-member.usecase';
import { ListCastMembersOutput } from '@core/cast-member/application/list-cast-members/list-cast-members.usecase';
import { UpdateCastMemberOutput } from '@core/cast-member/application/update-cast-member/update-cast-member.usecase';
import { CastMemberTypes } from '@core/cast-member/domain/entity/cast-member-type.vo';
import { SortDirection } from '@core/shared/domain/repository/search-params';
import { CastMembersController } from './cast-members.controller';
import {
  CastMemberCollectionPresenter,
  CastMemberPresenter,
} from '../cast-members.presenter';
import { CreateCastMemberDto } from '../dto/create-cast-member.dto';
import { UpdateCastMemberDto } from '../dto/update-cast-member.dto';

describe('CastMembersController Unit Tests', () => {
  let controller: CastMembersController;

  beforeEach(async () => {
    controller = new CastMembersController();
  });

  describe('create', () => {
    it('should create a cast member', async () => {
      const output: CreateCastMemberOutput = {
        id: '9366b7dc-2d71-4799-b91c-c64adb205104',
        name: 'Member',
        type: CastMemberTypes.ACTOR,
        createdAt: new Date(),
      };

      const mockCreateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      //@ts-expect-error defined part
      controller['createCastMemberUseCase'] = mockCreateUseCase;

      const input: CreateCastMemberDto = {
        name: 'Member',
        type: CastMemberTypes.ACTOR,
      };

      const presenter = await controller.create(input);

      expect(mockCreateUseCase.execute).toHaveBeenCalledWith(input);
      expect(presenter).toBeInstanceOf(CastMemberPresenter);
      expect(presenter).toStrictEqual(new CastMemberPresenter(output));
    });
  });

  describe('update', () => {
    it('should update a cast member', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';
      const output: UpdateCastMemberOutput = {
        id,
        name: 'Member',
        type: CastMemberTypes.ACTOR,
        createdAt: new Date(),
      };

      const mockUpdateUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      //@ts-expect-error defined part of methods
      controller['updateCastMemberUseCase'] = mockUpdateUseCase;

      const input: UpdateCastMemberDto = {
        name: 'Member',
        type: CastMemberTypes.ACTOR,
      };

      const presenter = await controller.update(id, input);
      expect(mockUpdateUseCase.execute).toHaveBeenCalledWith({ id, ...input });
      expect(presenter).toBeInstanceOf(CastMemberPresenter);
      expect(presenter).toStrictEqual(new CastMemberPresenter(output));
    });
  });

  describe('remove', () => {
    it('should delete a cast member', async () => {
      const expectedOutput = undefined;

      const mockDeleteUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(expectedOutput)),
      };
      //@ts-expect-error defined part of methods
      controller['deleteCastMemberUseCase'] = mockDeleteUseCase;

      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';

      expect(controller.remove(id)).toBeInstanceOf(Promise);

      const output = await controller.remove(id);

      expect(mockDeleteUseCase.execute).toHaveBeenCalledWith({ id });
      expect(expectedOutput).toStrictEqual(output);
    });
  });

  describe('findOne', () => {
    it('should get a cast member', async () => {
      const id = '9366b7dc-2d71-4799-b91c-c64adb205104';

      const output: GetCastMemberOutput = {
        id,
        name: 'Member',
        type: CastMemberTypes.ACTOR,
        createdAt: new Date(),
      };

      const mockGetUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      //@ts-expect-error defined part of methods
      controller['getCastMemberUseCase'] = mockGetUseCase;

      const presenter = await controller.findOne(id);

      expect(mockGetUseCase.execute).toHaveBeenCalledWith({ id });
      expect(presenter).toBeInstanceOf(CastMemberPresenter);
      expect(presenter).toStrictEqual(new CastMemberPresenter(output));
    });
  });

  describe('search', () => {
    it('should search cast members', async () => {
      const output: ListCastMembersOutput = {
        items: [
          {
            id: '9366b7dc-2d71-4799-b91c-c64adb205104',
            name: 'Member',
            type: CastMemberTypes.ACTOR,
            createdAt: new Date(),
          },
        ],
        currentPage: 1,
        lastPage: 1,
        perPage: 1,
        total: 1,
      };

      const mockListUseCase = {
        execute: jest.fn().mockReturnValue(Promise.resolve(output)),
      };
      //@ts-expect-error defined part of methods
      controller['listCastMembersUseCase'] = mockListUseCase;

      const searchParams = {
        page: 1,
        perPage: 2,
        sort: 'name',
        sortDir: 'desc' as SortDirection,
        filter: { name: 'actor test' },
      };
      const presenter = await controller.search(searchParams);

      expect(presenter).toBeInstanceOf(CastMemberCollectionPresenter);
      expect(mockListUseCase.execute).toHaveBeenCalledWith(searchParams);
      expect(presenter).toEqual(new CastMemberCollectionPresenter(output));
    });
  });
});
