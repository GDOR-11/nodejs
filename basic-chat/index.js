import {standardGetRequestListener, standardEJSgetRequestListener, standardRedirectRequestListener} from "./standardListeners.js";
import {processEJSfile} from "./fileManagement.js";
import {readRequestBody, sendUnsuccessfulResponse} from "./requestResponseUtils.js";
import socketio from "socket.io";
import http from "http";



const requestListeners = {
    GET: {
        "/login": standardEJSgetRequestListener("public/login.ejs"),
        "/index.js": standardGetRequestListener("public/index.js"),
        "/message.js": standardGetRequestListener("public/message.js"),
        "/": standardRedirectRequestListener("/login")
    },
    POST: {
        "/": async (req, res) => {
            let requestBody = await readRequestBody(req);
            if(requestBody == null) {
                sendUnsuccessfulResponse(res, 400);
                return;
            }
        
            // turn request body into an object
            let requestBodyData = Object.fromEntries(new URLSearchParams(requestBody));
        
            let processedFile = await processEJSfile("public/index.ejs", requestBodyData);
            if(processedFile == null) {
                sendUnsuccessfulResponse(res, 400);
                return;
            }
        
            res.end(processedFile);
        }
    }
};

const server = http.createServer((req, res) => {
    if(!requestListeners[req.method]) {
        sendUnsuccessfulResponse(res, 400);
        return;
    }
    if(!requestListeners[req.method][req.url]) {
        sendUnsuccessfulResponse(res, 404);
        return;
    }
    requestListeners[req.method][req.url](req, res);
});


const sockets = socketio(server);

const usernames = {};
const chatHistory = [];

sockets.on("connection", socket => {
    socket.on("username", username => {
        usernames[socket.id] = username;
    });

    socket.emit("chat history", chatHistory);

    socket.on("new message", messageText => {
        let message = new Message();
        message.text = messageText.trim();
        message.user = usernames[socket.id];
        message.time = new Date().getTime();

        chatHistory.push(message);
        sockets.emit("new message", message);
    });
});


server.listen(3000);