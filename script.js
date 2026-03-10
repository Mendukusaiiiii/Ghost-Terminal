//what are you looking at. ._.


const API = "https://script.google.com/macros/s/AKfycbyT9jNwi156DJn3PubrnruWlxZ_Udb_gC5BchAFZDUtSAtdgZFvRy4H6tFfzUMQvGlS/exec";


document.addEventListener("dragover", function(e) {
    e.preventDefault();
});
document.addEventListener("drop", function(e) {
    e.preventDefault();
});

const chat = document.getElementById("chat");
const input = document.getElementById("input");
const typingBox = document.getElementById("typing");
const loginText = document.getElementById("login");
const sendBtn = document.getElementById("sendBtn");

const loginScreen = document.getElementById("loginScreen");
const terminal = document.getElementById("terminal");

const usernameInput = document.getElementById("usernameInput");
const loginBtn = document.getElementById("loginBtn");
const imageInput = document.getElementById("imageInput");
const backBtn = document.getElementById("backBtn");
const jumpBtn = document.getElementById("jumpBtn");
const aboutBtn = document.getElementById("aboutBtn");
const closeAboutBtn = document.getElementById("closeAboutBtn");
const aboutBox = document.getElementById("aboutBox");

let user = "";
let lastMessageCount = 0;
let serverOnline = false;

let loadInterval;
let statusInterval;
let pendingImage = null;

const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const serverStatus = document.getElementById("serverStatus");


// Login
loginBtn.onclick = function(){

let name = usernameInput.value.trim();

if(name === ""){
name = "Anonymous" + Math.floor(Math.random()*10000);
}

name = name.slice(0, 30);

user = name;

loginScreen.style.display = "none";
terminal.style.display = "block";

loginText.innerHTML = "Logged in as " + user;

serverStatus.style.display = "block";
loadMessages();


setTimeout(() => {
  const chat = document.getElementById("chat");
  chat.scrollTop = chat.scrollHeight;
}, 300);

loadInterval = setInterval(loadMessages,2000);

checkServerStatus();
statusInterval = setInterval(checkServerStatus,5000);

};

// Back to login
backBtn.onclick = function(){

location.reload();

};


jumpBtn.onclick = function(){
  chat.scrollTop = chat.scrollHeight;
};

// About button
aboutBtn.onclick = function(){
  aboutBox.style.display = "flex";
};

// Close about
closeAboutBtn.onclick = function(){
  aboutBox.style.display = "none";
};


// Check server status
async function checkServerStatus(){

try{

const res = await fetch(API, { method: "HEAD", mode: "no-cors" });

serverOnline = true;
statusIndicator.className = "online";
statusText.textContent = "Online";

}catch(err){

serverOnline = false;
statusIndicator.className = "offline";
statusText.textContent = "Offline";

}

}

// Terminal output
function makeLinksClickable(text) {
  const urlRegex = /(https?:\/\/[^\s]+)/g;
  return text.replace(urlRegex, '<a href="$1" target="_blank" rel="noopener noreferrer">$1</a>');
}

function typeLine(username, content, timestamp){

const line = document.createElement("div");

const time = document.createElement("span");
time.className = "timestamp";

if(timestamp){
const d = new Date(timestamp);
time.textContent = "[" + d.toLocaleDateString() + " " + d.toLocaleTimeString() + "] ";
}else{
time.textContent = "[unknown] ";
}

line.appendChild(time);

const userLabel = document.createElement("span");
userLabel.className = "username";
userLabel.textContent = username + "> ";
line.appendChild(userLabel);

if(content.includes("data:image/")){

const img = document.createElement("img");
img.src = content;
img.style.maxWidth = "300px";
img.style.maxHeight = "200px";
img.style.objectFit = "contain";
img.style.display = "block";
img.style.margin = "5px 0";
line.appendChild(img);

}else{

const textSpan = document.createElement("span");
textSpan.className = "messageContent";
textSpan.innerHTML = makeLinksClickable(content);
line.appendChild(textSpan);

}

chat.appendChild(line);
}

