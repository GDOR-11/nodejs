import {standardGetRequestListener, standardEJSgetRequestListener, standardRedirectRequestListener} from "./requestListenerUtils.js";
import {processEJSfile, readFile} from "./fileManagement.js";
import {readRequestBody, sendUnsuccessfulResponse} from "./requestAndResponseUtils.js";
import socketio from "socket.io";
import http from "http";
import {checkUsername, UsernameStatusCodes, UsernameStatusCodeMessages} from "./usernameManagement.js";
import querystring from "querystring";
import * as database from "./database.js";
import readline from "readline";
// import {stdin, stdout} from "process";
import repl from "repl";



/**
 * the request listeners for every valid METHOD and URL (acess requestListeners[`${METHOD} ${URL}`] to get the appropriate request listener)
 * @example
 * requestListeners["GET /login"]
 * requestListeners["POST /"]
 * @const {Object} requestListeners
 * @default
 */
const requestListeners = {
    "GET /login": standardEJSgetRequestListener("public/login.ejs"),
    "GET /index.js": standardGetRequestListener("public/index.js"),
    "GET /message.js": standardGetRequestListener("public/message.js"),

    "GET /": standardRedirectRequestListener("/login"),
    "POST /": async (req, res, query) => {
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
    },

    "GET /checkUsername": async (req, res, query) => {
        if(!query.username) {
            res.statusCode = 400;
            res.end();
            return;
        }
        
        let usernameStatus = await checkUsername(query.username);
        res.setHeader("content-type", "application/json");
        if(usernameStatus == UsernameStatusCodes.valid) {
            res.end(`{"valid": true}`);
        } else {
            res.end(`{"valid": false, "message": "${UsernameStatusCodeMessages[usernameStatus]}"}`);
        }
    }
};


const server = http.createServer(async (req, res) => {
    try {
        let [url, queryString] = req.url.split('?');
        let query = querystring.parse(queryString);

        if(!requestListeners[`${req.method} ${url}`]) {
            sendUnsuccessfulResponse(res, 404);
        }
        
        requestListeners[`${req.method} ${url}`](req, res, query);
    } catch(error) {
        try {
            console.log("Error while responding to the client:");
            console.error(error);
            sendUnsuccessfulResponse(res, 500);
        } catch(veryBadError) {
            console.log("Error while sending unsuccessful response code 500:");
            console.error(veryBadError);
            res.setHeader("content-type", "text/html");
            res.end("<h2>Sorry, a severe internal error happened. If the error persists try again tomorrow or something like that lol</h2>");
        }
    }
});


const sockets = socketio(server);

sockets.on("connection", socket => {
    let user;
    socket.on("username", username => {
        user = {socketID: socket.id, username: username};
        database.addUser(username);
    });

    getMessages().then(messages => {
        for(let i = 0;i < messages.length;i++) {
            messages[i] = {
                text: messages[i].text,
                user: messages[i].userID
            };
        }
    }).catch((err) => {
        
    });
    socket.emit("chat history", chatHistory);

    socket.on("new message", messageText => {
        let text = messageText.trim();
        let time = new Date().getTime();

        database.addMessage({
            text: messageText.trim(),
            userID: user.socketID,
            time: time
        });
        sockets.emit("new message", message);
    });
});

server.listen(3000, async () => {
    console.log("server listening on port 3000");
});