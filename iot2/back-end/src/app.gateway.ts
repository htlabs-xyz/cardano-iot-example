import { Socket } from 'socket.io';
import {
    WebSocketGateway,
    WebSocketServer,
    OnGatewayConnection,
    OnGatewayDisconnect,
    SubscribeMessage,
    MessageBody,
    WsException
} from '@nestjs/websockets';
import { Server } from 'socket.io';
import { UseInterceptors, UsePipes } from '@nestjs/common';
import { SocketValidationPipe } from './gateway/socket.pipe';
import { AppService } from './app.service';
import { ResponseWsInterceptor } from './gateway/socket.interceptor';
import { ErrorEventName } from './gateway/socket.decorator';
import LockRequestModel from './models/lock-request.model';
import AuthorizeRequestModel from './models/authorize-request.model';

//QUY ĐỊNH: tiền tố on: event listener in client from server
//          tiền tố new: event sender from client to server
@UseInterceptors(ResponseWsInterceptor)
@UsePipes(new SocketValidationPipe({ transform: true }))
@WebSocketGateway({
    cors: { origin: '*' },
    path: ''
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {

    constructor(private readonly appService: AppService) { }

    @WebSocketServer()
    server: Server;
    private clients: string[] = [];

    handleConnection(client: Socket) {
        console.log('New user connected', client.id);
        client.broadcast.emit('onConnected', {
            message: `New user joined the server: ${client.id}`
        });

        this.clients.push(client.id);
    }

    handleDisconnect(client: Socket) {
        console.log('user disconnected...', client.id);
        this.server.emit('onDisconnected', {
            message: `User left the server: ${client.id}`
        });

        this.clients = this.clients.filter(id => id !== client.id);
    }

    @ErrorEventName('onError')
    @SubscribeMessage("newLockStatus")
    async handleUpdateNewLockStatus(@MessageBody() payload: LockRequestModel) {
        var res = await this.appService.updateStatusDevice(payload);
        this.server.emit('onUpdatedLockStatus', res);
    }

    @ErrorEventName('onError')
    @SubscribeMessage("newAuthorize")
    async handleUpdateNewAuthorize(@MessageBody() payload: AuthorizeRequestModel) {
        var res = await this.appService.authorize(payload);
        this.server.emit('onAuthorize', res);
    }


}