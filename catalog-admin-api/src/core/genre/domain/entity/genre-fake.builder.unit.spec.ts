import { CategoryId } from '@core/category/domain/entity/category.entity';
import { Genre, GenreId } from './genre.entity';

describe('Genre', () => {
  beforeEach(() => {
    Genre.prototype.validate = jest
      .fn()
      .mockImplementation(Genre.prototype.validate);
  });

  describe('constructor', () => {
    it('should create a genre with default values', () => {
      const categoryId = new CategoryId();
      const categoriesId = new Map<string, CategoryId>([
        [categoryId.id, categoryId],
      ]);

      const genre = new Genre({
        name: 'test',
        categoryIds: categoriesId,
      });

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('test');
      expect(genre.categoryIds).toEqual(categoriesId);
      expect(genre.isActive).toBe(true);
      expect(genre.createdAt).toBeInstanceOf(Date);
    });

    it('should create a genre with provided values', () => {
      const categoryId = new CategoryId();
      const categoriesId = new Map<string, CategoryId>([
        [categoryId.id, categoryId],
      ]);
      const now = new Date();

      const genre = new Genre({
        name: 'test',
        categoryIds: categoriesId,
        isActive: false,
        createdAt: now,
      });

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('test');
      expect(genre.categoryIds).toEqual(categoriesId);
      expect(genre.isActive).toBe(false);
      expect(genre.createdAt).toBe(now);
    });
  });

  describe('create', () => {
    it('should create a valid genre', () => {
      const categoryId = new CategoryId();
      const categoriesId = new Map([[categoryId.id, categoryId]]);

      const genre = Genre.create({
        name: 'test',
        categoryIds: [categoryId],
      });

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('test');
      expect(genre.categoryIds).toEqual(categoriesId);
      expect(genre.createdAt).toBeInstanceOf(Date);
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
      expect(genre.notification.hasErrors()).toBe(false);
    });

    it('should return validation errors for invalid name', () => {
      const categoryId = new CategoryId();

      const genre = Genre.create({
        name: 't'.repeat(256),
        categoryIds: [categoryId],
      });

      expect(genre.validate).toHaveBeenCalledTimes(1);
      expect(genre.notification.hasErrors()).toBe(true);
      expect(genre.notification).toContainNotificationErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('changeName', () => {
    it('should change the genre name', () => {
      const genre = Genre.create({
        name: 'test',
        categoryIds: [new CategoryId()],
      });

      genre.changeName('new_name');

      expect(genre.name).toBe('new_name');
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
      expect(genre.notification.hasErrors()).toBe(false);
    });

    it('should return validation errors for invalid name', () => {
      const genre = Genre.create({
        name: 'test',
        categoryIds: [new CategoryId()],
      });

      genre.changeName('t'.repeat(256));

      expect(Genre.prototype.validate).toHaveBeenCalledTimes(2);
      expect(genre.notification.hasErrors()).toBe(true);
      expect(genre.notification).toContainNotificationErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('addCategoryId', () => {
    it('should add a category id to the genre', () => {
      const categoryId1 = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categoryIds: [categoryId1],
      });

      const categoryId2 = new CategoryId();
      genre.addCategoryId(categoryId2);

      expect(genre.categoryIds.size).toBe(2);
      expect(genre.categoryIds).toEqual(
        new Map([
          [categoryId1.id, categoryId1],
          [categoryId2.id, categoryId2],
        ]),
      );
      expect(Genre.prototype.validate).toHaveBeenCalledTimes(1);
    });
  });

  describe('toJSON', () => {
    it('should return a JSON representation of the genre', () => {
      const categoryId = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categoryIds: [categoryId],
      });

      expect(genre.toJSON()).toEqual({
        genreId: genre.genreId.id,
        name: 'test',
        categoryIds: Array.from(genre.categoryIds.keys()),
        isActive: true,
        createdAt: genre.createdAt,
      });
    });
  });
});
