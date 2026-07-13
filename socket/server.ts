import { createServer } from "http";
import { Server } from "socket.io";
import { setIO } from "./io";
import express from "express";

const app= express();
app.use(express.json());

//connect the http server to express
//so the same server handles http requests(/emit) and socket.io connections using port 4000
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: "http://localhost:3000",
    methods: ["GET", "POST"],
  },
  });

  //take this server instance and put  it in io.ts locker

  setIO(io);


//listens for new clients connecting
  io.on("connection",(socket)=>{
    console.log("Client Connected",socket.id);
//listens to msgs from one client connected

//join match is sent by the fe for joingn tht match
    socket.on("join_match", (matchId : string)=>{
      //tells the server to put the socket into a room
      socket.join(matchId);

    console.log(`${socket.id} joined room ${matchId}`);
  });
    socket.on("disconnect",()=>{
        console.log("disconnected",socket.id);
    })
  });
  
  app.post("/emit", (req,res) =>{
    console.log(req.body);
    const { room, event } = req.body;
    
    io.to(room).emit(event);

    res.json({
      success: true
    })

  });

  //start server
  httpServer.listen(4000,()=>{
    console.log("Socket server running on port 4000");
  })

