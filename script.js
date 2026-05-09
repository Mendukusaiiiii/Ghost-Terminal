//what are you looking at. ._.


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
const importLogBtn = document.getElementById("importLogBtn");

let user = "";
let lastMessageCount = 0;
let serverOnline = false;
let easterEggActive = false;

let loadInterval;
let statusInterval;
let pendingImage = null;


let gameActive = false;
let gameMenu = false;
let shooterX = 5;
let shooterY = 10;let prevshooterX = 5;
let prevshooterY = 10;let shooterDir = 'right'; // 'up', 'down', 'left', 'right'
let bullets = [];
let enemyBullets = [];
let effects = [];
let targets = [];
let score = 0;
let health = 3;
let shells = 10;
let moveCounter = 0;
let width = 20;
const height = 15;
let gameInterval;
let ammoInterval;
let spawnInterval;

const shooterChars = {
    up: '^',
    down: 'v',
    left: '<',
    right: '>'
};

function showGameMenu() {
    gameMenu = true;
    clearInterval(loadInterval);
    chat.innerHTML = '<pre>Shooter Game\n \nType START to begin the game\nType EXIT to return to terminal</pre>';
    chat.scrollTop = chat.scrollHeight;
    input.style.display = 'block';
    jumpBtn.style.display = 'none';
    sendBtn.style.display = 'none';
    imageInput.style.display = 'none';
    typingBox.innerHTML = 'Enter Your Choice:';
}

function initGame() {
    gameActive = true;
    // Calculate width based on chat container width
    width = Math.floor(chat.clientWidth / 8) - 2; // Approximate character width
    if (width < 10) width = 10; // Minimum width
    if (width > 40) width = 40; // Maximum width
    
    shooterX = Math.floor(width / 2);
    shooterY = 10;
    prevshooterX = shooterX;
    prevshooterY = shooterY;
    shooterDir = 'right';
    bullets = [];
    enemyBullets = [];
    effects = [];
    targets = [];
    score = 0;
    health = 5;
    shells = 10;
    moveCounter = 0;
    // Add some targets
    for (let i = 0; i < 5; i++) {
        let side = Math.floor(Math.random() * 4);
        let t = {x: 0, y: 0, dir: 'right'};
        if (side === 0) { // left
            t.x = -1;
            t.y = Math.floor(Math.random() * height);
            t.dir = 'right';
        } else if (side === 1) { // right
            t.x = width;
            t.y = Math.floor(Math.random() * height);
            t.dir = 'left';
        } else if (side === 2) { // top
            t.x = Math.floor(Math.random() * width);
            t.y = -1;
            t.dir = 'down';
        } else { // bottom
            t.x = Math.floor(Math.random() * width);
            t.y = height;
            t.dir = 'up';
        }
        targets.push(t);
    }
    clearInterval(loadInterval); // Pause chat loading
    renderGame();
    input.style.display = 'none';
    jumpBtn.style.display = 'none';
    sendBtn.style.display = 'none';
    imageInput.style.display = 'none';
    typingBox.innerHTML = 'Shooter Game';
    gameInterval = setInterval(updateGame, 200); // Update every 200ms
    ammoInterval = setInterval(() => {
        if (shells < 10) {
            shells++;
            renderGame();
        }
    }, 10000); // Replenish ammo every 10 seconds
    spawnInterval = setInterval(spawnTarget, 20000); // Spawn a new enemy every 20 seconds
}

function spawnTarget() {
    let side = Math.floor(Math.random() * 4);
    let t = {x: 0, y: 0, dir: 'right'};
    if (side === 0) { // left
        t.x = -1;
        t.y = Math.floor(Math.random() * height);
        t.dir = 'right';
    } else if (side === 1) { // right
        t.x = width;
        t.y = Math.floor(Math.random() * height);
        t.dir = 'left';
    } else if (side === 2) { // top
        t.x = Math.floor(Math.random() * width);
        t.y = -1;
        t.dir = 'down';
    } else { // bottom
        t.x = Math.floor(Math.random() * width);
        t.y = height;
        t.dir = 'up';
    }
    targets.push(t);
}

