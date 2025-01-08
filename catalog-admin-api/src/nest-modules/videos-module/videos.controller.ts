import { CreateVideoUseCase } from '@core/video/application/usecases/create-video/create-video.usecase';
import { GetVideoUseCase } from '@core/video/application/usecases/get-video/get-video.usecase';
import { UpdateVideoUseCase } from '@core/video/application/usecases/update-video/update-video.usecase';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/usecases/upload-audio-video-medias/upload-audio-video-medias.usecase';
import {
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
} from '@nestjs/common';
import { CreateVideoDto } from './dto/create-video.dto';
import { UpdateVideoDto } from './dto/update-video.dto';

@Controller('videos')
export class VideosController {
  @Inject(CreateVideoUseCase)
  private createUseCase: CreateVideoUseCase;

  @Inject(UpdateVideoUseCase)
  private updateUseCase: UpdateVideoUseCase;

  @Inject(UploadAudioVideoMediasUseCase)
  private uploadAudioVideoMedia: UploadAudioVideoMediasUseCase;

  @Inject(GetVideoUseCase)
  private getUseCase: GetVideoUseCase;

  @Post()
  async create(@Body() createVideoDto: CreateVideoDto) {
    const { id } = await this.createUseCase.execute(createVideoDto);
    return await this.getUseCase.execute({ id });
  }

  @Get(':id')
  async findOne(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
  ) {
    return await this.getUseCase.execute({ id });
  }

  @Patch(':id')
  async update(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @Body() updateVideoDto: UpdateVideoDto,
  ) {}

  @Patch(':id/upload')
  uploadFile(
    @UploadedFiles()
    @Body()
    data,
  ) {}
}
