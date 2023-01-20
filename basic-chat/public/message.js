export default class Message {
    constructor(text = "", user = "unknown", time = -1) {
        this.text = text;
        this.user = user;
        this.time = time;
    }

    static toHTML(wrapper, message) {
        let time_str = new Date(message.time).toLocaleTimeString();

        let detailDiv = document.createElement("div");
        detailDiv.innerHTML = `<span style="color: grey;">message sent by</span>
            <span>${message.user}</span>
            <span style="color: grey;">at</span>
            <span>${time_str}</span>`;

        let textP = document.createElement("p");
        textP.style = "word-break: break-word; white-space: normal;";
        textP.innerText = message.text;

        wrapper.append(detailDiv, textP);
    }
    toHTML(wrapper) {
        Message.toHTML(wrapper, this);
    }
};