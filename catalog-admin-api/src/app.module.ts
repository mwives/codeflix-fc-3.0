import { Module } from '@nestjs/common';
import { ConfigModule } from './nest-modules/config-module/config.module';
import { DatabaseModule } from './nest-modules/database-module/database.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
})
export class AppModule {}
