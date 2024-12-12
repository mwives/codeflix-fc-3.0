import { setupSequelize } from '@core/shared/infra/testing/helpers';
import { CastMemberModel } from './cast-member.model';

describe('CastMemberModel', () => {
  setupSequelize({ models: [CastMemberModel] });

  describe('Model attributes mapping', () => {
    it('should correctly map the attributes of the CastMemberModel', () => {
      const attributesMap = CastMemberModel.getAttributes();
      const attributes = Object.keys(attributesMap);

      expect(attributes).toStrictEqual([
        'castMemberId',
        'name',
        'type',
        'createdAt',
      ]);

      expect(attributesMap.castMemberId).toMatchObject({
        field: 'cast_member_id',
        fieldName: 'castMemberId',
        primaryKey: true,
        type: expect.anything(),
      });

      expect(attributesMap.name).toMatchObject({
        field: 'name',
        fieldName: 'name',
        allowNull: false,
        type: expect.anything(),
      });

      expect(attributesMap.type).toMatchObject({
        field: 'type',
        fieldName: 'type',
        allowNull: false,
        type: expect.anything(),
      });

      expect(attributesMap.createdAt).toMatchObject({
        field: 'created_at',
        fieldName: 'createdAt',
        allowNull: false,
        type: expect.anything(),
      });
    });
  });

  describe('Model data operations', () => {
    it('should create a CastMemberModel instance with valid properties', async () => {
      const arrange = {
        castMemberId: '1',
        name: 'Actor Name',
        type: 1,
        createdAt: new Date(),
      };

      const castMember = await CastMemberModel.create(arrange);
      expect(castMember.toJSON()).toMatchObject(arrange);
    });
  });
});
