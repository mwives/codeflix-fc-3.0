import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { KConnectEventPatternRegister } from './kconnect-event-pattern.register';

@Module({
  imports: [DiscoveryModule, ConfigModule],
  providers: [KConnectEventPatternRegister],
  exports: [KConnectEventPatternRegister],
})
export class KafkaModule {}
