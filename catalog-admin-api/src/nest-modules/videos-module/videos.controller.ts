import { CreateVideoUseCase } from '@core/video/application/usecases/create-video/create-video.usecase';
import { GetVideoUseCase } from '@core/video/application/usecases/get-video/get-video.usecase';
import { UpdateVideoInput } from '@core/video/application/usecases/update-video/update-video.input';
import { UpdateVideoUseCase } from '@core/video/application/usecases/update-video/update-video.usecase';
import { UploadAudioVideoMediaInput } from '@core/video/application/usecases/upload-audio-video-medias/upload-audio-video-medias.input';
import { UploadAudioVideoMediasUseCase } from '@core/video/application/usecases/upload-audio-video-medias/upload-audio-video-medias.usecase';
import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Inject,
  Param,
  ParseUUIDPipe,
  Patch,
  Post,
  UploadedFiles,
  UseInterceptors,
  ValidationPipe,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
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
  ) {
    const hasData = Object.keys(updateVideoDto).length > 0;

    if (!hasData) return;

    const data = await new ValidationPipe({
      errorHttpStatusCode: 422,
    }).transform(updateVideoDto, {
      metatype: UpdateVideoDto,
      type: 'body',
    });

    const input = new UpdateVideoInput({ id, ...data });
    await this.updateUseCase.execute(input);

    return await this.getUseCase.execute({ id });
  }

  @Patch(':id/upload')
  @UseInterceptors(
    FileFieldsInterceptor([
      { name: 'banner', maxCount: 1 },
      { name: 'thumbnail', maxCount: 1 },
      { name: 'thumbnailHalf', maxCount: 1 },
      { name: 'trailer', maxCount: 1 },
      { name: 'video', maxCount: 1 },
    ]),
  )
  async uploadFile(
    @Param('id', new ParseUUIDPipe({ errorHttpStatusCode: 422 })) id: string,
    @UploadedFiles()
    files: {
      banner?: Express.Multer.File[];
      thumbnail?: Express.Multer.File[];
      thumbnailHalf?: Express.Multer.File[];
      trailer?: Express.Multer.File[];
      video?: Express.Multer.File[];
    },
  ) {
    const hasMoreThanOneFile = Object.keys(files).length > 1;

    if (hasMoreThanOneFile) {
      throw new BadRequestException('Only one file can be sent');
    }

    const hasAudioVideoMedia = files.trailer?.length || files.video?.length;
    const field = Object.keys(files)[0];
    const file = files[field][0];

    if (hasAudioVideoMedia) {
      const dto: UploadAudioVideoMediaInput = {
        videoId: id,
        field: field as any,
        file: {
          rawName: file.originalname,
          data: file.buffer,
          mimeType: file.mimetype,
          size: file.size,
        },
      };

      const input = await new ValidationPipe({
        errorHttpStatusCode: 422,
      }).transform(dto, {
        metatype: UploadAudioVideoMediaInput,
        type: 'body',
      });

      await this.uploadAudioVideoMedia.execute(input);
    } else {
      //use case upload image media
    }

    return await this.getUseCase.execute({ id });
  }
}