function renderGame() {
    let board = Array(height).fill().map(() => Array(width).fill().map(() => ({char: '.', type: 'field'})));
    
    // Draw shooter
    board[shooterY][shooterX] = {char: shooterChars[shooterDir], type: 'player'};
    
    // Draw bullets
    bullets.forEach(b => {
        if (b.x >= 0 && b.x < width && b.y >= 0 && b.y < height) {
            board[b.y][b.x] = {char: '*', type: 'bullet'};
        }
    });
    
    // Draw enemy bullets
    enemyBullets.forEach(b => {
        if (b.x >= 0 && b.x < width && b.y >= 0 && b.y < height) {
            board[b.y][b.x] = {char: 'o', type: 'enemy-bullet'};
        }
    });
    
    // Draw effects
    effects.forEach(e => {
        if (e.x >= 0 && e.x < width && e.y >= 0 && e.y < height) {
            board[e.y][e.x] = {char: '#', type: 'effect'};
        }
    });
    
    // Draw targets
    targets.forEach(t => {
        if (t.x >= 0 && t.x < width && t.y >= 0 && t.y < height) {
            board[t.y][t.x] = {char: 'X', type: 'enemy'};
        }
    });
    
    // Convert to colored HTML
    let display = '';
    display += '<pre class="shooter-game-board">';
    board.forEach(row => {
        row.forEach(cell => {
            let className = 'shooter-' + cell.type;
            display += `<span class="${className}">${cell.char}</span>`;
        });
        display += '\n';
    });
    display += `<span class="shooter-field">\n\nScore: ${score}\n`;
    display += `Health: <span class="shooter-player">${'█'.repeat(health)}</span><span class="shooter-field">${'░'.repeat(5 - health)}</span>\n`;
    display += `Shells: ${shells}\n</span></pre>`;
    
    chat.innerHTML = display;
    chat.scrollTop = chat.scrollHeight;
}

