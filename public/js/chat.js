const socket = io();
const form = document.querySelector(".form");
const messageBlock = document.querySelector(".chat__messages");
const locationBtn = document.querySelector("#userLocation");
const formBtn = form.querySelector(".btn");
const sidBarTemplate = document.querySelector("#sidebar-template").innerHTML;
const sidBar = document.querySelector(".chat__sidebar");

const autoScroll = () => {
  const newMessage = messageBlock.lastElementChild;

  const newMessageStyle = getComputedStyle(newMessage);
  const newMessageMargin = parseInt(newMessageStyle.marginBottom);
  const newMessageHeight = newMessage.offsetHeight + newMessageMargin;

  const visibleHeight = newMessage.offsetHeight;

  const containerHeight = messageBlock.scrollHeight;

  const scrollOffset = messageBlock.scrollTop + visibleHeight;

  if (containerHeight - newMessageStyle <= scrollOffset) {
    messageBlock.scrollTop = messageBlock.scrollHeight;
  }
};

// socket.on("message", ({ text }) => console.log(text));
// console.log("hii");
const { userName, room } = Qs.parse(location.search, {
  ignoreQueryPrefix: true,
});

form.addEventListener("submit", (e) => {
  e.preventDefault();
  const messageTxt = document.querySelector(".input");
  formBtn.setAttribute("disabled", "disabled");

  socket.emit("sendMessage", messageTxt.value, (err) => {
    formBtn.removeAttribute("disabled");

    if (err) {
      return alert(err);
    }
    console.log("message delivered");
  });
  messageTxt.value = "";
  messageTxt.focus();
  autoScroll();
});
let firstRender = true;

socket.on("roomData", ({ room, users }) => {
  const html = Mustache.render(sidBarTemplate, {
    room,
    users,
  });
  sidBar.innerHTML = html;
});
// console.log(usersBox);

socket.on("message", ({ text, createdAt, userName }) => {
  // console.log(message.userName);
  messageBlock.insertAdjacentHTML(
    "beforeend",
    `<div class="message">
      <p>
      <span class="message__name">${userName}</span>
        <span class="message__meta">${moment(createdAt).format(
          "hh:mm a"
        )}</span>
      </p>
      <p>${text}</p>
    </div>`
  );
  autoScroll();
});

locationBtn.addEventListener("click", () => {
  if (!navigator.geolocation) {
    return alert("geolocation is not supported.");
  }
  locationBtn.setAttribute("disabled", "disabled");
  navigator.geolocation.getCurrentPosition((position) => {
    const { latitude, longitude } = position.coords;
    socket.emit("sendLocation", latitude, longitude);
    locationBtn.removeAttribute("disabled");
  });
});

socket.on("myLocation", ({ text, createdAt, userName }) => {
  messageBlock.insertAdjacentHTML(
    "beforeend",
    ` <div class="messages">
          <p>
          <span class="message__name">${userName}</span>
          <span class="message__meta">${moment(createdAt).format(
            "hh:mm a"
          )}</span>
          </p>
      </div>
        <p><a href="${text}" target="_blank">My Location</a></p>`
  );
  autoScroll();
});

socket.emit("join", { userName, room }, (error) => {
  if (error) {
    alert(error);
    location.href = "/";
  }
});
