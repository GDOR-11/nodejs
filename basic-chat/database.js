// all the exported definitions and functions are safe, i believe.
// you only need to worry about SQL injection when using functions that are not exported (e.g. getRows, insertRow, etc.)

import sqlite3 from "sqlite3";

/** @const {sqlite3.Database} database */
const database = new sqlite3.Database("database.sqlite");



/**
 * returns the rows of the specified table that meet the specified condition as an array of objects {column1, column2, column3...}
 * 
 * 
 * the table and condition parameters are subject to SQL injection since it cannot be replaced by placeholders (see https://stackoverflow.com/a/34310057/16707817),
 * so only use this function server-side and carefully
 * @example
 * let users1 = await getRows("users", "username LIKE ?", ["%user%"]);
 * 
 * // prints something like [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "__user_434" }, { socketID: "emStBNiseeiytVbWPYYE", username: "random_username" } ]
 * console.log(users1);
 * 
 * let users2 = await getRows("users", "username LIKE ?", ["%user%"], false);
 * 
 * // prints something like [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "__user_434" } ]
 * console.log(users2);
 * 
 * let users3 = await getRows("users");
 * 
 * // prints something like [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "__user_434" }, { socketID: "emStBNiseeiytVbWPYYE", username: "random_username" }, {socketID: "neverdies", username: "technoblade"} ]
 * console.log(users3);
 * @param {string} table the table to read the contents
 * @param {string} [condition = "true"] the condition, in SQL (only rows satisfying this condition are returned)
 * @param {Array} [placeholders = []] the placeholders to replace in the condition
 * @param {boolean} [allRows = true] determines if all the rows should be returned or just the first one
 * @returns {Promise<Object | Array<Object>>} the data
 */
function getRows(table, condition = "true", placeholders = [], allRows = true) {
    return new Promise((resolve, reject) => {
        // if allRows is true, execute database.all, otherwise execute database.get
        let parameters = [`SELECT * FROM ${table} WHERE ${condition}`, placeholders, (error, data) => {
            if(error) {
                reject(error);
            } else {
                resolve(data);
            }
        }];
        if(allRows) {
            return database.all(...parameters);
        } else {
            return database.get(...parameters);
        }
    });

}

/**
 * inserts the given data into the given table
 * 
 * 
 * the table and data parameter is subject to SQL injection since it cannot be replaced by placeholders (see https://stackoverflow.com/a/34310057/16707817),
 * so only use this function server-side and carefully
 * @example
 * // table users, before:
 * //       socketID       |   username
 * // RyGiUioKKyJKKlTWtmWP | noobmaster69
 * await insertRow("users", {socketID: "ojIckSD2jqNzOqIrAGzL", username: "heker"});
 * // table users, after:
 * //       socketID       |   username
 * // RyGiUioKKyJKKlTWtmWP | noobmaster69
 * // ojIckSD2jqNzOqIrAGzL | heker
 * @param {string} table the table to insert to
 * @param {Object} data the data to insert
 * @returns {Promise<undefined>} use this to know when the row has been inserted
 */