function updateGame() {
    moveCounter++;
    
    // Clear effects
    effects = [];
    
    // Move bullets
    bullets = bullets.map(b => {
        if (b.dir === 'up') b.y--;
        else if (b.dir === 'down') b.y++;
        else if (b.dir === 'left') b.x--;
        else if (b.dir === 'right') b.x++;
        return b;
    }).filter(b => b.x >= 0 && b.x < width && b.y >= 0 && b.y < height);
    
    // Move enemy bullets
    enemyBullets = enemyBullets.map(b => {
        if (b.dir === 'up') b.y--;
        else if (b.dir === 'down') b.y++;
        else if (b.dir === 'left') b.x--;
        else if (b.dir === 'right') b.x++;
        return b;
    }).filter(b => b.x >= 0 && b.x < width && b.y >= 0 && b.y < height);
    
    // Move targets
    if (moveCounter % 2 === 0) {
        targets.forEach(t => {
            let onBoard = t.x >= 0 && t.x < width && t.y >= 0 && t.y < height;
            if (!onBoard) {
                // Move inward
                if (t.dir === 'right') t.x++;
                else if (t.dir === 'left') t.x--;
                else if (t.dir === 'down') t.y++;
                else if (t.dir === 'up') t.y--;
            } else {
                // Random movement
                let dir = Math.floor(Math.random() * 4);
                if (dir === 0 && t.y > 0) t.y--; // up
                else if (dir === 1 && t.y < height - 1) t.y++; // down
                else if (dir === 2 && t.x > 0) t.x--; // left
                else if (dir === 3 && t.x < width - 1) t.x++; // right
            }
        });
    }
    
    // Targets shoot occasionally with prediction
    targets.forEach(t => {
        if (t.x >= 0 && t.x < width && t.y >= 0 && t.y < height && Math.random() < 0.05) { // 5% chance each update, only if on board
            let dx = shooterX - prevshooterX;
            let dy = shooterY - prevshooterY;
            let predictedX = shooterX + dx;
            let predictedY = shooterY + dy;
            
            let dir;
            let deltaX = predictedX - t.x;
            let deltaY = predictedY - t.y;
            if (Math.abs(deltaX) > Math.abs(deltaY)) {
                dir = deltaX > 0 ? 'right' : 'left';
            } else {
                dir = deltaY > 0 ? 'down' : 'up';
            }
            enemyBullets.push({x: t.x, y: t.y, dir: dir});
        }
    });
    
    // Check enemy bullet collisions with shooter
    enemyBullets.forEach((b, bi) => {
        if (b.x === shooterX && b.y === shooterY) {
            effects.push({x: b.x, y: b.y});
            health--;
            enemyBullets.splice(bi, 1);
        }
    });
    
    // Check target collisions with shooter
    targets.forEach((t, ti) => {
        if (t.x >= 0 && t.x < width && t.y >= 0 && t.y < height && t.x === shooterX && t.y === shooterY) {
            effects.push({x: t.x, y: t.y});
            // Push the enemy away from the shooter
            let pushDirX = t.x - shooterX;
            let pushDirY = t.y - shooterY;
            
            if (pushDirX !== 0 || pushDirY !== 0) {
                if (Math.abs(pushDirX) > Math.abs(pushDirY)) {
                    // Push horizontally
                    if (pushDirX > 0 && t.x < width - 1) t.x++;
                    else if (pushDirX < 0 && t.x > 0) t.x--;
                } else {
                    // Push vertically
                    if (pushDirY > 0 && t.y < height - 1) t.y++;
                    else if (pushDirY < 0 && t.y > 0) t.y--;
                }
            }
            // No health loss, no points, no new target spawned
        }
    });
    
    // Check bullet collisions with enemy bullets
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        for (let ebi = enemyBullets.length - 1; ebi >= 0; ebi--) {
            if (bullets[bi].x === enemyBullets[ebi].x && bullets[bi].y === enemyBullets[ebi].y) {
                effects.push({x: bullets[bi].x, y: bullets[bi].y});
                bullets.splice(bi, 1);
                enemyBullets.splice(ebi, 1);
                score += 5;
                break; // Only one collision per bullet
            }
        }
    }
    
    // Check bullet collisions with targets
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        for (let ti = targets.length - 1; ti >= 0; ti--) {
            if (bullets[bi].x === targets[ti].x && bullets[bi].y === targets[ti].y) {
                effects.push({x: bullets[bi].x, y: bullets[bi].y});
                bullets.splice(bi, 1);
                targets.splice(ti, 1);
                score += 10;
                // Add new target
                let side = Math.floor(Math.random() * 4);
                let t = {x: 0, y: 0, dir: 'right'};
                if (side === 0) { // left
                    t.x = -1;
                    t.y = Math.floor(Math.random() * height);
                    t.dir = 'right';
                } else if (side === 1) { // right
                    t.x = width;
                    t.y = Math.floor(Math.random() * height);
                    t.dir = 'left';
                } else if (side === 2) { // top
                    t.x = Math.floor(Math.random() * width);
                    t.y = -1;
                    t.dir = 'down';
                } else { // bottom
                    t.x = Math.floor(Math.random() * width);
                    t.y = height;
                    t.dir = 'up';
                }
                targets.push(t);
                break;
            }
        }
    }
    
    // Check game over
    if (health <= 0) {
        endGame(true);
        return;
    }
    
    renderGame();
}

function shoot() {
    if (shells > 0) {
        bullets.push({x: shooterX, y: shooterY, dir: shooterDir});
        shells--;
    }
}

function endGame(isGameOver = false) {
    gameActive = false;
    clearInterval(gameInterval);
    clearInterval(ammoInterval);
    clearInterval(spawnInterval);
    input.style.display = 'block';
    jumpBtn.style.display = 'block';
    sendBtn.style.display = 'block';
    imageInput.style.display = 'block';
    typingBox.innerHTML = '';
    chat.innerHTML = ''; // Clear game
    if (isGameOver) {
        sendMessage("Shooter Game Score: " + score);
    }
    loadMessages(); // Reload chat
    loadInterval = setInterval(loadMessages,2000); // Restart chat loading
}

const profanityList = [
  "fuck",
  "shit",
  "bitch",
  "bastard",
  "asshole",
  "damn",
  "crap",
  "dick",
  "pussy",
  "nigger",
  "cunt",
  "slut",
  "fag",
  "whore",
  "twat"
];

