import { UnitOfWorkInMemory } from '@core/shared/infra/db/in-memory/unit-of-work-in-memory';
import { VideoAudioMediaUploadedIntegrationEvent } from '@core/video/domain/domain-events/video-audio-media-replaced.event';
import { AmqpConnection } from '@golevelup/nestjs-rabbitmq';
import { DynamicModule } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import EventEmitter2 from 'eventemitter2';
import { ApplicationModule } from '../application-module/application.module';
import { ConfigModule } from '../config-module/config.module';
import { DatabaseModule } from '../database-module/database.module';
import { EventModule } from '../event-module/event.module';
import { SharedModule } from '../shared-module/shared.module';
import { VideosModule } from './videos.module';

class RabbitmqModuleFake {
  static forRoot(): DynamicModule {
    return {
      module: RabbitmqModuleFake,
      global: true,
      providers: [
        {
          provide: AmqpConnection,
          useValue: {
            publish: jest.fn(),
          },
        },
      ],
      exports: [AmqpConnection],
    };
  }
}

describe('VideosModule', () => {
  let module: TestingModule;

  beforeEach(async () => {
    module = await Test.createTestingModule({
      imports: [
        ConfigModule.forRoot(),
        SharedModule,
        EventModule,
        ApplicationModule,
        DatabaseModule,
        RabbitmqModuleFake.forRoot(),
        VideosModule,
      ],
    })
      .overrideProvider('UnitOfWork')
      .useFactory({
        factory: () => {
          return new UnitOfWorkInMemory();
        },
      })
      .compile();
    await module.init();
  });

  afterEach(async () => {
    await module?.close();
  });

  it('should register handlers', async () => {
    const eventemitter2 = module.get<EventEmitter2>(EventEmitter2);
    expect(
      eventemitter2.listeners(VideoAudioMediaUploadedIntegrationEvent.name),
    ).toHaveLength(1);
  });
});
