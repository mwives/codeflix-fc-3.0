import { SchemaRegistryClient } from '@confluentinc/schemaregistry';
import { NestFactory } from '@nestjs/core';
import { Transport } from '@nestjs/microservices';
import { KConnectEventPatternRegister } from 'src/nest-modules/kafka-module/kconnect-event-pattern.register';
import { SchemaRegistryDeserializer } from 'src/nest-modules/kafka-module/schema-registry-deserializer';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    transport: Transport.KAFKA,
    options: {
      client: {
        brokers: ['localhost:9092'],
      },
      consumer: {
        groupId: 'categories-consumer' + Math.random(),
      },
      deserializer: new SchemaRegistryDeserializer(
        new SchemaRegistryClient({ baseURLs: ['http://localhost:8083'] }),
      ),
    },
  });

  await app.get(KConnectEventPatternRegister).registerKConnectTopicDecorator();
  await app.listen();
}
bootstrap();