function containsProfanity(text) {
  if (!text) return false;
  const normalized = text.toLowerCase();
  return profanityList.some(word => {
    const regex = new RegExp(`\\b${word.replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&")}\\b`, "i");
    return regex.test(normalized);
  });
}

function blockProfanity(message) {
  if (containsProfanity(message)) {
    typingBox.innerHTML = "Profanity Detected.";
    return true;
  }
  return false;
}

const statusIndicator = document.getElementById("statusIndicator");
const statusText = document.getElementById("statusText");
const serverStatus = document.getElementById("serverStatus");
const danceAudio = document.getElementById("danceAudio");


// Login
loginBtn.onclick = function(){

let name = usernameInput.value.trim();

if (containsProfanity(name)) {
  typingBox.innerHTML = "Username may not contain profanity.";
  return;
}

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

// Import log as image
importLogBtn.onclick = function(){
  const chat = document.getElementById('chat');
  const clone = chat.cloneNode(true);
  clone.style.height = 'auto';
  clone.style.overflow = 'visible';
  clone.style.position = 'absolute';
  clone.style.left = '-9999px';
  clone.style.top = '-9999px';
  clone.style.background = 'black';
  document.body.appendChild(clone);
  
  html2canvas(clone).then(canvas => {
    const link = document.createElement('a');
    link.download = 'message_log.png';
    link.href = canvas.toDataURL();
    link.click();
    document.body.removeChild(clone);
  });
};;;


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
if (easterEggActive) time.classList.add('rainbow-text');

if(timestamp){
const d = new Date(timestamp);
time.textContent = "[" + d.toLocaleDateString() + " " + d.toLocaleTimeString() + "] ";
}else{
time.textContent = "[unknown] ";
}

line.appendChild(time);

const userLabel = document.createElement("span");
userLabel.className = "username";
if (easterEggActive) userLabel.classList.add('rainbow-text');
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
if (easterEggActive) textSpan.classList.add('rainbow-text');
textSpan.innerHTML = makeLinksClickable(content);
line.appendChild(textSpan);

}

chat.appendChild(line);
}

