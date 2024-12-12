import { Uuid } from '../../../shared/domain/value-object/value-objects/uuid.vo';
import { Category } from './category.entity';

describe('CategoryEntity', () => {
  beforeEach(() => {
    Category.prototype.validate = jest
      .fn()
      .mockImplementation(Category.prototype.validate);
  });

  describe('constructor', () => {
    it('should create instance with default values', () => {
      const category = new Category({
        name: 'any_category',
      });

      expect(category.categoryId).toBeInstanceOf(Uuid);
      expect(category.name).toBe('any_category');
      expect(category.description).toBeNull();
      expect(category.isActive).toBe(true);
      expect(category.createdAt).toBeInstanceOf(Date);
    });

    it('should create instance with given values', () => {
      const now = new Date();
      const category = new Category({
        categoryId: new Uuid('f47ac10b-58cc-4372-a567-0e02b2c3d479'),
        name: 'any_category',
        description: 'any_description',
        isActive: false,
        createdAt: now,
      });

      expect(category.categoryId.id).toBe(
        'f47ac10b-58cc-4372-a567-0e02b2c3d479',
      );
      expect(category.name).toBe('any_category');
      expect(category.description).toBe('any_description');
      expect(category.isActive).toBe(false);
      expect(category.createdAt).toBe(now);
    });
  });

  describe('create', () => {
    it('should create instance with given values', () => {
      const category = Category.create({
        name: 'any_category',
        description: 'any_description',
        isActive: false,
      });

      expect(category.categoryId).toBeInstanceOf(Uuid);
      expect(category.name).toBe('any_category');
      expect(category.description).toBe('any_description');
      expect(category.isActive).toBe(false);
      expect(category.createdAt).toBeInstanceOf(Date);
      expect(category.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBe(false);
    });

    it('should have validation errors for invalid values', () => {
      const category = Category.create({
        name: 't'.repeat(256),
      });

      expect(category.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBe(true);
    });
  });

  describe('changeName', () => {
    it('should change name', () => {
      const category = Category.create({
        name: 'any_category',
      });
      category.changeName('new_category');
      expect(category.name).toBe('new_category');
      expect(category.validate).toHaveBeenCalledTimes(2);
    });

    it('should have validation errors for invalid name', () => {
      const category = new Category({ name: 'any_category' });

      category.changeName('t'.repeat(256));
      expect(category.validate).toHaveBeenCalledTimes(1);
      expect(category.notification.hasErrors()).toBe(true);
    });
  });

  describe('changeDescription', () => {
    it('should change description', () => {
      const category = Category.create({
        name: 'any_category',
      });
      category.changeDescription('new_description');
      expect(category.description).toBe('new_description');
      expect(category.validate).toHaveBeenCalledTimes(1);
    });
  });

  describe('activate', () => {
    it('should activate category', () => {
      const category = new Category({
        name: 'any_category',
        isActive: false,
      });
      category.activate();
      expect(category.isActive).toBe(true);
    });
  });

  describe('deactivate', () => {
    it('should deactivate category', () => {
      const category = new Category({
        name: 'any_category',
        isActive: true,
      });
      category.deactivate();
      expect(category.isActive).toBe(false);
    });
  });

  describe('toJSON', () => {
    it('should return JSON', () => {
      const now = new Date();
      const category = new Category({
        name: 'any_category',
        description: 'any_description',
        isActive: false,
        createdAt: now,
      });

      expect(category.toJSON()).toEqual({
        categoryId: expect.any(String),
        name: 'any_category',
        description: 'any_description',
        isActive: false,
        createdAt: now,
      });
    });
  });
});
