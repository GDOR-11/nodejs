import {standardGetRequestListener, standardEJSgetRequestListener, standardRedirectRequestListener} from "./requestListenerUtils.js";
import {processEJSfile, readFile} from "./fileManagement.js";
import {readRequestBody, sendUnsuccessfulResponse} from "./requestAndResponseUtils.js";
import socketio from "socket.io";
import http, { Server } from "http";
import {checkUsername, UsernameStatusCodes, UsernameStatusCodeMessages} from "./usernameManagement.js";
import querystring from "querystring";
import {usernames, chatHistory} from "./dataManagement.js";
import readline from "readline/promises";
import {stdin, stdout} from "process";

/**
 * the request listeners for every valid METHOD and URL (acess requestListeners[`${METHOD} ${URL}`] to get the appropriate request listener)
 * @example
 * requestListeners["GET /login"]
 * requestListeners["POST /"]
 * @const {Object} requestListeners
 * @default
 */
const requestListeners = Object.freeze({
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
        
        
        let usernameStatus = checkUsername(query.username);
        res.setHeader("content-type", "application/json");
        if(usernameStatus == UsernameStatusCodes.valid) {
            res.end(`{"valid": true}`);
        } else {
            res.end(`{"valid": false, "message": "${UsernameStatusCodeMessages[usernameStatus]}"}`);
        }
    }
});


/**
 * http server
 * @const {Server} server
 */
const server = http.createServer(async (req, res) => {
    let [url, queryString] = req.url.split('?');
    let query = querystring.parse(queryString);

    if(!requestListeners[`${req.method} ${url}`]) {
        sendUnsuccessfulResponse(res, 404);
    }
    
    requestListeners[`${req.method} ${url}`](req, res, query);
});


/** @type {Server} websockets server */
const sockets = socketio(server);

sockets.on("connection", socket => {
    socket.on("username", username => {
        usernames[socket.id] = username;
    });

    socket.emit("chat history", chatHistory);

    socket.on("new message", messageText => {
        /** @type {import("./public/message.js").Message} */
        let message = {};
        message.text = messageText.trim();
        message.user = usernames[socket.id];
        message.time = new Date().getTime();

        chatHistory.push(message);
        sockets.emit("new message", message);
    });
});


server.listen(3000, async () => {
    console.log("server listening on port 3000");
    const rl = readline.createInterface({input: stdin, output: stdout});
    while(true) {
        const answer = await rl.question("> ");
        try {
            const output = (() => eval(answer))();
            console.log(output);
        } catch(error) {
            console.error(error);
        }
    }
});