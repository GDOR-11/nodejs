import {processEJSfile, readFile} from "./fileManagement.js";
import mime from "mime";


/**
 * uhhmmm... its a request listener, it listens for requests
 * @typedef {Function} RequestListener
 * @param {IncomingMessage} req - incoming request
 * @param {ServerResponse} res - outgoing response
 * @param {import("querystring").ParsedUrlQuery} query - urls query string information
 * @returns {void}
 */


/**
 * it's a RequestListener factory
 * @example
 * requestListeners["GET /staticEJSpage"] = standardEJSgetRequestListener("/someEJSfile.ejs", {exampleData: "some data"});
 * @param {string} filePath - the path to the EJS file
 * @param {ejs.Data} [EJSdata] - the data to be given to the EJS file
 * @param {ejs.Options & {async: false;}} [EJSoptions] - EJS options (see https://ejs.co/#docs)
 * @returns {RequestListener} - RequestListener that responds with a static preprocessed EJS file
 */
export function standardEJSgetRequestListener(filePath, EJSdata, EJSoptions) {
    let processedFile;
    processEJSfile(filePath, EJSdata, EJSoptions).then(data => processedFile = data);
    return (req, res, query) => {
        res.setHeader("content-type", "text/html");
        res.end(processedFile);
    };
}


/**
 * it's a RequestListener factory
 * @example
 * requestListeners["GET /staticPage"] = standardGetRequestListener("/someFile.idk");
 * @param {string} filePath - the path to the file
 * @returns {RequestListener} - RequestListener that responds with a static preread file
 */
export function standardGetRequestListener(filePath) {
    let file;
    readFile(filePath).then(data => file = data);
    let mimeType = mime.lookup(filePath);
    return (req, res, query) => {
        res.setHeader("content-type", mimeType);
        res.end(file);
    };
}


/**
 * it's a RequestListener factory
 * @example
 * requestListeners["GET /pageThatRedirectsToAnotherPage"] = standardRedirectRequestListener("/AnotherPage");
 * @param {string} url - the url to redirect to
 * @returns {RequestListener} - RequestListener that responds with a redirect to the specified url
 */
export function standardRedirectRequestListener(url) {
    return (req, res, query) => {
        res.statusCode = 307;
        res.setHeader("location", url);
        res.end();
    }
}