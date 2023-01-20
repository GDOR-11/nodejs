import {Message} from "./message.js";

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

function sendMessage() {
    sendMessageToServer(messageTextInput.innerText);
    messageTextInput.innerText = "";
}

function clearChatList() {
    chatList.innerHTML = "";
}

function writeMessageToChatList(message) {
    let time_str = new Date(message.time).toLocaleTimeString();

    let li = document.createElement("li");

    let detailP = document.createElement('p');
    detailP.innerHTML = `
        <span style="color: grey;">message sent by</span>
        <span>${username}</span>
        <span style="color: grey;">at</span>
        <span>${time_str}</span>
    `;

    let textP = document.createElement('p');
    textP.innerText = message.text;
    textP.style = "word-break: break-word; white-space: normal;";

    li.append(detailP, textP);
    chatList.append(li);
}


const socket = io();

function sendMessageToServer(text) {
    let message = new Message();
    message.text = text;
    message.user = username;
    messageTextInput.focus();
    socket.emit("new message", message);
}

socket.on("connect", () => {
    console.log(`Connected with ID ${socket.id} and username ${username}`);
});

socket.on("chat history", history => {
    for(let message of history) {
        writeMessageToChatList(message);
    }
});

socket.on("new message", message => {
    writeMessageToChatList(message);
});