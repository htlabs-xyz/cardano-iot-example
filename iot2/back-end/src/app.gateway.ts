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
 * @description AppGateway — manages real-time WebSocket connections for IoT lock status updates and client communication.
 *
 * Responsibilities:
 * - Handles WebSocket client connections and disconnections
 * - Broadcasts real-time lock status updates to connected clients
 * - Manages client session tracking and notification events
 * - Provides bi-directional communication channel for IoT lock operations
 *
 * Notes:
 * - Uses Socket.IO for WebSocket implementation with CORS enabled
 * - Integrates response interceptor and validation pipe for message processing
 * - Maintains list of connected clients for targeted broadcasting
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
   * @description Initializes a new instance of AppGateway with default configuration.
   *
   * @example
   * const gateway = new AppGateway();
   */
  constructor() {}

  /**
   * @description WebSocket server instance for broadcasting events to connected clients.
   */
  @WebSocketServer()
  public server: Server;

  /**
   * @description Array of connected client IDs for session tracking and management.
   */
  private clients: string[] = [];

  /**
   * @description Handles new WebSocket client connections and broadcasts connection events.
   *
   * Details:
   * 1. Logs the new client connection with unique ID
   * 2. Broadcasts connection notification to existing clients
   * 3. Adds client ID to active clients tracking list
   *
   * @param {Socket} client - Socket.IO client instance representing the new connection.
   *
   * @example
   * // Automatically called when a client connects via WebSocket
   * // Client receives: { message: "New user joined the server: socket_id" }
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
   * 1. Logs the client disconnection with unique ID
   * 2. Broadcasts disconnection notification to all remaining clients
   * 3. Removes client ID from active clients tracking list
   *
   * @param {Socket} client - Socket.IO client instance representing the disconnecting connection.
   *
   * @example
   * // Automatically called when a client disconnects from WebSocket
   * // All clients receive: { message: "User left the server: socket_id" }
   */
  handleDisconnect(client: Socket) {
    console.log('user disconnected...', client.id);
    this.server.emit('onDisconnected', {
      message: `User left the server: ${client.id}`,
    });

    this.clients = this.clients.filter((id) => id !== client.id);
  }
}
