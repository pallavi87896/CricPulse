//it is a singleton , stores the socket.io server instace , so any file cud access it 

import { Server } from "socket.io";

let io: Server | null= null;
//reserves the place to store the socket.io server

export function setIO(socketServer: Server) {
    io = socketServer;
}

//hands over the same socketio we locked up before so the fe cud access it
export function getIO() {
    if(!io) {
        throw new Error("socket.io server not initalized");
    }

    return io;

}