const express = require("express");
const { createServer } = require("http");
const { Server } = require("socket.io");

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer,{
  cors:{
    origin: '*'
  }
});

const arrServers = [];
let num = 0;
class classServer{
  constructor(data){
    this.number = num;
    this.name = data.name;
    this.master = data.master;
    this.game = data.game;
    this.people = [];
  }
  addPerson(name){
    this.people.push(name);
  }
}
const wantToJoin = []
io.on("connection", (socket) => {
  socket.on("c_vyhledatServers",(name)=>{
    return !wantToJoin.includes(name) ? socket.emit("s_servers",arrServers) : socket.emit("s_failed_name","Chyba tvého jména, už existuje");
  })
  socket.on("c_pripojitServer",(info)=>{
    socket.join(`room${info.number}`);
    const nms = arrServers.find(x => x.number === info.number);
    if(typeof nms === "undefined") return console.log("problem");
    nms.addPerson(info.name);
    return io.to(`room${info.number}`).emit("s_joined",{message:`Uživatel ${info.name} se připojil`,name:info.name});
  })
  socket.on("c_vytvorServer",(data)=>{
    num+=1;
    const server = new classServer(data);
    server.addPerson(data.master);
    arrServers.push(server);
    socket.join(`room${num}`);
    return socket.emit("s_vytvorServer",{data:data,funguje:true});
  })
  socket.on("c_start",(number)=>{
    return io.to(`room${number}`).emit("s_start",{status:true,url:"://"});
  })
  socket.on("disconnecting",async()=>{
    return console.log(`Odpojil se. Nyní počet klientů: ${io.engine.clientsCount} a hledá připojení: ${wantToJoin.length}`);
  })
  socket.on("disconnect",()=>{
    console.log("[socket] - konec");
  })
});

httpServer.listen(3010, ()=>{console.log("[Socket.io] express už běží!")});