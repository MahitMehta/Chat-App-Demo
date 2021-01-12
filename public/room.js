const textMessage = document.querySelector(".text-message");
const sendButton = document.querySelector(".send-button");
const displayName = document.querySelector(".display-name");
const messageSection = document.querySelector(".messaging-section");
const activeTypers = document.querySelector(".active-typers");
const colorOptions = ["#FFD000", "#00FFBC", "#FF77CB"];
const userColor = colorOptions[Math.floor(Math.random() * colorOptions.length)];

const socket = io();

socket.emit("join-room", USERID, ROOMID);
socket.on("new-member", userId => {
    console.log(userId);
});

sendButton.addEventListener("click", e => {
    e.preventDefault();
    const text = textMessage.value;
    const name = displayName.value;
    const textObj = {text: text, displayName: name, userId: USERID, color: userColor };
    addText(textObj);

    socket.emit("emit-message", ROOMID, textObj);
});

socket.on("new-message", textObj => {
    addText(textObj);
});

let activeTypersObj = {};

textMessage.addEventListener("input", () => {
    const name = displayName.value ? displayName.value : "Anonymous";
    socket.emit("emit-typing", ROOMID, USERID, name);
});

socket.on("user-typing", (userId, name) => {
    if (!activeTypersObj[userId]) {
        activeTypersObj[userId] = name;

        const div = document.createElement("div");
        div.id = userId;
        const p = document.createElement("p");
        p.innerText = `${name} is Typing`;
        div.appendChild(p);
        activeTypers.appendChild(div);
        const timeoutAmount = 2000;
        setTimeout(() => {
            div.remove();
            activeTypersObj[userId] = null;
        }, timeoutAmount);
    }
});

function addText({ text, displayName, userId, color}) {
    if (userId != USERID) {
        const allTypers = Array.from(activeTypers.children);
        allTypers.forEach(typer => {
            if (typer.id === userId) typer.remove();
        });
        activeTypers[userId] = null;
    }

    const div = document.createElement("div");
    div.className = "text-div";
    const textP = document.createElement("p");
    textP.innerText = text;
    div.appendChild(textP);

    const nameP = document.createElement("p");
    nameP.className = "text-details";
    nameP.style.color = color;
    nameP.innerText = displayName ? displayName : "Anonymous";

    const date = new Date();
    const hour = date.getHours() > 12 ? date.getHours() - 12 : date.getHours();
    const minutes = date.getMinutes() >= 10 ? date.getMinutes() : `0${date.getMinutes()}`;
    const timeSpan = document.createElement("span");
    timeSpan.innerText = `${hour}:${minutes}`;
    nameP.appendChild(timeSpan);
    div.appendChild(nameP);
    messageSection.insertBefore(div, activeTypers);
    div.scrollIntoView({
        behavior: "smooth",
    })
}