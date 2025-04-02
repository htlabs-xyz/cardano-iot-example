import { UseInterceptors, UsePipes } from '@nestjs/common';
import {
  OnGatewayConnection,
  OnGatewayDisconnect,
  WebSocketGateway,
  WebSocketServer,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';
import { ResponseWsInterceptor } from './gateway/socket.interceptor';
import { SocketValidationPipe } from './gateway/socket.pipe';

//QUY ĐỊNH: tiền tố on: event listener in client from server
//          tiền tố new: event sender from client to server

@UseInterceptors(ResponseWsInterceptor)
@UsePipes(new SocketValidationPipe({ transform: true }))
@WebSocketGateway({
  cors: { origin: '*' },
  path: '',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  constructor() {}

  @WebSocketServer()
  public server: Server;
  private clients: string[] = [];

  handleConnection(client: Socket) {
    console.log('New user connected', client.id);
    client.broadcast.emit('onConnected', {
      message: `New user joined the server: ${client.id}`,
    });

    this.clients.push(client.id);
  }

  handleDisconnect(client: Socket) {
    console.log('user disconnected...', client.id);
    this.server.emit('onDisconnected', {
      message: `User left the server: ${client.id}`,
    });

    this.clients = this.clients.filter((id) => id !== client.id);
  }
}
