import {processEJSfile} from "./fileManagement.js";

/**
 * reads the body of the given request
 * @param {IncomingMessage} req - the request of which to read the body
 * @returns {Promise<string>}
 */
export function readRequestBody(req) {
    return new Promise((resolve, reject) => {
        let data = "";
        req.on("data", chunk => {
            data += chunk;
        });
        req.on("end", () => {
            resolve(data);
        });
        req.on("error", error => {
            reject(error);
        });
    });
}

/**
 * sends a default HTTP error code HTML page to the user
 * @param {ServerResponse} res - response object in which to send the HTML page
 * @param {number} errorCode - the error code
 * @param {string} [message = ""] - optional message to the user
 */
export function sendUnsuccessfulResponse(res, errorCode, message) {
    processEJSfile("public/error.ejs", {errorCode, message}).then(processedFile => {
        res.statusCode = errorCode;
        res.setHeader("content-type", "text/html");
        res.end(processedFile);
    }).catch(error => {
        throw error;
    });
}