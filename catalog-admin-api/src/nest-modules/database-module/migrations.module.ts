import { Module } from '@nestjs/common';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { DatabaseModule } from './database.module';

@Module({
  imports: [ConfigModule.forRoot(), DatabaseModule],
})
export class MigrationsModule {}
