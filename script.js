const API = "https://script.google.com/macros/s/AKfycbyBRZT28RL0mN-k9OY5C84N9vwz6UJfVtx41UyvJrUA4uBEajuHrqFnPwKNK89QLC6D/exec";

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

let user = "";
let lastMessageCount = 0;
let serverOnline = false;

let loadInterval;
let statusInterval;
let pendingImage = null;

const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const serverStatus = document.getElementById("serverStatus");


// LOGIN
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

// BACK TO LOGIN
backBtn.onclick = function(){

location.reload();

};


jumpBtn.onclick = function(){
  chat.scrollTop = chat.scrollHeight;
};


// CHECK SERVER STATUS
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



// TERMINAL PRINT
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

if(content.startsWith("data:image/")){

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
textSpan.textContent = content;
line.appendChild(textSpan);

}

chat.appendChild(line);
}







// LOAD MESSAGES
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



// SEND MESSAGE
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



// ENTER KEY SEND
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

// SEND BUTTON CLICK
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

// IMAGE SEND
imageInput.addEventListener("change", function(e){

const file = e.target.files[0];
if(!file) return;

if(file.size > 100 * 1024 * 1024){
alert("File too large. Maximum size is 100MB.");
imageInput.value = "";
return;
}

const reader = new FileReader();

reader.onload = function(event){

pendingImage = event.target.result;

/* put indicator inside message box */
input.value = "[Image File Selected: " + file.name + " Delete this text to cancel]";

};

reader.readAsDataURL(file);

imageInput.value = "";

});




// SERVER STRESS LOAD GRAPH
const stressCanvas = document.getElementById("stressCanvas");
const stressCtx = stressCanvas.getContext("2d");
const cpuValue = document.getElementById("cpuValue");
const memValue = document.getElementById("memValue");
const netValue = document.getElementById("netValue");

let stressData = {
  cpu: [],
  memory: [],
  network: [],
  currentCPU: 20,
  currentMemory: 35,
  currentNetwork: 15
};

// Initialize data
for(let i = 0; i < 100; i++){
  stressData.cpu.push(Math.random() * 30 + 15);
  stressData.memory.push(Math.random() * 25 + 30);
  stressData.network.push(Math.random() * 20 + 10);
}

function generateStressData(){
  // Simulate realistic stress values with slight variations
  stressData.currentCPU += (Math.random() - 0.5) * 8;
  stressData.currentMemory += (Math.random() - 0.5) * 6;
  stressData.currentNetwork += (Math.random() - 0.5) * 10;

  // Keep values in reasonable bounds
  stressData.currentCPU = Math.max(5, Math.min(100, stressData.currentCPU));
  stressData.currentMemory = Math.max(20, Math.min(95, stressData.currentMemory));
  stressData.currentNetwork = Math.max(0, Math.min(100, stressData.currentNetwork));

  // Add occasional spikes
  if(Math.random() < 0.05){
    stressData.currentCPU = Math.min(100, stressData.currentCPU + 20);
  }
  if(Math.random() < 0.03){
    stressData.currentMemory = Math.min(95, stressData.currentMemory + 15);
  }

  stressData.cpu.push(stressData.currentCPU);
  stressData.memory.push(stressData.currentMemory);
  stressData.network.push(stressData.currentNetwork);

  // Keep only last 100 data points
  if(stressData.cpu.length > 100){
    stressData.cpu.shift();
    stressData.memory.shift();
    stressData.network.shift();
  }
}

function getColorForValue(value){
  if(value < 30) return "#00ff00"; // Green - Normal
  if(value < 70) return "#ffff00"; // Yellow - Warning
  return "#ff0000"; // Red - Critical
}

function drawStressGraph(){
  const width = stressCanvas.width;
  const height = stressCanvas.height;
  const pixelsPerPoint = width / 100;

  // Clear canvas
  stressCtx.fillStyle = "#000000";
  stressCtx.fillRect(0, 0, width, height);

  // Draw grid
  stressCtx.strokeStyle = "#003300";
  stressCtx.lineWidth = 1;
  for(let i = 0; i <= 10; i++){
    const y = (height / 10) * i;
    stressCtx.beginPath();
    stressCtx.moveTo(0, y);
    stressCtx.lineTo(width, y);
    stressCtx.stroke();
  }

  // Function to draw a line graph
  function drawLine(data, color, offsetY){
    stressCtx.strokeStyle = color;
    stressCtx.lineWidth = 2;
    stressCtx.beginPath();

    for(let i = 0; i < data.length; i++){
      const x = i * pixelsPerPoint;
      const y = height - (data[i] / 100) * (height - offsetY) - offsetY;

      if(i === 0){
        stressCtx.moveTo(x, y);
      } else {
        stressCtx.lineTo(x, y);
      }
    }
    stressCtx.stroke();
  }

  // Draw the three graphs with slight vertical offset for visibility
  drawLine(stressData.cpu, "#00ff00", 5);      // Green for CPU
  drawLine(stressData.memory, "#ffff00", 3);   // Yellow for Memory
  drawLine(stressData.network, "#ff5500", 1);  // Orange for Network

  // Draw current values text
  stressCtx.fillStyle = "#00ff00";
  stressCtx.font = "11px Consolas";
  stressCtx.fillText("CPU", 5, 15);

  stressCtx.fillStyle = "#ffff00";
  stressCtx.fillText("MEM", 40, 15);

  stressCtx.fillStyle = "#ff5500";
  stressCtx.fillText("NET", 75, 15);
}

function updateStressDisplay(){
  generateStressData();
  drawStressGraph();

  cpuValue.textContent = Math.round(stressData.currentCPU);
  memValue.textContent = Math.round(stressData.currentMemory);
  netValue.textContent = Math.round(stressData.currentNetwork);

  cpuValue.style.color = getColorForValue(stressData.currentCPU);
  memValue.style.color = getColorForValue(stressData.currentMemory);
  netValue.style.color = getColorForValue(stressData.currentNetwork);
}

function startStressGraph(){
  drawStressGraph();
  setInterval(updateStressDisplay, 1000);
}

// START GRAPH ON PAGE LOAD
startStressGraph();

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