function insertRow(table, data) {
    return new Promise((resolve, reject) => {
        let dataKeys = Object.keys(data);

        if(dataKeys.length == 0) return resolve();
        
        //            INSERT INTO  $table  ($dataColumn1, $dataColumn2, ...) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ... )
        database.run(`INSERT INTO ${table} (    ${dataKeys.join(", ")}     ) VALUES (? ${", ?".repeat(dataKeys.length - 1)} )`, Object.values(data), error => {
            if(error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/**
 * removes the rows from the given table where the given condition is met (you can use placeholders inside the condition)
 * 
 * the table and condition parameters are subject to SQL injection since they cannot be replaced by placeholders (see https://stackoverflow.com/a/34310057/16707817),
 * so only use this function server-side and carefully
 * @example
 * // table users, before:
 * //       socketID       |   username
 * // RyGiUioKKyJKKlTWtmWP | noobmaster69
 * // ojIckSD2jqNzOqIrAGzL | heker
 * // bgnZmZdtZNnUnuNRfuEx | some_username
 * // EcjapNcziDIHQDjXGFBa | random_username_LOL
 * // BNzScttVygxzipqfPSUJ | male_human
 * await deleteRows("users", "username = ?", ["heker"]);
 * // table users, after that:
 * //       socketID       |   username
 * // RyGiUioKKyJKKlTWtmWP | noobmaster69
 * // bgnZmZdtZNnUnuNRfuEx | some_username
 * // EcjapNcziDIHQDjXGFBa | random_username_LOL
 * // BNzScttVygxzipqfPSUJ | male_human
 * await deleteRows("users", "username LIKE '%username%'");
 * // table users, after that:
 * //       socketID       |   username
 * // RyGiUioKKyJKKlTWtmWP | noobmaster69
 * // BNzScttVygxzipqfPSUJ | male_human
 * await deleteRows("users");
 * // table users, after: (it's empty)
 * //       socketID       |   username
 * @param {string} table the table to delete from
 * @param {string} [condition = "true"] the condition, in SQL (only rows satisfying this condition are returned)
 * @param {Array<string>} [placeholders = []] the placeholders present in the condition
 * @returns {Promise<undefined>} use this to know when the rows have been deleted
 */
function deleteRows(table, condition = "true", placeholders = []) {
    return new Promise((resolve, reject) => {
        database.run(`DELETE FROM ${table} WHERE ${condition}`, placeholders, error => {
            if(error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/**
 * edits the rows from the given table with the given data where the given condition is met (you can use placeholders inside the condition)
 * 
 * the table, data and condition parameters are subject to SQL injection since they cannot be replaced by placeholders (see https://stackoverflow.com/a/34310057/16707817),
 * so only use this function server-side and carefully
 * @example
 * // table users, before:
 * //       socketID       |   username
 * // RyGiUioKKyJKKlTWtmWP | noobmaster69
 * // ojIckSD2jqNzOqIrAGzL | heker
 * // bgnZmZdtZNnUnuNRfuEx | some_username
 * // EcjapNcziDIHQDjXGFBa | random_username_LOL
 * await editRows("users", {socketID: "cuWCOSJnJWwalESjJGMJ", username: "hello-there"}, "username = ?", ["heker"]);
 * // table users, after that:
 * //       socketID       |   username
 * // RyGiUioKKyJKKlTWtmWP | noobmaster69
 * // cuWCOSJnJWwalESjJGMJ | hello-there
 * // bgnZmZdtZNnUnuNRfuEx | some_username
 * // EcjapNcziDIHQDjXGFBa | random_username_LOL
 * editRows("users", {username: "potato"}, "username LIKE '%username%'").catch(err => {
 *     // error, just because multiple usernames are being set to the same value, and the usernames column is UNIQUE in the users table
 *     // if it was not UNIQUE this operation would change the table to look like this:
 *     //       socketID       |   username
 *     // RyGiUioKKyJKKlTWtmWP | noobmaster69
 *     // cuWCOSJnJWwalESjJGMJ | hello-there
 *     // bgnZmZdtZNnUnuNRfuEx | potato
 *     // EcjapNcziDIHQDjXGFBa | potato
 * 
 *     // note that, even though there was an error while editing the rows,
 *     // this function never throws any error, it just silently rejects the promise so that you can handle the error yourself
 *     console.log("operation failed successfully");
 *     console.log("(an error was expected)");
 * });
 * // table users, after that:
 * //       socketID       |   username
 * // RyGiUioKKyJKKlTWtmWP | noobmaster69
 * // cuWCOSJnJWwalESjJGMJ | hello-there
 * // bgnZmZdtZNnUnuNRfuEx | some_username
 * // EcjapNcziDIHQDjXGFBa | random_username_LOL
 * @param {string} table the table to delete from
 * @param {Object} data the data, in the format {column1name: column1value, column2name: column2value...}
 * @param {string} [condition = "true"] the condition (in SQL)
 * @param {Array<string>} [placeholders = []] the placeholders present in the condition
 * @returns {Promise<undefined>} use this to know when the rows have been deleted
 */
function editRows(table, data, condition = "true", placeholders = []) {
    return new Promise((resolve, reject) => {
        let dataKeys = Object.keys(data);

        if(dataKeys.length == 0) return resolve();

        //            UPDATE  $table  SET $dataColumn1 = ?, $dataColumn2 = ?, ... WHERE  $condition
        database.run(`UPDATE ${table} SET     ${dataKeys.join(" = ?, ")} = ?      WHERE ${condition}`, Object.values(data).concat(placeholders), error => {
            if(error) {
                reject(error);
            } else {
                resolve();
            }
        });
    });
}

/** defines an user */
class User {
    /** @type {string} */ socketID;
    /** @type {string} */ username;
};

/** defines a message */
class Message {
    /** @type {number} */ id;
    /** @type {string} */ text;
    /** @type {string} */ userID;
    /** @type {number} */ time;
}

/**
 * an enum containing all properties of any user
 * @const {Object}
 * @enum {Symbol}
 */
export const USER_PROPERTIES = Object.freeze((() => {
    let usr = {};
    for(let key in new User()) {
        usr[key] = Symbol(key);
    }
    return usr;
})());

/**
 * an enum containing all properties of any message
 * @const {Object}
 * @enum {Symbol}
 */
export const MESSAGE_PROPERTIES = Object.freeze((() => {
    let obj = {};
    for(let key in new Message()) {
        obj[key] = Symbol(key);
    }
    return obj;
})());


/**
 * returns the users whose properties match the one specified
 * 
 * currently allUsers doesn't make any difference, if it's true the function returns an array with a single element and if it's false the function returns that element,
 * but if in the future more not necessarily unique properties are added to an user, allUsers set to true might return an array with multiple elements
 * @example
 * let users1 = await getUsers();
 * 
 * // prints something like [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "__user_434" }, { socketID: "emStBNiseeiytVbWPYYE", username: "random_username" }, {socketID: "neverdies", username: "technoblade"} ]
 * console.log(users1);
 * 
 * let users2 = await getUsers(USER_PROPERTIES.username, "__user_434");
 * 
 * // prints something like [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "__user_434" } ]
 * console.log(users2);
 * 
 * 
 * let users3 = await getUsers(USER_PROPERTIES.username, "__user_434", false);
 * 
 * // prints something like { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "__user_434" }
 * console.log(users3);
 * 
 * let users4 = await getUsers(USER_PROPERTIES.socketID, "emStBNiseeiytVbWPYYE", false );
 * 
 * // prints something like { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "__user_434" }
 * console.log(users4);
 * @param {USER_PROPERTIES} [property]
 * @param {any} [value]
 * @param {boolean} [allUsers = true] specifies if all the matching users should be returned or just one
 * @returns {Promise<User | Array<User>>} the user
 */
export function getUsers(property, value, allUsers = true) {
    return new Promise((resolve, reject) => {
        if(arguments.length == 0) {
            return getRows("users").then(resolve).catch(reject);
        }
        if(property === undefined || USER_PROPERTIES[property?.description] !== property) {
            return reject(new TypeError("Property parameter needs to be a property of the USER_PROPERTIES enum"));
        }
        let condition = `${property.description} = ?`;
    
        getRows("users", condition, [value], allUsers).then(resolve).catch(reject);
    })
}

/**
 * returns the messages whose properties match the one specified
 * @example
 * let messages1 = await getMessages();
 * 
 * // prints something like [
 * //   { id: 0, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "hi", time: 1674832326409 },
 * //   { id: 1, userID: "emStBNiseeiytVbWPYYE", text: "ereht olleh", time: 1674832345474 },
 * //   { id: 2, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "who da fuk r ya", time: 1674832364539 },
 * //   { id: 3, userID: "emStBNiseeiytVbWPYYE", text: "ymene tsrow ruoy", time: 1674832383604 }
 * // ]
 * console.log(messages1);
 * 
 * let messages2 = await getMessages(MESSAGE_PROPERTIES.userID, "GUTuIIrfaTZSZGTpgmmJ");
 * 
 * // prints something like [
 * //   { id: 0, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "hi", time: 1674832326409 },
 * //   { id: 2, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "who da fuk r ya", time: 1674832364539 }
 * // ]
 * console.log(messages2);
 * 
 * let messages3 = await getMessages(MESSAGE_PROPERTIES.userID, "GUTuIIrfaTZSZGTpgmmJ", false);
 * 
 * // prints something like { id: 0, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "hi", time: 1674832326409 }
 * console.log(messages3);
 * 
 * let messages4 = await getMessages(MESSAGE_PROPERTIES.id, "1");
 * 
 * // prints something like [
 * //   { id: 1, userID: "emStBNiseeiytVbWPYYE", text: "ereht olleh", time: 1674832345474 }
 * // ]
 * console.log(messages4);
 * @param {MESSAGE_PROPERTIES} [property]
 * @param {string} [value]
 * @param {boolean} [allMessages = true]
 * @returns {Promise<Message | Array<Message>}
 */
export function getMessages(property, value, allMessages = true) {
    return new Promise((resolve, reject) => {
        if(arguments.length == 0) {
            return getRows("messages").then(resolve).catch(reject);
        }
        if(property === undefined || MESSAGE_PROPERTIES[property?.description] !== property) {
            return reject(new TypeError("Property parameter needs to be a property of the MESSAGE_PROPERTIES enum"));
        }
        let condition = `${property.description} = ?`;
    
        getRows("messages", condition, [value], allMessages).then(resolve).catch(reject);
    })
}

/**
 * adds the given user to the database
 * @example
 * let usersBefore = await getUsers();
 * 
 * // [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "mumbojumbo" } ]
 * console.log(usersBefore);
 * 
 * await addUser( { socketID: emStBNiseeiytVbWPYYE, username: "herobrine" } );
 * 
 * let usersAfter = await getUsers();
 * 
 * // [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "mumbojumbo" }, { socketID: emStBNiseeiytVbWPYYE, username: "herobrine" } ]
 * console.log(usersAfter);
 * @param {User} user user to add
 * @returns {Promise<undefined>} use this to know when the user has been added
 */
export function addUser(user) {
    return insertRow("users", user);
}

/**
 * adds the given message to the database
 * @example
 * let messagesBefore = await getAllMessages();
 * 
 * // [ { id: 0, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "hi", time: 1674832326409 } ]
 * console.log(messagesBefore);
 * 
 * await addMessage( { id: 1, userID: "emStBNiseeiytVbWPYYE", text: "ereht olleh", time: 1674832345474 } );
 * 
 * let messagesAfter = await getAllMessages();
 * 
 * // [ { id: 0, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "hi", time: 1674832326409 }, { id: 1, userID: "emStBNiseeiytVbWPYYE", text: "ereht olleh", time: 1674832345474 } ]
 * console.log(messagesAfter);
 * @param {Message} message message to add
 * @returns {Promise<undefined>} use this to know when the message has been added
 */
export function addMessage(message) {
    return insertRow("messages", message);
}





/**
 * delete the specified user from the database
 * @example
 * let usersBefore = await getAllUsers();
 * 
 * // [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "mumbojumbo" }, { socketID: emStBNiseeiytVbWPYYE, username: "herobrine" } ]
 * console.log(usersBefore);
 * 
 * await deleteUser("mumbojumbo");
 * 
 * let usersAfter = await getAllUsers();
 * 
 * // [ { socketID: emStBNiseeiytVbWPYYE, username: "herobrine" } ]
 * console.log(usersAfter);
 * @param {string} [username] the username of the user to delete
 * @returns {Promise<undefined>} use this to know when the message has been added
 */
export function deleteUsers(property, value) {
    return new Promise((resolve, reject) => {
        if(arguments.length == 0) {
            return deleteRows("users").then(resolve).catch(reject);
        }
        if(property === undefined || USER_PROPERTIES[property?.description] !== property) {
            return reject(new TypeError("Property parameter needs to be a property of the USER_PROPERTIES enum"));
        }
        let condition = `${property.description} = ?`;

        deleteRows("users", condition, [value]).then(resolve).catch(reject);
    });
}

/**
 * delete the specified message from the database
 * @example
 * let messagesBefore = await getAllMessages();
 * 
 * // [ { id: 0, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "hi", time: 1674832326409 }, { id: 1, userID: "emStBNiseeiytVbWPYYE", text: "ereht olleh", time: 1674832345474 } ]
 * console.log(messagesBefore);
 * 
 * await deleteMessage(0);
 * 
 * let messagesAfter = await getAllMessages();
 * 
 * // [ { id: 1, userID: "emStBNiseeiytVbWPYYE", text: "ereht olleh", time: 1674832345474 } ]
 * console.log(messagesAfter);
 * @param {number} messageID the message ID
 * @returns {Promise<undefined>} use this to know when the message has been added
 */
export function deleteMessages(property, value) {
    return new Promise((resolve, reject) => {
        if(arguments.length == 0) {
            return deleteRows("messages").then(resolve).catch(reject);
        }
        if(property === undefined || MESSAGE_PROPERTIES[property?.description] !== property) {
            return reject(new TypeError("Property parameter needs to be a property of the MESSAGE_PROPERTIES enum"));
        }
        let condition = `${property.description} = ?`;

        deleteRows("messages", condition, [value]).then(resolve).catch(reject);
    });
}


/**
 * changes the username of the specified user
 * @example
 * let usersBefore = await getAllUsers();
 * 
 * // [ { socketID: "GUTuIIrfaTZSZGTpgmmJ", username: "mumbojumbo" }, { socketID: emStBNiseeiytVbWPYYE, username: "herobrine" } ]
 * console.log(usersBefore);
 * 
 * await editUser("mumbojumbo", {username: "none", socketID: "aaaaaa"});
 * 
 * let usersAfter = await getAllUsers();
 * 
 * // [ { socketID: "aaaaaa", username: "none" }, { socketID: emStBNiseeiytVbWPYYE, username: "herobrine" } ]
 * console.log(usersAfter);
 * @param {string} username the username of the user to edit
 * @param {Object} newValues the values to change. This function will only accept properties that belong to the User class
 * @returns {Promise<undefined>} use this to know when the users have been changed
 */
export function editUsers(property, value, newValues) {
    return new Promise((resolve, reject) => {
        if(arguments.length == 0) {
            return editRows("users").then(resolve).catch(reject);
        }
        if(property === undefined || USER_PROPERTIES[property?.description] !== property) {
            return reject(new TypeError("Property parameter needs to be a property of the USER_PROPERTIES enum"));
        }
        let condition = `${property.description} = ?`;

        let data = {};
        for(let key in newValues) {
            if(USER_PROPERTIES[key] !== undefined) {
                data[key] = newValues[key];
            }
        }

        editRows("users", data, condition, [value]).then(resolve).catch(reject);
    });
}

/** 
 * changes the username of the specified user
 * @example
 * let messagesBefore = await getAllMessages();
 * 
 * // [ { id: 0, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "hi", time: 1674832326409 }, { id: 1, userID: "emStBNiseeiytVbWPYYE", text: "ereht olleh", time: 1674832345474 } ]
 * console.log(messagesBefore);
 * 
 * await editMessage(0, {text: "none", time: -1});
 * 
 * let messagesAfter = await getAllMessages();
 * 
 * // [ { id: 0, userID: "GUTuIIrfaTZSZGTpgmmJ", text: "none", time: -1 }, { id: 1, userID: "emStBNiseeiytVbWPYYE", text: "ereht olleh", time: 1674832345474 } ]
 * console.log(usersAfter);
 * @param {number} messageID the id of the message to edit
 * @param {Object} newValues the values to change. This function will only accept properties that belong to the Message class
 * @returns {Promise<undefined>} use this to know when the messages have been edited
 */
export function editMessages(property, value, newValues) {
    return new Promise((resolve, reject) => {
        if(arguments.length == 0) {
            return editRows("messages").then(resolve).catch(reject);
        }
        if(property === undefined || MESSAGE_PROPERTIES[property?.description] !== property) {
            return reject(new TypeError("Property parameter needs to be a property of the MESSAGE_PROPERTIES enum"));
        }
        let condition = `${property.description} = ?`;

        let data = {};
        for(let key in newValues) {
            if(MESSAGE_PROPERTIES[key] !== undefined) {
                data[key] = newValues[key];
            }
        }

        editRows("messages", data, condition, [value]).then(resolve).catch(reject);
    });
}