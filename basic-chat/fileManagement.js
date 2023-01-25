import fs from "fs";
import ejs from "ejs";

/**
 * reads the specified file. In case of error, it quietly (no errors or throws) rejects the promise
 * @example
 * // file example.txt:
 * //   this is an example file
 * //   the quick brown fox jumps over the lazy dog
 * //   !"£$%^&*(){}[]'#@~./>?,<\|
 * 
 * // returns "this is an example file\nthe quick brown fox jumps over the lazy dog\n!"£$%^&*(){}[]'#@~./>?,<\|"
 * readFile("example.txt");
 * @param {string} path - path to the file
 * @returns {Promise<string>} - the promise returns a string containing the contents of the file (if there was no error in the process of reading it)
 */
export function readFile(path) {
    return new Promise((resolve, reject) => {
        fs.readFile(path, (error, data) => {
            if(error) {
                reject(error);
            } else {
                resolve(data.toString());
            }
        });
    });
}

/**
 * reads the specified EJS file and automatically processes it with the given data and options. In case of error, it quietly (no errors or throws) rejects the promise
 * @example
 * // file example.ejs:
 * //   <div>
 * //     <p style="<&= style &>"><&= text &></p>
 * //   </div>
 * 
 * // returns "<div>\n<p style="color: red; font-size: 100px;">this is a big red text</p>\n</div>"
 * processEJSfile("example.ejs", {style: "color: red; font-size: 100px;", text: "this is a big red text"}, {delimiter: "&"});
 * @param {string} path - path to the file
 * @param {ejs.Data} [EJSdata] - the data to be given to the EJS file
 * @param {ejs.Options & {async: false;}} [EJSoptions] - EJS options (see https://ejs.co/#docs)
 * @returns {Promise<string>} - the promise returns a string containing the contents of the file (if there was no error in the process of reading it)
 */
export function processEJSfile(path, EJSdata, EJSoptions) {
    return new Promise((resolve, reject) => {
        readFile(path).then(file => {
            let processedFile = ejs.render(file, EJSdata, EJSoptions);
            resolve(processedFile);
        }).catch((error) => {
            reject(error);
        });
    });
}