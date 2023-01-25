import {messageToHTML} from "./message.js";


/** @type {HTMLUListElement} */
let chatList;
/** @type {HTMLSpanElement} */
let messageTextInput;
/** @type {HTMLButtonElement} */
let sendMessageButton;

window.onload = () => {
    chatList = document.getElementById("chat");
    messageTextInput = document.getElementById("message-text");
    sendMessageButton = document.getElementById("send-message");

    sendMessageButton.onclick = event => {
        sendMessageToServer(messageTextInput.innerText);
        messageTextInput.innerText = "";
        messageTextInput.focus();
    };
    window.onkeyup = event => {
        if(event.code == "Enter" && event.shiftKey == false && document.activeElement == messageTextInput) {
            sendMessageToServer(messageTextInput.innerText);
            messageTextInput.innerText = "";
            messageTextInput.focus();
        }
    };
}

/**
 * erase all messages from {@link chatList}
 */
function clearChatList() {
    chatList.innerHTML = "";
}

/**
 * insert another message into {@link chatList}
 * @param {import("./message.js").Message} message the message to insert
 */
function writeMessageToChatList(message) {
    let li = document.createElement("li");
    messageToHTML(message, li);
    chatList.append(li);
}

/**
 * send a message to the server
 * @param {string} text the text of the message to send
 */
function sendMessageToServer(text) {
    socket.emit("new message", text);
}

/** @type {Server} */
const socket = io();

socket.on("connect", () => {
    socket.emit("username", username);
});

socket.on("chat history", history => {
    for(let message of history) {
        writeMessageToChatList(message);
    }
});

socket.on("new message", message => {
    writeMessageToChatList(message);
});