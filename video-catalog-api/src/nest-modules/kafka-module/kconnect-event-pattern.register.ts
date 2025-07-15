import { DiscoveryService } from '@golevelup/nestjs-discovery';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventPattern } from '@nestjs/microservices';
import { K_CONNECT_TOPIC_METADATA } from './kconnect-event-pattern.decorator';

@Injectable()
export class KConnectEventPatternRegister {
  constructor(
    private readonly configService: ConfigService,
    private readonly discoverService: DiscoveryService,
  ) {}

  /**
   * This method must be called before microservice.listen()
   * Custom event patterns need to be registered early in the application lifecycle
   * Module initialization hooks (like onModuleInit) execute too late,
   * after the microservice has already scanned and registered default patterns
   */
  async registerKConnectTopicDecorator() {
    const methodsDiscovered =
      await this.discoverService.methodsAndControllerMethodsWithMetaAtKey(
        K_CONNECT_TOPIC_METADATA,
      );

    methodsDiscovered.forEach((method) => {
      const topicName = KConnectEventPatternRegister.kConnectTopicName(
        this.configService.get('kafka.connect_prefix') as string,
        method.meta as string,
      );
      Reflect.decorate(
        [EventPattern(topicName)],
        method.discoveredMethod.parentClass.injectType?.prototype,
        method.discoveredMethod.methodName,
        Reflect.getOwnPropertyDescriptor(
          method.discoveredMethod.parentClass.injectType?.prototype,
          method.discoveredMethod.methodName,
        ),
      );
    });
  }

  static kConnectTopicName(prefix: string, topic: string) {
    return `${prefix}.${topic}`;
  }
}
