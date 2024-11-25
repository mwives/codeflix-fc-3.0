import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { Module } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SequelizeModule } from '@nestjs/sequelize';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config-module/config.module';

const models = [CategoryModel];

@Module({
  imports: [
    SequelizeModule.forRootAsync({
      useFactory: (configService: ConfigService<CONFIG_SCHEMA_TYPE>) => {
        const dbVendor = configService.get('DB_VENDOR');

        if (dbVendor === 'sqlite') {
          return {
            dialect: 'sqlite',
            host: configService.get('DB_HOST'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTOLOAD'),
            models,
          };
        }

        if (dbVendor === 'mysql') {
          return {
            dialect: 'mysql',
            host: configService.get('DB_HOST'),
            port: configService.get('DB_PORT'),
            username: configService.get('DB_USERNAME'),
            password: configService.get('DB_PASSWORD'),
            database: configService.get('DB_DATABASE'),
            logging: configService.get('DB_LOGGING'),
            autoLoadModels: configService.get('DB_AUTOLOAD'),
            models,
          };
        }

        throw new Error('Invalid DB vendor');
      },
      inject: [ConfigService],
    }),
  ],
})
export class DatabaseModule {}
