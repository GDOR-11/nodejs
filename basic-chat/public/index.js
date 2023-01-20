import Message from "./message.js";

let chatList;
let messageTextInput;
let sendMessageButton;

window.onload = () => {
    chatList = document.getElementById("chat");
    messageTextInput = document.getElementById("message-text");
    sendMessageButton = document.getElementById("send-message");

    sendMessageButton.onclick = sendMessage;
    window.onkeyup = event => {
        if(event.code == "Enter" && event.shiftKey == false && document.activeElement == messageTextInput) {
            sendMessage();
        }
    };
}

function clearChatList() {
    chatList.innerHTML = "";
}

function writeMessageToChatList(message) {
    let li = document.createElement("li");
    Message.toHTML(li, message);
    chatList.append(li);
}

function sendMessage() {
    sendMessageToServer(messageTextInput.innerText);
    messageTextInput.innerText = "";
}

function sendMessageToServer(text) {
    messageTextInput.focus();
    socket.emit("new message", text);
}

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