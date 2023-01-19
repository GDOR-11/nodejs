import fs from "fs";
import ejs from "ejs";

export async function readFile(path) {
    return new Promise(resolve => {
        fs.readFile(path, (err, data) => {
            if(err) {
                console.error(`Error while reading file "${path}":\n${err}`);
                resolve(null);
            } else {
                resolve(data.toString());
            }
        });
    });
}

export async function processEJSfile(path, EJSdata = {}, EJSoptions = {}) {
    return new Promise(async resolve => {
        let file = await readFile(path);
        if(file == null) resolve(null);
        let processedFile = ejs.render(file, EJSdata, EJSoptions);
        resolve(processedFile);
    });
}