import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { IUnitOfWork } from '@core/shared/domain/repository/unit-of-work.interface';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { InMemoryStorage } from '@core/shared/infra/storage/in-memory.storage';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { Banner } from '@core/video/domain/entity/vo/banner.vo';
import { ThumbnailHalf } from '@core/video/domain/entity/vo/thumbnail-half.vo';
import { Thumbnail } from '@core/video/domain/entity/vo/thumbnail.vo';
import { IVideoRepository } from '@core/video/domain/repository/video.repository';
import { UploadImageMediasInput } from './upload-image-medias.input';

export class UploadImageMediasUseCase
  implements IUseCase<UploadImageMediasInput, UploadImageMediasOutput>
{
  constructor(
    private uow: IUnitOfWork,
    private videoRepo: IVideoRepository,
    private storage: InMemoryStorage,
  ) {}

  async execute(
    input: UploadImageMediasInput,
  ): Promise<UploadImageMediasOutput> {
    const videoId = new VideoId(input.videoId);
    const video = await this.videoRepo.findById(videoId);

    if (!video) {
      throw new NotFoundError(input.videoId, Video);
    }

    const imagesMap = {
      banner: Banner,
      thumbnail: Thumbnail,
      thumbnailHalf: ThumbnailHalf,
    };

    const [image, errorImage] = imagesMap[input.field]
      .createFromFile({
        ...input.file,
        videoId: videoId,
      })
      .asArray();

    if (errorImage) {
      throw new EntityValidationError([
        { [input.field]: [errorImage.message] },
      ]);
    }

    image instanceof Banner && video.replaceBanner(image);
    image instanceof Thumbnail && video.replaceThumbnail(image);
    image instanceof ThumbnailHalf && video.replaceThumbnailHalf(image);

    await this.storage.store({
      data: input.file.data,
      mimeType: input.file.mimeType,
      id: image.url,
    });

    await this.uow.do(async () => {
      await this.videoRepo.update(video);
    });
  }
}

export type UploadImageMediasOutput = void;
