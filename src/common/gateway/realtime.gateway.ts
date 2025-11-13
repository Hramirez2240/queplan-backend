import { WebSocketGateway, WebSocketServer, OnGatewayInit } from '@nestjs/websockets';
import { Server } from 'socket.io';
import { Injectable, Logger } from '@nestjs/common';
import { DbListenerService } from '../listener/db-listener.service';

@WebSocketGateway({
  cors: { origin: process.env.CORS_ORIGIN || '*' },
})
@Injectable()
export class RealtimeGateway implements OnGatewayInit {
  @WebSocketServer() server!: Server;
  private readonly logger = new Logger(RealtimeGateway.name);

  constructor(private readonly dbListener: DbListenerService) {}

  afterInit() {
    this.dbListener.onChange = (payload) => {
      this.server.emit('db-change', payload);
      this.logger.log(`Emitido evento db-change → clientes (${JSON.stringify(payload)})`);
    };
  }
}
