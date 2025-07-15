import { SchemaRegistryClient } from '@confluentinc/schemaregistry';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { SchemaRegistryDeserializer } from 'src/nest-modules/kafka-module/schema-registry-deserializer';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['kafka:29092'],
      },
      consumer: {
        groupId: 'categories-consumer' + Math.random(),
      },
      deserializer: new SchemaRegistryDeserializer(
        new SchemaRegistryClient({ baseURLs: ['http://schema-registry:8081'] }),
      ),
    },
  });
  await app.listen();
}
bootstrap();
