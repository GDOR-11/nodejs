import Message from "./public/message.js";
import {standardGetRequestListener, standardEJSgetRequestListener, standardRedirectRequestListener} from "./requestListenerUtils.js";
import {processEJSfile, readFile} from "./fileManagement.js";
import {readRequestBody, sendUnsuccessfulResponse} from "./requestAndResponseUtils.js";
import socketio from "socket.io";
import http from "http";
import {checkUsername, UsernameStatusCodes, UsernameStatusCodeMessages} from "./usernameVerification.js";
import querystring from "querystring";
import mime from "mime-types";

/**
 * the request listeners for every valid METHOD and URL (acess requestListeners[`${METHOD} ${URL}`] to get the appropriate request listener)
 * @const {Object}
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
    "POST /checkUsername": (req, res, query) => {
        if(!query.username) {
            res.statusCode = 400;
            res.end();
            return;
        }
        let usernameStatus = checkUsername(query.username);
    }
});


/**
 * if you don't know what this is, please, get out of here and don't touch anything
 */
const server = http.createServer(async (req, res) => {
    /** @const {Array.<string>} separatedURL the url, but the query string is separated from the rest */
    let separatedURL = req.url.split('?');

    /** @const {string} url the actual url path */
    let url = separatedURL[0];

    /** @const {ParsedUrlQuery} query the query string but as an object, not a string */
    let query = querystring.parse(separatedURL[1]);

    if(!requestListeners[`${req.method} ${url}`]) {
        sendUnsuccessfulResponse(res, 404);
    }
    
    requestListeners[`${req.method} ${url}`](req, res, query);

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