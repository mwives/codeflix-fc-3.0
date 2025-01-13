import { Test, TestingModule } from '@nestjs/testing';
import { VideosController } from './videos.controller';
import { CreateVideoUseCase } from '@core/video/application/usecases/create-video/create-video.usecase';
import { UpdateVideoUseCase } from '@core/video/application/usecases/update-video/update-video.usecase';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/usecases/upload-audio-video-medias/upload-audio-video-medias.usecase';
import { GetVideoUseCase } from '@core/video/application/usecases/get-video/get-video.usecase';

describe('VideosController', () => {
  let controller: VideosController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [VideosController],
      providers: [
        CreateVideoUseCase,
        GetVideoUseCase,
        UpdateVideoUseCase,
        UploadAudioVideoMediasUseCase,
      ],
    }).compile();

    controller = module.get<VideosController>(VideosController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
