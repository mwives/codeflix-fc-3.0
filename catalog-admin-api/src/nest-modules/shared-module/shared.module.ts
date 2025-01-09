import { GoogleCloudStorage } from '@core/shared/infra/storage/google-cloud.storage';
import { Storage as GoogleCloudStorageSdk } from '@google-cloud/storage';
import { Global, Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Global()
@Module({
  providers: [
    {
      provide: 'IStorage',
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const credentials = configService.get('GOOGLE_CLOUD_CREDENTIALS');
        const bucket = configService.get('GOOGLE_CLOUD_STORAGE_BUCKET_NAME');
        const storage = new GoogleCloudStorageSdk({
          credentials,
        });
        return new GoogleCloudStorage(storage, bucket);
      },
    },
  ],
})
export class SharedModule {}
