import {usernames} from "./dataManagement.js";

/**
 * the possible errors that any given username can have
 * @const {Object}
 * @enum {symbol}
 * @property {symbol} valid - the username is valid
 * @property {symbol} taken - the username is already taken
 * @property {symbol} empty - the username is empty
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
    if(username != username.trim()) {
        console.warn("Don't forget to trim the username");
        username = username.trim();
    }
    for(let id in usernames) {
        if(usernames[id] == username.trim()) {
            return UsernameStatusCodes.taken;
        }
    }
    if(username == "") {
        return UsernameStatusCodes.empty;
    }
    return UsernameStatusCodes.valid;
}

/**
 * adds an user to the user database (currentyl just the usernames object)
 * @example
 * addUserToDatabase("gHuthgYFv-AAAAC", "robert");
 * @param {string} socketID 
 * @param {string} username 
 */
function addUserToDatabase(socketID, username) {
    usernames[socketID] = username;
}
