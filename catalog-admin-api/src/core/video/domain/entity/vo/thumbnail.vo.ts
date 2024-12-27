import { Either } from '@core/shared/domain/either';
import {
  InvalidMediaFileMimeTypeError,
  InvalidMediaFileSizeError,
  MediaFileValidator,
} from '@core/shared/domain/validators/media-file.validator';
import { ImageMedia } from '@core/shared/domain/value-object/value-objects/image-media.vo';
import { VideoId } from '../video.entity';

export class Thumbnail extends ImageMedia {
  static maxSize = 1024 * 1024 * 2;
  static mimeTypes = ['image/jpeg', 'image/png'];

  static createFromFile({
    rawName,
    mimeType,
    size,
    videoId,
  }: {
    rawName: string;
    mimeType: string;
    size: number;
    videoId: VideoId;
  }) {
    const mediaFileValidator = new MediaFileValidator(
      Thumbnail.maxSize,
      Thumbnail.mimeTypes,
    );

    return Either.safe<
      Thumbnail,
      InvalidMediaFileSizeError | InvalidMediaFileMimeTypeError
    >(() => {
      const { name } = mediaFileValidator.validate({
        rawName,
        mimeType,
        size,
      });

      return new Thumbnail({
        name,
        location: `videos/${videoId.id}/images`,
      });
    });
  }
}
