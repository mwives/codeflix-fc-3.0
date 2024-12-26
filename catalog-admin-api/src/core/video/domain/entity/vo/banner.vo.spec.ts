import {
  InvalidMediaFileSizeError,
  InvalidMediaFileMimeTypeError,
} from '@core/shared/domain/validators/media-file.validator';
import { Banner } from './banner.vo';
import { VideoId } from '../video.entity';

describe('Banner', () => {
  describe('createFromFile', () => {
    it('should create a valid banner', () => {
      const videoId = new VideoId();

      const [banner, bannerError] = Banner.createFromFile({
        rawName: 'file.png',
        size: 1000,
        mimeType: 'image/png',
        videoId,
      }).asArray();

      expect(bannerError).toBeNull();
      expect(banner.name).toMatch(/^[a-f0-9]{64}\.png$/);
      expect(banner.location).toBe(`videos/${videoId}/images`);
    });

    it('should fail to create a banner with invalid file size', () => {
      const videoId = new VideoId();

      const [banner, bannerError] = Banner.createFromFile({
        rawName: 'file.png',
        size: 1024 * 1024 * 3, // 3MB
        mimeType: 'image/png',
        videoId,
      }).asArray();

      expect(banner).toBeNull();
      expect(bannerError).toBeInstanceOf(InvalidMediaFileSizeError);
    });

    it('should fail to create a banner with invalid mime type', () => {
      const videoId = new VideoId();

      const [banner, bannerError] = Banner.createFromFile({
        rawName: 'file.jpg',
        size: 1000,
        mimeType: 'text/plain',
        videoId,
      }).asArray();

      expect(banner).toBeNull();
      expect(bannerError).toBeInstanceOf(InvalidMediaFileMimeTypeError);
    });
  });
});
