import { Rating, RatingValues, InvalidRatingError } from './rating.vo';

describe('Rating', () => {
  describe('create', () => {
    it('should create a valid rating', () => {
      const rating = Rating.with(RatingValues.R10);
      expect(rating.value).toBe(RatingValues.R10);
    });

    it('should fail to create an invalid rating', () => {
      expect(() => Rating.with('invalid' as any)).toThrow(InvalidRatingError);
    });
  });

  describe('create specific ratings', () => {
    it('should create RL rating', () => {
      const rating = Rating.createRL();
      expect(rating.value).toBe(RatingValues.RL);
    });

    it('should create R10 rating', () => {
      const rating = Rating.create10();
      expect(rating.value).toBe(RatingValues.R10);
    });

    it('should create R12 rating', () => {
      const rating = Rating.create12();
      expect(rating.value).toBe(RatingValues.R12);
    });

    it('should create R14 rating', () => {
      const rating = Rating.create14();
      expect(rating.value).toBe(RatingValues.R14);
    });

    it('should create R16 rating', () => {
      const rating = Rating.create16();
      expect(rating.value).toBe(RatingValues.R16);
    });

    it('should create R18 rating', () => {
      const rating = Rating.create18();
      expect(rating.value).toBe(RatingValues.R18);
    });
  });
});
