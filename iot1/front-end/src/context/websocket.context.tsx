
import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';
import envConfig from '../config';

export const socket = io(envConfig.NEXT_PUBLIC_WEBSOCKET);
export const WebsocketContext = createContext<Socket>(socket);
export const WebsocketProvider = WebsocketContext.Provider;