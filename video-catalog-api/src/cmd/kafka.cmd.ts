import { SchemaRegistryClient } from '@confluentinc/schemaregistry';
import { NestFactory } from '@nestjs/core';
import { RetryTopicNaming } from 'kafkajs-async-retry';
import { ConfluentKafkaRetriableServer } from 'src/nest-modules/kafka-module/confluent/confluent-kafka-retriable-server';
import { KafkaConsumeErrorFilter } from 'src/nest-modules/kafka-module/kafka-consume-error.filter';
import { KConnectEventPatternRegister } from 'src/nest-modules/kafka-module/kconnect-event-pattern.register';
import { SchemaRegistryDeserializer } from 'src/nest-modules/kafka-module/schema-registry-deserializer';
import { AppModule } from '../app.module';

async function bootstrap() {
  // const app = await NestFactory.createMicroservice(AppModule, {
  //   strategy: new ConfluentKafkaServer({
  //     server: {
  //       'bootstrap.servers': 'localhost:9092',
  //     },
  //     consumer: {
  //       allowAutoTopicCreation: true,
  //       sessionTimeout: 10000,
  //       rebalanceTimeout: 10000,
  //     },
  //     deserializer: new SchemaRegistryDeserializer(
  //       new SchemaRegistryClient({ baseURLs: ['http://localhost:8083'] }),
  //     ),
  //   }),
  // });

  const app = await NestFactory.createMicroservice(AppModule, {
    strategy: new ConfluentKafkaRetriableServer({
      asyncRetryConfig: {
        maxRetries: 3,
        maxWaitTime: 120000,
        retryDelays: [1, 3, 9],
        //retryDelays: [5, 30, 60],
        retryTopicNaming: RetryTopicNaming.ATTEMPT_BASED,
      },
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

  app.useGlobalFilters(new KafkaConsumeErrorFilter());

  await app.get(KConnectEventPatternRegister).registerKConnectTopicDecorator();

  await app.listen();
}
bootstrap();
