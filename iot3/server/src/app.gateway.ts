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

/**
 * @description AppGateway — WebSocket gateway for real-time communication in IoT vending machine operations.
 *
 * Responsibilities:
 * - Manages WebSocket connections for real-time client updates
 * - Handles client connection and disconnection events
 * - Broadcasts inventory updates and system notifications
 * - Maintains active client connection registry
 * - Provides real-time communication channel for device state changes
 *
 * Notes:
 * - Uses Socket.IO for WebSocket implementation with CORS enabled
 * - Implements NestJS WebSocket decorators for lifecycle management
 * - Integrates custom interceptors and validation pipes
 * - Supports broadcasting to all connected clients or specific rooms
 */
@UseInterceptors(ResponseWsInterceptor)
@UsePipes(new SocketValidationPipe({ transform: true }))
@WebSocketGateway({
  cors: { origin: '*' },
  path: '',
})
export class AppGateway implements OnGatewayConnection, OnGatewayDisconnect {
  /**
   * @constructor
   * @description Initializes a new instance of AppGateway for WebSocket communication management.
   *
   * @example
   * // Automatically instantiated by NestJS WebSocket module
   * const gateway = new AppGateway();
   */
  constructor() {}

  /**
   * @description Socket.IO server instance for broadcasting messages to connected clients.
   */
  @WebSocketServer()
  public server: Server;

  /**
   * @description Array maintaining list of currently connected client IDs for tracking purposes.
   */
  private clients: string[] = [];

  /**
   * @description Handles new WebSocket client connections and broadcasts connection events.
   *
   * Details:
   * 1. Logs the new client connection with their unique ID
   * 2. Broadcasts connection notification to all other connected clients
   * 3. Adds the new client ID to the active clients registry
   *
   * @param {Socket} client - Socket.IO client instance representing the connected user.
   *
   * @example
   * // Automatically called when a client connects
   * // Emits: { message: "New user joined the server: abc123" }
   */
  handleConnection(client: Socket) {
    console.log('New user connected', client.id);
    client.broadcast.emit('onConnected', {
      message: `New user joined the server: ${client.id}`,
    });

    this.clients.push(client.id);
  }

  /**
   * @description Handles WebSocket client disconnections and broadcasts disconnection events.
   *
   * Details:
   * 1. Logs the client disconnection with their unique ID
   * 2. Broadcasts disconnection notification to all remaining connected clients
   * 3. Removes the client ID from the active clients registry
   *
   * @param {Socket} client - Socket.IO client instance representing the disconnecting user.
   *
   * @example
   * // Automatically called when a client disconnects
   * // Emits: { message: "User left the server: abc123" }
   */
  handleDisconnect(client: Socket) {
    console.log('user disconnected...', client.id);
    this.server.emit('onDisconnected', {
      message: `User left the server: ${client.id}`,
    });

    this.clients = this.clients.filter((id) => id !== client.id);
  }
}
