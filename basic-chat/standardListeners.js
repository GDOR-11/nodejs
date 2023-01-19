import {processEJSfile, readFile} from "./fileManagement.js";
import mime from "mime";

export function standardEJSgetRequestListener(filePath, EJSdata = {}, EJSoptions = {}) {
    let processedFile;
    processEJSfile(filePath, EJSdata, EJSoptions).then(data => processedFile = data);
    return (req, res) => {
        res.setHeader("content-type", "text/html");
        res.end(processedFile);
    };
}
export function standardGetRequestListener(filePath) {
    let file;
    readFile(filePath).then(data => file = data);
    let mimeType = mime.lookup(filePath);
    return (req, res) => {
        res.setHeader("content-type", mimeType);
        res.end(file);
    };
}
export function standardRedirectRequestListener(url) {
    return (req, res) => {
        res.statusCode = 307;
        res.setHeader("location", url);
        res.end();
    }
}