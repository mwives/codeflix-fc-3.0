import {
  AvroDeserializer,
  SchemaRegistryClient,
  SerdeType,
} from '@confluentinc/schemaregistry';
import { IncomingEvent, IncomingRequest } from '@nestjs/microservices';
import { KafkaRequestDeserializer } from '@nestjs/microservices/deserializers/kafka-request.deserializer';

export class SchemaRegistryDeserializer extends KafkaRequestDeserializer {
  constructor(protected schemaRegistry: SchemaRegistryClient) {
    super();
  }

  deserialize(
    value: any, // message
    options?: Record<string, any>, // options: { channel: string; pattern: string; }
  ): IncomingRequest | IncomingEvent {
    if (!options) {
      return {
        pattern: undefined, // topic
        data: undefined, // message value
      };
    }
    try {
      const magicByte = value.value[0];
      if (magicByte === 0x00) {
        const deserializer = new AvroDeserializer(
          this.schemaRegistry,
          SerdeType.VALUE,
          {},
        );
        return {
          pattern: options?.channel,
          data: deserializer.deserialize(options?.channel, value.value) as any,
        };
      }
    } catch (error) {
      console.error('Deserialization error:', error);
      return {
        pattern: options?.channel,
        data: value.value, // Return raw value if deserialization fails
      };
    }

    return super.deserialize(value, options);
  }
}
