import { Test, TestingModule } from '@nestjs/testing';
import Joi from 'joi';
import { CONFIG_DB_SCHEMA, ConfigModule } from './config.module';

function expectValidate(schema: Joi.Schema, value: unknown) {
  return expect(schema.validate(value, { abortEarly: false }).error.message);
}

describe('DB_SCHEMA_TYPE', () => {
  const schema = Joi.object({
    ...CONFIG_DB_SCHEMA,
  });

  describe('DB_VENDOR', () => {
    const dbVendorErrorMessage = '"DB_VENDOR" must be one of [mysql, sqlite]';

    it('should require DB_VENDOR', () => {
      expectValidate(schema, {}).toContain('"DB_VENDOR" is required');
    });

    it('should validate DB_VENDOR', () => {
      expectValidate(schema, { DB_VENDOR: 'invalid' }).toContain(
        dbVendorErrorMessage,
      );
    });

    it('should validate DB_VENDOR with mysql', () => {
      expectValidate(schema, { DB_VENDOR: 'mysql' }).not.toContain(
        dbVendorErrorMessage,
      );
    });
  });

  describe('DB_HOST', () => {
    it('should require DB_HOST', () => {
      expectValidate(schema, {}).toContain('"DB_HOST" is required');
    });
  });

  describe('DB_PORT', () => {
    it('should require DB_PORT with mysql', () => {
      expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
        '"DB_PORT" is required',
      );
    });
  });

  describe('DB_USERNAME', () => {
    it('should require DB_USERNAME with mysql', () => {
      expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
        '"DB_USERNAME" is required',
      );
    });
  });

  describe('DB_PASSWORD', () => {
    it('should require DB_PASSWORD with mysql', () => {
      expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
        '"DB_PASSWORD" is required',
      );
    });
  });

  describe('DB_DATABASE', () => {
    it('should require DB_DATABASE with mysql', () => {
      expectValidate(schema, { DB_VENDOR: 'mysql' }).toContain(
        '"DB_DATABASE" is required',
      );
    });
  });

  describe('DB_LOGGING', () => {
    it('should require DB_LOGGING', () => {
      expectValidate(schema, {}).toContain('"DB_LOGGING" is required');
    });
  });

  describe('DB_AUTOLOAD', () => {
    it('should require DB_AUTOLOAD', () => {
      expectValidate(schema, {}).toContain('"DB_AUTOLOAD" is required');
    });
  });
});

describe('ConfigModule', () => {
  let module: TestingModule;

  it('should throw error on invalid configuration', async () => {
    process.env.DB_VENDOR = 'mysql';
    process.env.DB_HOST = ''; // Invalid: Required field
    process.env.DB_PORT = 'not-a-number'; // Invalid: Should be a number

    await expect(
      Test.createTestingModule({
        imports: [ConfigModule.forRoot()],
      }).compile(),
    ).rejects.toThrow(
      /"DB_HOST" is not allowed to be empty.*"DB_PORT" must be a number/,
    );
  });

  it('should be defined with valid configuration', async () => {
    process.env.DB_VENDOR = 'mysql';
    process.env.DB_HOST = 'localhost';
    process.env.DB_PORT = '3306';
    process.env.DB_USERNAME = 'root';
    process.env.DB_PASSWORD = 'password';
    process.env.DB_DATABASE = 'testdb';
    process.env.DB_LOGGING = 'true';
    process.env.DB_AUTOLOAD = 'true';

    module = await Test.createTestingModule({
      imports: [ConfigModule.forRoot()],
    }).compile();

    expect(module).toBeDefined();
  });
});
