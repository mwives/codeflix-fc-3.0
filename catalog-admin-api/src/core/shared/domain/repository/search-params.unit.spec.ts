import { SearchParams } from './search-params';

describe('SearchParams', () => {
  describe('page property', () => {
    test.each([
      { page: null, expected: 1 },
      { page: undefined, expected: 1 },
      { page: '', expected: 1 },
      { page: 'fake', expected: 1 },
      { page: 0, expected: 1 },
      { page: -1, expected: 1 },
      { page: 5.5, expected: 1 },
      { page: true, expected: 1 },
      { page: false, expected: 1 },
      { page: {}, expected: 1 },
      { page: 1, expected: 1 },
      { page: 2, expected: 2 },
    ])('should default page to %p', ({ page, expected }) => {
      const params = new SearchParams();
      expect(params.page).toBe(1);

      expect(new SearchParams({ page: page as any }).page).toBe(expected);
    });
  });

  describe('perPage property', () => {
    test.each([
      { perPage: null, expected: 15 },
      { perPage: undefined, expected: 15 },
      { perPage: '', expected: 15 },
      { perPage: 'fake', expected: 15 },
      { perPage: 0, expected: 15 },
      { perPage: -1, expected: 15 },
      { perPage: 5.5, expected: 15 },
      { perPage: true, expected: 15 },
      { perPage: false, expected: 15 },
      { perPage: {}, expected: 15 },
      { perPage: 1, expected: 1 },
      { perPage: 2, expected: 2 },
      { perPage: 10, expected: 10 },
    ])('should default perPage to %p', (i) => {
      const params = new SearchParams();
      expect(params.perPage).toBe(15);

      expect(new SearchParams({ perPage: i.perPage as any }).perPage).toBe(
        i.expected,
      );
    });
  });

  describe('sort property', () => {
    test.each([
      { sort: null, expected: null },
      { sort: undefined, expected: null },
      { sort: '', expected: null },
      { sort: 0, expected: '0' },
      { sort: -1, expected: '-1' },
      { sort: 5.5, expected: '5.5' },
      { sort: true, expected: 'true' },
      { sort: false, expected: 'false' },
      { sort: {}, expected: '[object Object]' },
      { sort: 'field', expected: 'field' },
    ])('should set sort to %p', (i) => {
      const params = new SearchParams();
      expect(params.sort).toBeNull();

      expect(new SearchParams({ sort: i.sort as any }).sort).toBe(i.expected);
    });
  });

  describe('sortDir property', () => {
    test('default value', () => {
      const params = new SearchParams();
      expect(params.sortDir).toBeNull();
    });

    test('default value when sort is null or empty', () => {
      let params = new SearchParams({ sort: null });
      expect(params.sortDir).toBeNull();

      params = new SearchParams({ sort: undefined });
      expect(params.sortDir).toBeNull();

      params = new SearchParams({ sort: '' });
      expect(params.sortDir).toBeNull();
    });

    test.each([
      { sortDir: null, expected: 'asc' },
      { sortDir: undefined, expected: 'asc' },
      { sortDir: '', expected: 'asc' },
      { sortDir: 0, expected: 'asc' },
      { sortDir: 'fake', expected: 'asc' },
      { sortDir: 'asc', expected: 'asc' },
      { sortDir: 'ASC', expected: 'asc' },
      { sortDir: 'desc', expected: 'desc' },
      { sortDir: 'DESC', expected: 'desc' },
    ])('should set sortDir to %p', ({ sortDir, expected }) => {
      const params = new SearchParams({
        sort: 'field',
        sortDir: sortDir as any,
      });
      expect(params.sortDir).toBe(expected);
    });
  });

  describe('filter property', () => {
    test.each([
      { filter: null, expected: null },
      { filter: undefined, expected: null },
      { filter: '', expected: null },
      { filter: 0, expected: '0' },
      { filter: -1, expected: '-1' },
      { filter: 5.5, expected: '5.5' },
      { filter: true, expected: 'true' },
      { filter: false, expected: 'false' },
      { filter: {}, expected: '[object Object]' },
      { filter: 'field', expected: 'field' },
    ])('should set filter to %p', (props) => {
      const params = new SearchParams();
      expect(params.filter).toBeNull();

      expect(new SearchParams({ filter: props.filter as any }).filter).toBe(
        props.expected,
      );
    });
  });
});