// Load message
async function loadMessages(){

try{

typingBox.innerHTML = "Loading Message.";

const res = await fetch(API);
const data = await res.json();

if(data.length === lastMessageCount){
  typingBox.innerHTML = "";
}else{
  typingBox.innerHTML = "New Message!";
  setTimeout(function(){
    typingBox.innerHTML = "";
  }, 1200);
}
chat.innerHTML = "";

let lastTypingUser = "";

for(let i=1;i<data.length;i++){

const row = data[i];

const username = row[1];
const message = row[2];
const typing = row[3];

if(message && message.trim() !== ""){

const timestamp = row[0];
typeLine(username, message, timestamp)

}

if(typing === true || typing === "TRUE"){

lastTypingUser = username;

}

}

lastMessageCount = data.length;

if(lastTypingUser && lastTypingUser !== user){
typingBox.innerHTML = lastTypingUser + " is typing.";
}

lastMessageCount = data.length;

updateJumpButton();

}catch(err){

console.error("Fetch error:",err);
typingBox.innerHTML = "Error Loading Messages.";

}


}

// Send message
async function sendMessage(message){

typingBox.innerHTML = "Sending.";

try{

await fetch(API,{
method:"POST",
body:new URLSearchParams({
user:user,
message:message
})
});

chat.scrollTop = chat.scrollHeight;

typingBox.innerHTML = "";

}catch(err){

console.error("Send error:",err);
typingBox.innerHTML = "Error Sending Message.";

}

}

// Enter key message
input.addEventListener("keypress",function(e){

if(e.key === "Enter"){

const msg = input.value.trim();

if(msg !== ""){
sendMessage(msg);
}

input.value="";

}

});

input.addEventListener("input", function(){

if(pendingImage && input.value.trim() !== "[Image File Selected: " + pendingImage.name + " Delete this text to cancel]"){
pendingImage = null;
}

});

// Send button click
sendBtn.onclick = function(){

const msg = input.value.trim();

if(pendingImage){
sendMessage(pendingImage);
pendingImage = null;
input.value = "";
}
else if(msg !== ""){
sendMessage(msg);
input.value = "";
}

};

jumpBtn.onclick = function(){

chat.scrollTop = chat.scrollHeight;

updateJumpButton();

};

// Image sending
imageInput.addEventListener("change", function(e){

const file = e.target.files[0];
if(!file) return;

if(file.size > 5 * 1024 * 1024){
alert("File too large. Maximum size is 5MB.");
imageInput.value = "";
return;
}

const reader = new FileReader();

reader.onload = function(event){

pendingImage = event.target.result;

// Indicator inside the message box.
input.value = "[Image File Selected: " + file.name + "] Delete this text to cancel";

};

reader.readAsDataURL(file);

imageInput.value = "";

});

//Calendar
const calendar = document.getElementById("calendar");

function renderCalendar() {
  const now = new Date();
  const year = now.getFullYear();
  const month = now.getMonth();
  const monthName = now.toLocaleString('default', { month: 'long' });
  const firstDay = new Date(year, month, 1).getDay();
  const daysInMonth = new Date(year, month + 1, 0).getDate();

  let html = '<table class="calendar-table">';
  html += '<tr><th colspan="7">' + monthName + ' ' + year + '</th></tr>';
  html += '<tr><th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th></tr>';

  let day = 1;
  for (let i = 0; i < 6; i++) {
    html += '<tr>';
    for (let j = 0; j < 7; j++) {
      if (i === 0 && j < firstDay) {
        html += '<td></td>';
      } else if (day > daysInMonth) {
        html += '<td></td>';
      } else {
        const isToday = day === now.getDate() ? ' class="today"' : '';
        html += '<td' + isToday + '>' + day + '</td>';
        day++;
      }
    }
    html += '</tr>';
    if (day > daysInMonth) break;
  }
  html += '</table>';

  calendar.innerHTML = html;
}

// Calendar loading
renderCalendar();

function updateJumpButton(){

const nearBottom =
chat.scrollHeight - chat.scrollTop - chat.clientHeight < 10;

if(nearBottom){
jumpBtn.style.display = "none";
}else{
jumpBtn.style.display = "block";
}

}

chat.addEventListener("scroll", updateJumpButton);