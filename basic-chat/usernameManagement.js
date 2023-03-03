import * as database from "./database.js";

/**
 * the possible errors that any given username can have
 * @const {Object}
 * @enum {symbol}
 * @default
 */
export const UsernameStatusCodes = Object.freeze({
    /** the username is valid */
    valid: Symbol("valid"),
    /** the username is already taken */
    taken: Symbol("taken"),
    /** the username is empty */
    empty: Symbol("empty")
});

/**
 * maps UsernameStatusCodes to comprehensible sentences for the user
 * @const {Object}
 * @default
 */
export const UsernameStatusCodeMessages = Object.freeze({
    [UsernameStatusCodes.valid]: "Username is valid.",
    [UsernameStatusCodes.taken]: "Sorry, that username is already taken, try another one.",
    [UsernameStatusCodes.empty]: "The username cannot be empty.",
});

/**
 * checks if the given username is valid
 * @example
 * 
 * // returns UsernameStatusCodes.empty
 * checkUsername("");
 * 
 * // returns UsernameStatusCodes.valid
 * checkUsername("robert");
 * 
 * // returns UsernameStatusCodes.valid
 * checkUsername("robert");
 * 
 * addUserToDatabase("gHuthgYFv-AAAAC", "robert");
 * 
 * // returns UsernameStatusCodes.taken
 * checkUsername("robert");
 * @param {string} username
 * @returns {UsernameStatusCodes} username status
 */
export function checkUsername(username) {
    return new Promise((resolve, reject) => {
        if(username != username.trim()) {
            console.warn("Don't forget to trim the username!");
            username = username.trim();
        }
    
        database.getUsers(database.USER_PROPERTIES.username, username, false).then(user => {
            if(user !== undefined) {
                return resolve(UsernameStatusCodes.taken);
            }
            
            if(username == "") {
                return resolve(UsernameStatusCodes.empty);
            }
        
            return resolve(UsernameStatusCodes.valid);
        }).catch(err => {
            reject(err);
        });
    });
}
