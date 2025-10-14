
import { createContext } from 'react';
import { io, Socket } from 'socket.io-client';


export const socket = io(process.env.NEXT_PUBLIC_API_ENDPOINT);
export const WebsocketContext = createContext<Socket>(socket);
export const WebsocketProvider = WebsocketContext.Provider;