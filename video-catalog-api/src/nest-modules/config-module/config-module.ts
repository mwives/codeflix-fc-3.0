import { DynamicModule } from '@nestjs/common';
import {
  ConfigModuleOptions,
  ConfigModule as NestConfigModule,
} from '@nestjs/config';
import Joi from 'joi';
import { join } from 'path';
import { configuration } from './configuration';

const joiJson = Joi.extend((joi) => {
  return {
    type: 'object',
    base: joi.object(),
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    coerce(value, _schema) {
      if (value[0] !== '{' && !/^\s*\{/.test(value)) {
        return;
      }

      try {
        return { value: JSON.parse(value) };
      } catch (err) {
        console.log(err);
      }
    },
  };
});

type ELASTIC_SEARCH_ENV_SCHEMA_TYPE = {
  ELASTIC_SEARCH_HOST: string;
  ELASTIC_SEARCH_INDEX: string;
};

export const CONFIG_ELASTIC_SEARCH_ENV_SCHEMA: Joi.StrictSchemaMap<ELASTIC_SEARCH_ENV_SCHEMA_TYPE> =
  {
    ELASTIC_SEARCH_HOST: Joi.string().required(),
    ELASTIC_SEARCH_INDEX: Joi.string().required(),
  };

export type Configuration = {
  elastic_search: {
    host: string;
    index: string;
  };
};

export class ConfigModule extends NestConfigModule {
  static async forRoot(
    options: ConfigModuleOptions = {},
  ): Promise<DynamicModule> {
    const { envFilePath, ...otherOptions } = options;

    return super.forRoot({
      isGlobal: true,
      envFilePath: [
        ...(Array.isArray(envFilePath) ? envFilePath! : [envFilePath!]),
        join(__dirname, `../../../envs/.env.${process.env.NODE_ENV}`),
        join(__dirname, '../../../envs/.env'),
        // join(process.cwd(), `/envs/.env.${process.env.NODE_ENV}`),
        // join(process.cwd(), '/envs/.env'),
      ],
      load: [configuration],
      validationSchema: joiJson.object({
        ...CONFIG_ELASTIC_SEARCH_ENV_SCHEMA,
      }),
      ...otherOptions,
    });
  }
}
