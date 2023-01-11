const express = require("express");
const http = require("http");
const socketio = require("socket.io");

const app = express();
const server = http.createServer(app);
const sockets = socketio(server);

app.use(express.static("public"));


const chatHistory = ["hello there", "hello :)"];


sockets.on("connection", socket => {
    const id = socket.id;
    console.log(socket.id + " connected");

    socket.emit("chat history", chatHistory);
});

sockets.on("new message", message => {
    chatHistory.push(message);
});

server.listen(3000, () => {
    console.log("Server listening on port 3000");
});