export async function readRequestBody(req) {
    let data = "";
    return new Promise(resolve => {
        req.on("data", chunk => {
            data += chunk;
        });
        req.on("end", () => {
            resolve(data);
        });
        req.on("error", err => {
            console.error(`Error while reading request body:\n${err}`);
            resolve(null);
        })
    });
}

export async function sendUnsuccessfulResponse(res, errorCode) {
    res.statusCode = errorCode;
    res.setHeader("content-type", "text/html");
    let processedFile = await processEJSfile("public/error.ejs", {errorCode});
    res.end(processedFile);
}