const socket = io();

function sendMessageToServer(message) {
    socket.emit("new message", message);
}

function writeMessage(message) {
    let messageList = document.getElementById("chat");
    let li = document.createElement("li");
    li.innerText = message;
    messageList.appendChild(li);
}

socket.on("connect", () => {
    console.log("Connected with ID " + socket.id);
});

socket.on("chat history", history => {
    for(message of history) {
        writeMessage(message);
    }
});

socket.on("new message", message => {
    writeMessage(message);
});