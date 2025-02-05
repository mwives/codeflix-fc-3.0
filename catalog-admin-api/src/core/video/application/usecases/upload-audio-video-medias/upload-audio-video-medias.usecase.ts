import { ApplicationService } from '@core/shared/application/application.service';
import { IStorage } from '@core/shared/application/storage.interface';
import { IUseCase } from '@core/shared/application/use-case.interface';
import { NotFoundError } from '@core/shared/domain/error/not-found.error';
import { EntityValidationError } from '@core/shared/domain/validators/validation.error';
import { Video, VideoId } from '@core/video/domain/entity/video.entity';
import { Trailer } from '@core/video/domain/entity/vo/trailer.vo';
import { VideoMedia } from '@core/video/domain/entity/vo/video-media.vo';
import { IVideoRepository } from '@core/video/domain/repository/video.repository';
import { UploadAudioVideoMediaInput } from './upload-audio-video-medias.input';

export class UploadAudioVideoMediasUseCase
  implements IUseCase<UploadAudioVideoMediaInput, UploadAudioVideoMediaOutput>
{
  constructor(
    private appService: ApplicationService,
    private videoRepo: IVideoRepository,
    private storage: IStorage,
  ) {}

  async execute(
    input: UploadAudioVideoMediaInput,
  ): Promise<UploadAudioVideoMediaOutput> {
    const video = await this.videoRepo.findById(new VideoId(input.videoId));

    if (!video) {
      throw new NotFoundError(input.videoId, Video);
    }

    const audioVideoMediaMap = {
      trailer: Trailer,
      video: VideoMedia,
    };

    const audioMediaClass = audioVideoMediaMap[input.field] as
      | typeof Trailer
      | typeof VideoMedia;
    const [audioVideoMedia, errorAudioMedia] = audioMediaClass
      .createFromFile({
        ...input.file,
        videoId: video.videoId,
      })
      .asArray();

    if (errorAudioMedia) {
      throw new EntityValidationError([
        {
          [input.field]: [errorAudioMedia.message],
        },
      ]);
    }

    if (audioVideoMedia instanceof Trailer)
      video.replaceTrailer(audioVideoMedia);
    if (audioVideoMedia instanceof VideoMedia)
      video.replaceVideo(audioVideoMedia);

    await this.storage.store({
      data: input.file.data,
      id: audioVideoMedia.rawUrl,
      mimeType: input.file.mimeType,
    });

    await this.appService.run(async () => {
      return this.videoRepo.update(video);
    });
  }
}

export type UploadAudioVideoMediaOutput = void;
