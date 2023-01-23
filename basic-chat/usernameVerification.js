/**
 * the possible errors that any given username can have
 * @const
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

// TODO: why "const UsernameStatusCodeMessages: any"??? why the any??? research.



/**
 * checks if the given username is valid
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