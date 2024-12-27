import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from './media-file.validator';

describe('MediaFileValidator', () => {
  let mediaFileValidator: MediaFileValidator;

  beforeEach(() => {
    mediaFileValidator = new MediaFileValidator(1000, ['image/png']);
  });

  describe('validate', () => {
    it('should throw an error if the file size exceeds the maximum size', () => {
      expect(() =>
        mediaFileValidator.validate({
          rawName: 'file.png',
          size: 1001,
          mimeType: 'image/png',
        }),
      ).toThrow(new InvalidMediaFileSizeError(1001, 1000));
    });

    it('should throw an error if the mime type is not valid', () => {
      expect(() =>
        mediaFileValidator.validate({
          rawName: 'file.png',
          size: 1000,
          mimeType: 'image/jpeg',
        }),
      ).toThrow(new InvalidMediaFileMimeTypeError('image/jpeg', ['image/png']));
    });

    it('should return the generated name if the file is valid', () => {
      const { name } = mediaFileValidator.validate({
        rawName: 'file.png',
        size: 1000,
        mimeType: 'image/png',
      });

      expect(name).toMatch(/^[a-f0-9]{64}\.png$/);
    });
  });
});
