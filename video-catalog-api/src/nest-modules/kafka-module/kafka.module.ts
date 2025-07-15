import { DiscoveryModule } from '@golevelup/nestjs-discovery';
import { Module } from '@nestjs/common';
import { KConnectEventPatternRegister } from './kconnect-event-pattern.register';

@Module({
  imports: [DiscoveryModule],
  providers: [KConnectEventPatternRegister],
  exports: [KConnectEventPatternRegister],
})
export class KafkaModule {}
