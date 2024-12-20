import { CategoryModel } from '@core/category/infra/db/sequelize/category.model';
import { UnitOfWorkSequelize } from '@core/shared/infra/db/sequelize/unit-of-work-sequelize';
import { Global, Module, Scope } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getConnectionToken, SequelizeModule } from '@nestjs/sequelize';
import { CONFIG_SCHEMA_TYPE } from 'src/nest-modules/config-module/config.module';

const models = [CategoryModel];

@Global()
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
  providers: [
    {
      provide: UnitOfWorkSequelize,
      inject: [getConnectionToken()],
      useFactory: (sequelize) => new UnitOfWorkSequelize(sequelize),
      scope: Scope.REQUEST,
    },
    {
      provide: 'UnitOfWork',
      useExisting: UnitOfWorkSequelize,
      scope: Scope.REQUEST,
    },
  ],
  exports: ['UnitOfWork'],
})
export class DatabaseModule {}
