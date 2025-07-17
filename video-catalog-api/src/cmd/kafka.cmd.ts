import { SchemaRegistryClient } from '@confluentinc/schemaregistry';
import { NestFactory } from '@nestjs/core';
import { ConfluentKafkaServer } from 'src/nest-modules/kafka-module/confluent/confluent-kafka-server';
import { KConnectEventPatternRegister } from 'src/nest-modules/kafka-module/kconnect-event-pattern.register';
import { SchemaRegistryDeserializer } from 'src/nest-modules/kafka-module/schema-registry-deserializer';
import { AppModule } from '../app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice(AppModule, {
    strategy: new ConfluentKafkaServer({
      server: {
        'bootstrap.servers': 'localhost:9092',
      },
      consumer: {
        allowAutoTopicCreation: true,
        sessionTimeout: 10000,
        rebalanceTimeout: 10000,
      },
      deserializer: new SchemaRegistryDeserializer(
        new SchemaRegistryClient({ baseURLs: ['http://localhost:8083'] }),
      ),
    }),
  });

  await app.get(KConnectEventPatternRegister).registerKConnectTopicDecorator();

  await app.listen();
}
bootstrap();
