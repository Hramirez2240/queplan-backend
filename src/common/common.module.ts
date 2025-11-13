import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { DbListenerService } from './listener/db-listener.service';
import { RealtimeGateway } from './gateway/realtime.gateway';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
  ],
  providers: [DbListenerService, RealtimeGateway],
  exports: [DbListenerService, RealtimeGateway],
})
export class CommonModule {}
