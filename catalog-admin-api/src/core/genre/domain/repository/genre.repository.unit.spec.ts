import { CategoryId } from '@core/category/domain/entity/category.entity';
import { GenreSearchParams } from './genre.repository';

describe('GenreSearchParams', () => {
  describe('create', () => {
    it('should create an instance of GenreSearchParams with empty filter', () => {
      const searchParams = GenreSearchParams.create();

      expect(searchParams).toBeInstanceOf(GenreSearchParams);
      expect(searchParams.filter).toBeNull();
    });

    it('should create an instance of GenreSearchParams with filter name', () => {
      const searchParams = GenreSearchParams.create({
        filter: {
          name: 'Action',
          categoryIds: ['123e4567-e89b-12d3-a456-426655440000'],
        },
      });

      expect(searchParams).toBeInstanceOf(GenreSearchParams);
      expect(searchParams.filter).toEqual({
        name: 'Action',
        categoryIds: [new CategoryId('123e4567-e89b-12d3-a456-426655440000')],
      });
    });
  });
});
