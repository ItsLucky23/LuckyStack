import dotenv from 'dotenv';
dotenv.config();

import handleApiRequest from "./handleApiRequest";
import { getSession, saveSession } from "./functions/session";
import { Server as SocketIOServer } from 'socket.io';
import { tryCatch } from "./functions/tryCatch";
import path from "path";
import fs from "fs";
import handleSyncRequest from "./handleSyncRequest";
import allowedOrigin from './checkOrigin';

//* here we load the server callbacks
const serverCbs = {};
export const initializeServerCallbacks = async () => {
  const syncFolder = fs.readdirSync(path.resolve('./server/sync'));
  Object.assign(serverCbs, {});

  for (const file of syncFolder) {
    const fileHandler = path.posix.join('./server/sync', file);
    if (fs.statSync(fileHandler).isFile() && file.endsWith('.ts')) {
      const [error, result] = await tryCatch(async() => await import(`../${fileHandler}`))
      if (error) { console.log(error); return; }
      for(const func in result) {
        serverCbs[func] = result[func];
      }
    }
  }
}

type apiMessage = {
  name: string;
  data: object;
  responseIndex: number;
}

export default function loadSocket(httpServer: any) {

  //* here we create the SocketIOServer instance
  const location = process.env.NODE_ENV == "development" ?
    process.env.FRONTEND_URL || '/':
    `http${process.env.SECURE == 'true' ? 's' : ''}://${process.env.SERVER_IP}:${process.env.SERVER_PORT}/`;

  console.log('starting socket server')
  const io = new SocketIOServer(httpServer, {
    cors: { 
      methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
      origin: (origin, callback) => {
        // console.log('socketIO current allowed origin: ', location, 'current origin: ', origin)
        if (!origin || allowedOrigin(origin)) {
          callback(null, true);
        } else {
          callback(new Error('Not allowed by CORS'));
        }
      },
      credentials: true,
    }
  });

  //* when a client connects to the SocketIO server we define there cookies and define some events to work with the exports of serverRequest.ts on the client
  io.on('connection', (socket) => {

    const cookie = socket.handshake.headers.cookie; // get the cookie from the socket connection
    const token = cookie ? cookie.split("=")[1] : null; 
    console.log(`a user connected with token: ${token}`);
  
    socket.on('apiRequest', async (msg: apiMessage) => {
  
      //* this event gets triggerd when the client uses the apiRequest function from serverRequest.ts
      //* we check if the msg contains a name and check if there is a api that exist with this name, if so we pass the data and the users session data to the api and return the response
      if (typeof msg != 'object' ) {
        console.log('message', 'socket message was not a json object')
        return socket.emit('message', 'socket message was not a json object');
      }

      const { name, data, responseIndex } = msg;
      // if (!token) { return socket.emit('message', 'no token provided') }
      const user = await getSession(token || '')

      //* if the name of the apiRequest is 'session' we return the users session data else we check if there is an api with this name
      if (name == 'session') {
        return socket.emit(`apiResponse-${responseIndex}`, JSON.stringify({ result: user }))
      }
  
      if (!name || !data || typeof name != 'string' || typeof data != 'object') {
        return socket.emit('message', `socket message was incomplete, name: ${name}, data: ${JSON.stringify(data)}`)
      }
  
      const response = await handleApiRequest({ name, data, user });
      return socket.emit(`apiResponse-${responseIndex}`, JSON.stringify(response));
    });





  
    type syncMessage = {
      name: string;
      data: object;
      cb: string;
    }
  
    socket.on('sync', async (msg: syncMessage) => {
      //* this event gets triggerd when the client uses the syncRequest function from serverRequest.ts
      //* we check if the msg contains a name and if it does we trigger the corresponding sync function with the data object and the users session data and return the response
      //* we function is ran for every connected client

      if (typeof msg!= 'object' ) {
        console.log('message','socket message was not a json object')
        return socket.emit('sync','socket message was not a json object');
      }
  
      const { name, data, cb } = msg;
  
      if (!name ||!data || typeof name !='string' || typeof data != 'object') {
        return socket.emit('sync', `socket message was incomplete, syncName: ${name}, syncData: ${JSON.stringify(data)}`)
      }
  
      if (!cb || typeof cb!='string') {
        return socket.emit('sync', `socket message was incomplete, cb: ${cb}`)
      }
  
      const sockets = io.sockets.sockets;
      let tempCount = 0;
      //* here we loop over all the connected clients
      for (const tempSocket of sockets) {
        if (tempCount > 100) { await new Promise(resolve => setTimeout(resolve, 1)); }
        tempCount++;

        //* check if they have a cookie that holds an token, if not we skip this client
        const tempCookie = tempSocket[1].handshake.headers.cookie;

        const tempToken = tempCookie ? tempCookie.split("=")[1] : ''; 
        // if (!tempToken) { continue }

        //* here we get the users session of the client and run the sync function with the data and the users session data
        const user = await getSession(tempToken);
        const response: any = await handleSyncRequest({ name, data, user });

        if (response.error && process.env.NODE_ENV == 'development') {
          //* when in development mode we send the error to the client so we can see it in the console
          tempSocket[1].emit('sync', JSON.stringify({ ...response, cb }));
          // return socket.emit('sync', JSON.stringify({...response, cb }));
        } else if (response?.serverData) {
          //* here we return the data if the returned value is an truethy value
          //* we send the response to the client with the cb name so the client can trigger the corresponding callback
          tempSocket[1].emit('sync', JSON.stringify({ ...response, cb }));
        } else if (response.error) { 
          continue; 
        } 
      }

      
    });
    
    socket.on('disconnect', () => {
      console.log('user disconnected');
    });
    
    socket.on('updateLocation', async (location) => {
      //* event gets triggerd when the user navigates to a different route and we update the location in the users session data
      //* we check if the user has a token and if they have a token we check if there is session data linked to the token and if so we update the location  
      if (!token) { return; }
      const user = await getSession(token);
      if (!user || Object.keys(user).length == 0) { return; }
      user.location = location;
      return await saveSession(token, user);
    });
  
  });
  return io;
}