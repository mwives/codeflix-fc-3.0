import { CategoryId } from '@core/category/domain/entity/category.entity';
import { Genre, GenreId } from './genre.entity';

describe('Genre', () => {
  beforeEach(() => {
    Genre.prototype.validate = jest
      .fn()
      .mockImplementation(Genre.prototype.validate);
  });

  describe('constructor', () => {
    it('should create an instance with default values', () => {
      const categoryId = new CategoryId();
      const categoriesId = new Map([[categoryId.id, categoryId]]);
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

    it('should create an instance with given values', () => {
      const categoryId = new CategoryId();
      const categoriesId = new Map([[categoryId.id, categoryId]]);
      const createdAt = new Date();
      const genre = new Genre({
        name: 'test',
        categoryIds: categoriesId,
        isActive: false,
        createdAt,
      });

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('test');
      expect(genre.categoryIds).toEqual(categoriesId);
      expect(genre.isActive).toBe(false);
      expect(genre.createdAt).toBe(createdAt);
    });
  });

  describe('create', () => {
    it('should create an instance with valid values', () => {
      const categoryId = new CategoryId();
      const categoryIds = [categoryId];
      const genre = Genre.create({
        name: 'test',
        categoryIds,
      });

      expect(genre.genreId).toBeInstanceOf(GenreId);
      expect(genre.name).toBe('test');
      expect(genre.categoryIds).toEqual(new Map([[categoryId.id, categoryId]]));
      expect(genre.createdAt).toBeInstanceOf(Date);
      expect(genre.validate).toHaveBeenCalledTimes(1);
      expect(genre.notification.hasErrors()).toBe(false);
    });

    it('should have validation errors for invalid values', () => {
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
    it('should change the name', () => {
      const genre = Genre.create({
        name: 'test',
        categoryIds: [new CategoryId()],
      });

      genre.changeName('new_test');

      expect(genre.name).toBe('new_test');
      expect(genre.validate).toHaveBeenCalledTimes(2);
      expect(genre.notification.hasErrors()).toBe(false);
    });

    it('should have validation errors for invalid name', () => {
      const genre = Genre.create({
        name: 'test',
        categoryIds: [new CategoryId()],
      });

      genre.changeName('t'.repeat(256));

      expect(genre.validate).toHaveBeenCalledTimes(2);
      expect(genre.notification.hasErrors()).toBe(true);
      expect(genre.notification).toContainNotificationErrorMessages([
        {
          name: ['name must be shorter than or equal to 255 characters'],
        },
      ]);
    });
  });

  describe('addCategoryId', () => {
    it('should add a category ID', () => {
      const categoryId = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categoryIds: [categoryId],
      });

      const categoryId2 = new CategoryId();
      genre.addCategoryId(categoryId2);

      expect(genre.categoryIds.size).toBe(2);
      expect(genre.categoryIds).toEqual(
        new Map([
          [categoryId.id, categoryId],
          [categoryId2.id, categoryId2],
        ]),
      );
      expect(genre.validate).toHaveBeenCalledTimes(1);
    });
  });

  describe('toJSON', () => {
    it('should return JSON representation', () => {
      const categoryId = new CategoryId();
      const genre = Genre.create({
        name: 'test',
        categoryIds: [categoryId],
      });

      expect(genre.toJSON()).toEqual({
        genreId: genre.genreId.id,
        name: 'test',
        categoryIds: Array.from(genre.categoryIds.keys()),
        isActive: genre.isActive,
        createdAt: genre.createdAt,
      });
    });
  });
});
