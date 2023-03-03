/**
 * @typedef {Object} Message object that carries the information of a message
 * @property {number} id the id of the message
 * @property {string} text the text of the message
 * @property {string} user the user that sent the message
 * @property {number} time when the message was sent, measured in milliseconds since january 1st 1970 UTC (see https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Date/getTime)
 */


/**
 * appends a default {@link Message | message} display to the specified wrapper element
 * @example
 * // before:
 * // <div id="some-div"></div>
 * messageToHTML({text: "hello", user: "user name", time: 1674571410081}, document.getElementById("some-div"));
 * // after (GMT timezone):
 * // <div id="some-div">
 * //   <div>
 * //     <span style="color: grey;">message sent by</span>
 * //     <span>user name</span>
 * //     <span style="color: grey;">at</span>
 * //     <span>02:43:30 PM</span>
 * //   </div>
 * //   <p style="word-break: break-word; white-space: normal;">hello</p>
 * // </div>
 * @param {Message} message the message to be displayed
 * @param {HTMLElement} wrapperElement the HTML element to append to
 */
export function messageToHTML(message, wrapperElement) {
    let time_str = new Date(message.time).toLocaleTimeString();

    let detailDiv = document.createElement("div");
    detailDiv.innerHTML = `<span style="color: grey;">message sent by</span>
        <span>${message.user}</span>
        <span style="color: grey;">at</span>
        <span>${time_str}</span>`;

    let textP = document.createElement("p");
    textP.style = "word-break: break-word; white-space: normal;";
    textP.innerText = message.text;

    wrapperElement.append(detailDiv, textP);
}