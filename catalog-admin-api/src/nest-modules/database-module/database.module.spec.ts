import { getConnectionToken } from '@nestjs/sequelize';
import { Test } from '@nestjs/testing';
import { Sequelize } from 'sequelize-typescript';
import { ConfigModule } from 'src/nest-modules/config-module/config.module';
import { DatabaseModule } from './database.module';

describe('DatabaseModule', () => {
  describe('sqlite', () => {
    const connOptions = {
      DB_VENDOR: 'sqlite',
      DB_HOST: ':memory:',
      DB_LOGGING: false,
      DB_AUTOLOAD: true,
    };

    it('should create a sqlite connection', async () => {
      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptions],
          }),
        ],
      }).compile();
      const app = module.createNestApplication();

      const conn = app.get<Sequelize>(getConnectionToken());

      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe('sqlite');
      expect(conn.options.host).toBe(':memory:');
      expect(conn.models).toBeDefined();

      await conn.close();
    });
  });

  describe('mysql', () => {
    const connOptions = {
      DB_VENDOR: 'mysql',
      DB_HOST: 'localhost',
      DB_PORT: 3306,
      DB_USERNAME: 'root',
      DB_PASSWORD: 'root',
      DB_DATABASE: 'micro_videos',
      DB_LOGGING: false,
      DB_AUTOLOAD: true,
    };

    it('should create a mysql connection', async () => {
      const module = await Test.createTestingModule({
        imports: [
          DatabaseModule,
          ConfigModule.forRoot({
            isGlobal: true,
            ignoreEnvFile: true,
            ignoreEnvVars: true,
            validationSchema: null,
            load: [() => connOptions],
          }),
        ],
      }).compile();

      const app = module.createNestApplication();
      const conn = app.get<Sequelize>(getConnectionToken());

      expect(conn).toBeDefined();
      expect(conn.options.dialect).toBe(connOptions.DB_VENDOR);
      expect(conn.options.host).toBe(connOptions.DB_HOST);
      expect(conn.options.database).toBe(connOptions.DB_DATABASE);
      expect(conn.options.username).toBe(connOptions.DB_USERNAME);
      expect(conn.options.password).toBe(connOptions.DB_PASSWORD);
      expect(conn.options.port).toBe(connOptions.DB_PORT);

      await conn.close();
    });
  });
});
