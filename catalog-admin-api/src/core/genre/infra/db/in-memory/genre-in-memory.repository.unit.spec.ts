import { Genre } from '@core/genre/domain/entity/genre.entity';
import { GenreInMemoryRepository } from './genre-in-memory.repository';
import { CategoryId } from '@core/category/domain/entity/category.entity';

describe('GenreInMemoryRepository', () => {
  let repository: GenreInMemoryRepository;

  beforeEach(() => (repository = new GenreInMemoryRepository()));

  describe('applyFilter', () => {
    it('should not filter items when filter param is null', async () => {
      const items = [
        Genre.fake().aGenre().build(),
        Genre.fake().aGenre().build(),
      ];
      const filterSpy = jest.spyOn(items, 'filter' as any);

      const itemsFiltered = await repository['applyFilter'](items, null!);
      expect(filterSpy).not.toHaveBeenCalled();
      expect(itemsFiltered).toStrictEqual(items);
    });

    it('should filter items by name', async () => {
      const faker = Genre.fake().aGenre();
      const items = [
        faker.withName('test').build(),
        faker.withName('TEST').build(),
        faker.withName('fake').build(),
      ];

      const itemsFiltered = await repository['applyFilter'](items, {
        name: 'TEST',
      });
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
    });

    describe('filtering by categoryIds', () => {
      it('should filter items by a single categoryId', async () => {
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const items = [
          Genre.fake().aGenre().addCategoryId(categoryId1).build(),
          Genre.fake().aGenre().addCategoryId(categoryId2).build(),
        ];

        const itemsFiltered = await repository['applyFilter'](items, {
          categoryIds: [categoryId1],
        });
        expect(itemsFiltered).toStrictEqual([items[0]]);
      });

      it('should filter items by multiple categoryIds', async () => {
        const categoryId1 = new CategoryId();
        const categoryId2 = new CategoryId();
        const categoryId3 = new CategoryId();
        const items = [
          Genre.fake().aGenre().addCategoryId(categoryId1).build(),
          Genre.fake().aGenre().addCategoryId(categoryId2).build(),
          Genre.fake().aGenre().addCategoryId(categoryId3).build(),
        ];

        const itemsFiltered = await repository['applyFilter'](items, {
          categoryIds: [categoryId1, categoryId2],
        });
        expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
      });
    });

    it('should filter items by name and categoryIds', async () => {
      const categoryId1 = new CategoryId();
      const categoryId2 = new CategoryId();
      const categoryId3 = new CategoryId();
      const items = [
        Genre.fake()
          .aGenre()
          .withName('test')
          .addCategoryId(categoryId1)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('test')
          .addCategoryId(categoryId2)
          .build(),
        Genre.fake()
          .aGenre()
          .withName('fake')
          .addCategoryId(categoryId3)
          .build(),
      ];

      const itemsFiltered = await repository['applyFilter'](items, {
        name: 'test',
        categoryIds: [categoryId1, categoryId2],
      });
      expect(itemsFiltered).toStrictEqual([items[0], items[1]]);
    });
  });

  describe('applySort', () => {
    it('should sort items by createdAt in descending order when sort param is null', () => {
      const items = [
        Genre.fake().aGenre().withCreatedAt(new Date('2023-01-01')).build(),
        Genre.fake().aGenre().withCreatedAt(new Date('2023-01-02')).build(),
        Genre.fake().aGenre().withCreatedAt(new Date('2023-01-03')).build(),
      ];

      const itemsSorted = repository['applySort'](items, null, null);
      expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);
    });

    it('should sort items by name', () => {
      const items = [
        Genre.fake().aGenre().withName('c').build(),
        Genre.fake().aGenre().withName('b').build(),
        Genre.fake().aGenre().withName('a').build(),
      ];

      let itemsSorted = repository['applySort'](items, 'name', 'asc');
      expect(itemsSorted).toStrictEqual([items[2], items[1], items[0]]);

      itemsSorted = repository['applySort'](items, 'name', 'desc');
      expect(itemsSorted).toStrictEqual([items[0], items[1], items[2]]);
    });
  });
});
