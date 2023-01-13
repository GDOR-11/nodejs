import {Message} from "./public/message.js";


import http from "http";
import fs from "fs"
import mime from "mime-types";
import socketio from "socket.io";

const requestListeners = {
    "GET": (req, res) => {
        if(req.url == "/") req.url = "/index.html";
        res.setHeader("Content-Type", mime.lookup(req.url));
        fs.readFile("public" + req.url, (err, data) => {
            if(err) {
                console.error("Could not read file \"public" + req.url + "\".\nError message:\n\n" + err + "\n\n");
                res.setHeader("Status", 404);
                res.end("No such file you dumbass");
                return;
            }
            res.end(data);
        });
    }
}

const server = http.createServer((req, res) => {
    if(!requestListeners[req.method]) {
        // do something lol
        res.end();
        return;
    }
    requestListeners[req.method](req, res);
});

const sockets = socketio(server);



const chatHistory = [];


sockets.on("connection", socket => {
    console.log(socket.id + " connected");

    socket.emit("chat history", chatHistory);

    socket.on("new message", message => {
        message.time = new Date().getTime();
        message.text = message.text.trim();
        chatHistory.push(message);
        sockets.emit("new message", message);
    });
});


server.listen(3000, () => {
    console.log("Server listening on port 3000");
});

// import express from "express";
// import http from "http";
// import socketio from "socket.io";

// const app = express();
// const server = http.createServer(app);
// const sockets = socketio(server);

// app.use(express.static("public"));




// server.listen(3000, () => {
//     console.log("Server listening on port 3000");
// });