// Load message
async function loadMessages(){

if (gameActive || gameMenu) {
    typingBox.innerHTML = "";
    return;
}

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

// Confetti function
function createPixelConfetti() {
    const colors = ['#ff0000', '#ff8000', '#ffff00', '#80ff00', '#00ff00', '#00ff80', '#00ffff', '#0080ff', '#0000ff', '#8000ff', '#ff00ff', '#ff0080'];
    
    function dropConfetti() {
        if (!easterEggActive) return; // Stop if Easter egg is deactivated
        
        const confettiCount = 5; // Fewer pieces per drop for continuous effect
        
        for (let i = 0; i < confettiCount; i++) {
            const confetti = document.createElement('div');
            confetti.style.position = 'fixed';
            confetti.style.width = '6px';
            confetti.style.height = '6px';
            confetti.style.backgroundColor = colors[Math.floor(Math.random() * colors.length)];
            confetti.style.left = Math.random() * window.innerWidth + 'px';
            confetti.style.top = '-10px';
            confetti.style.zIndex = '9999';
            confetti.style.pointerEvents = 'none';
            
            document.body.appendChild(confetti);
            
            // Animate falling
            const animation = confetti.animate([
                { transform: 'translateY(0px) rotate(0deg)', opacity: 1 },
                { transform: `translateY(${window.innerHeight + 20}px) rotate(${Math.random() * 360}deg)`, opacity: 0 }
            ], {
                duration: 3000 + Math.random() * 2000,
                easing: 'ease-out'
            });
            
            animation.onfinish = () => {
                confetti.remove();
            };
        }
    }
    
    // Start continuous confetti
    dropConfetti(); // Initial drop
    const confettiInterval = setInterval(dropConfetti, 200); // Drop every 200ms
    
    // Store interval ID to potentially clear it later if needed
    window.confettiInterval = confettiInterval;
}

// Easter egg function
function triggerEasterEgg() {
    easterEggActive = true;

    // Add rainbow border to main UI elements
    const selectors = [
        '#calendarContainer', '#aboutContent', '#loginBtn',
        '#aboutBtn', '#closeAboutBtn', '#imageInput'
    ];

    selectors.forEach(selector => {
        const el = document.querySelector(selector);
        if (el) el.classList.add('rainbow-border');
    });

    // Add rainbow text to existing message elements
    const messageElements = document.querySelectorAll('.timestamp, .username, .messageContent');
    messageElements.forEach(el => {
        el.classList.add('rainbow-text');
    });

    // Create pixel confetti
    createPixelConfetti();

    // Play audio
    danceAudio.play().catch(e => console.log('Audio play failed:', e));

    // Rainbow effect continues indefinitely
}


// Enter key message
input.addEventListener("keypress",function(e){

if(e.key === "Enter"){

const msg = input.value.trim();

if(msg !== ""){
    if(gameMenu) {
        if(msg.toUpperCase() === "START") {
            gameMenu = false;
            initGame();
        } else if(msg.toUpperCase() === "EXIT") {
            gameMenu = false;
            input.value = "";
            typingBox.innerHTML = "";
            jumpBtn.style.display = 'block';
            sendBtn.style.display = 'block';
            imageInput.style.display = 'block';
            chat.innerHTML = "";
            loadMessages();
        } else {
            typingBox.innerHTML = "Invalid choice. Type START or EXIT.";
        }
        input.value = "";
    } else if(msg.toLowerCase() === "t@nk") {
        showGameMenu();
        input.value = "";
    } else if(msg.toLowerCase() === "dancin") {
        triggerEasterEgg();
        input.value = "";
    } else if (!blockProfanity(msg)) {
        sendMessage(msg);
        input.value = "";
    }
}

}

});

input.addEventListener("input", function(){

if(pendingImage && input.value.trim() !== "[File Selected: " + pendingImage.name + "] Delete this text to cancel."){
pendingImage = null;
}

});

// Game controls
document.addEventListener("keydown", function(e) {
    if (!gameActive) return;
    
    let oldX = shooterX;
    let oldY = shooterY;
    
    switch(e.key.toLowerCase()) {
        case 'w':
            shooterDir = 'up';
            if (shooterY > 0) shooterY--;
            break;
        case 's':
            shooterDir = 'down';
            if (shooterY < height - 1) shooterY++;
            break;
        case 'a':
            shooterDir = 'left';
            if (shooterX > 0) shooterX--;
            break;
        case 'd':
            shooterDir = 'right';
            if (shooterX < width - 1) shooterX++;
            break;
        case ' ':
            e.preventDefault();
            shoot();
            break;
    }
    
    if (shooterX !== oldX || shooterY !== oldY) {
        prevshooterX = oldX;
        prevshooterY = oldY;
    }
    
    renderGame();
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
    if(gameMenu) {
        if(msg.toUpperCase() === "START") {
            gameMenu = false;
            initGame();
        } else if(msg.toUpperCase() === "EXIT") {
            gameMenu = false;
            input.value = "";
            typingBox.innerHTML = "";
            jumpBtn.style.display = 'block';
            sendBtn.style.display = 'block';
            imageInput.style.display = 'block';
            chat.innerHTML = "";
            loadMessages();
        } else {
            typingBox.innerHTML = "Invalid choice. Type START or EXIT.";
        }
        input.value = "";
    } else if(msg.toLowerCase() === "t@nk") {
        showGameMenu();
        input.value = "";
    } else if(msg.toLowerCase() === "dancin") {
        triggerEasterEgg();
        input.value = "";
    } else if (!blockProfanity(msg)) {
        sendMessage(msg);
        input.value = "";
    }
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
input.value = "[File Selected: " + file.name + "] Delete this text to cancel.";

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

if (gameActive) {
    jumpBtn.style.display = "none";
    return;
}

const nearBottom =
chat.scrollHeight - chat.scrollTop - chat.clientHeight < 10;

if(nearBottom){
jumpBtn.style.display = "none";
}else{
jumpBtn.style.display = "block";
}

}

chat.addEventListener("scroll", updateJumpButton);