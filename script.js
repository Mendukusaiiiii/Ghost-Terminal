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
let helpMode = false;
let gameMode = '1P';
let bullets = [];
let enemyBullets = [];
let effects = [];
let targets = [];
let moveCounter = 0;
let width = 20;
const height = 15;
let gameInterval;
let ammoInterval;
let spawnInterval;

const player1 = {
    id: 'p1',
    x: 5,
    y: 10,
    prevX: 5,
    prevY: 10,
    dir: 'right',
    health: 5,
    shells: 10,
    score: 0,
    active: true
};

const player2 = {
    id: 'p2',
    x: 5,
    y: 12,
    prevX: 5,
    prevY: 12,
    dir: 'left',
    health: 5,
    shells: 10,
    score: 0,
    active: false
};

const shooterChars = {
    up: '^',
    down: 'v',
    left: '<',
    right: '>'
};

function showGameMenu() {
    gameMenu = true;
    clearInterval(loadInterval);
    chat.innerHTML = '<pre>Shooter Game\n\nType 1P for single-player\nType 2P for two-player\nType EXIT to return to terminal</pre>';
    chat.scrollTop = chat.scrollHeight;
    input.style.display = 'block';
    jumpBtn.style.display = 'none';
    sendBtn.style.display = 'none';
    imageInput.style.display = 'none';
    typingBox.innerHTML = 'Enter Your Choice:';
}

function showHelp() {
    helpMode = true;
    clearInterval(loadInterval);
    const helpMessage = `
Available Slash Commands:

 /help     - Shows all available slash commands
 /t@nk     - Shooter Game
 /dancin   - Won't tell what it is... Try it out :P
 
Type EXIT to return to terminal
`;
    chat.innerHTML = `<pre style="color: #00ff00; margin: 10px 0;">${helpMessage}</pre>`;
    chat.scrollTop = chat.scrollHeight;
    input.style.display = 'block';
    jumpBtn.style.display = 'none';
    sendBtn.style.display = 'none';
    imageInput.style.display = 'none';
    typingBox.innerHTML = 'Type EXIT to return:';
}

function initGame(mode = '1P') {
    gameActive = true;
    gameMode = mode === '2P' ? '2P' : '1P';
    // Calculate width based on chat container width
    width = Math.floor(chat.clientWidth / 8) - 2; // Approximate character width
    if (width < 10) width = 10; // Minimum width
    if (width > 40) width = 40; // Maximum width
    
    const centerX = Math.floor(width / 2);
    const centerY = Math.max(2, Math.floor(height / 2) - 2);

    player1.x = centerX;
    player1.y = centerY;
    player1.prevX = player1.x;
    player1.prevY = player1.y;
    player1.dir = 'right';
    player1.health = 5;
    player1.shells = 10;
    player1.score = 0;
    player1.active = true;

    player2.active = gameMode === '2P';
    if (player2.active) {
        player2.x = centerX;
        player2.y = centerY;
        player2.prevX = player2.x;
        player2.prevY = player2.y;
        player2.dir = 'left';
        player2.health = 5;
        player2.shells = 10;
        player2.score = 0;
    }

    bullets = [];
    enemyBullets = [];
    effects = [];
    targets = [];
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
        if (player1.shells < 10) {
            player1.shells++;
        }
        if (player2.active && player2.shells < 10) {
            player2.shells++;
        }
        renderGame();
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

function getActivePlayers() {
    const players = [player1];
    if (player2.active) players.push(player2);
    return players.filter(p => p.health > 0);
}

function renderGame() {
    let board = Array(height).fill().map(() => Array(width).fill().map(() => ({char: '.', type: 'field'})));

    // Draw players
    [player1, player2].forEach(player => {
        if (!player.active || player.health <= 0) return;
        if (player.x >= 0 && player.x < width && player.y >= 0 && player.y < height) {
            board[player.y][player.x] = {char: shooterChars[player.dir], type: player.id === 'p1' ? 'player' : 'player2'};
        }
    });

    // Draw bullets
    bullets.forEach(b => {
        if (b.x >= 0 && b.x < width && b.y >= 0 && b.y < height) {
            board[b.y][b.x] = {char: '*', type: b.owner === 'p1' ? 'bullet-p1' : 'bullet-p2'};
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

    let display = '<pre class="shooter-game-board">';
    display += '<span class="shooter-field">\n';
    display += `Player 1 Score: ${player1.score}\n`;
    display += `Player 1 Health: <span class="shooter-player">${'█'.repeat(player1.health)}</span><span class="shooter-field">${'░'.repeat(5 - player1.health)}</span>\n`;
    display += `Player 1 Shells: ${player1.shells}\n`;
    if (player2.active) {
        display += `Player 2 Score: ${player2.score}\n`;
        display += `Player 2 Health: <span class="shooter-player2">${'█'.repeat(player2.health)}</span><span class="shooter-field">${'░'.repeat(5 - player2.health)}</span>\n`;
        display += `Player 2 Shells: ${player2.shells}\n`;
    }
    display += '</span>\n\n';
    board.forEach(row => {
        row.forEach(cell => {
            let className = 'shooter-' + cell.type;
            display += `<span class="${className}">${cell.char}</span>`;
        });
        display += '\n';
    });
    display += '</pre>';

    chat.innerHTML = display;
    chat.scrollTop = chat.scrollHeight;
}

function updateGame() {
    moveCounter++;
    effects = [];

    bullets = bullets.map(b => {
        if (b.dir === 'up') b.y--;
        else if (b.dir === 'down') b.y++;
        else if (b.dir === 'left') b.x--;
        else if (b.dir === 'right') b.x++;
        return b;
    }).filter(b => b.x >= 0 && b.x < width && b.y >= 0 && b.y < height);

    enemyBullets = enemyBullets.map(b => {
        if (b.dir === 'up') b.y--;
        else if (b.dir === 'down') b.y++;
        else if (b.dir === 'left') b.x--;
        else if (b.dir === 'right') b.x++;
        return b;
    }).filter(b => b.x >= 0 && b.x < width && b.y >= 0 && b.y < height);

    if (moveCounter % 2 === 0) {
        targets.forEach(t => {
            let onBoard = t.x >= 0 && t.x < width && t.y >= 0 && t.y < height;
            if (!onBoard) {
                if (t.dir === 'right') t.x++;
                else if (t.dir === 'left') t.x--;
                else if (t.dir === 'down') t.y++;
                else if (t.dir === 'up') t.y--;
            } else {
                let dir = Math.floor(Math.random() * 4);
                if (dir === 0 && t.y > 0) t.y--; 
                else if (dir === 1 && t.y < height - 1) t.y++; 
                else if (dir === 2 && t.x > 0) t.x--; 
                else if (dir === 3 && t.x < width - 1) t.x++; 
            }
        });
    }

    targets.forEach(t => {
        if (t.x >= 0 && t.x < width && t.y >= 0 && t.y < height && Math.random() < 0.05) {
            const activePlayers = getActivePlayers();
            if (activePlayers.length === 0) return;
            let targetPlayer = activePlayers.reduce((closest, p) => {
                const dist = Math.abs(p.x - t.x) + Math.abs(p.y - t.y);
                return dist < closest.dist ? {player: p, dist} : closest;
            }, {player: activePlayers[0], dist: Infinity}).player;

            let dx = targetPlayer.x - targetPlayer.prevX;
            let dy = targetPlayer.y - targetPlayer.prevY;
            let predictedX = targetPlayer.x + dx;
            let predictedY = targetPlayer.y + dy;
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

    for (let bi = enemyBullets.length - 1; bi >= 0; bi--) {
        const b = enemyBullets[bi];
        let hitPlayer = null;
        if (b.x === player1.x && b.y === player1.y && player1.health > 0) hitPlayer = player1;
        if (!hitPlayer && player2.active && b.x === player2.x && b.y === player2.y && player2.health > 0) hitPlayer = player2;
        if (hitPlayer) {
            effects.push({x: b.x, y: b.y});
            hitPlayer.health--;
            enemyBullets.splice(bi, 1);
        }
    }

    targets.forEach(t => {
        [player1, player2].forEach(player => {
            if (!player.active || player.health <= 0) return;
            if (t.x === player.x && t.y === player.y) {
                effects.push({x: t.x, y: t.y});
                let pushDirX = t.x - player.x;
                let pushDirY = t.y - player.y;
                if (pushDirX !== 0 || pushDirY !== 0) {
                    if (Math.abs(pushDirX) > Math.abs(pushDirY)) {
                        if (pushDirX > 0 && t.x < width - 1) t.x++;
                        else if (pushDirX < 0 && t.x > 0) t.x--;
                    } else {
                        if (pushDirY > 0 && t.y < height - 1) t.y++;
                        else if (pushDirY < 0 && t.y > 0) t.y--;
                    }
                }
            }
        });
    });

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        for (let ebi = enemyBullets.length - 1; ebi >= 0; ebi--) {
            if (bullets[bi].x === enemyBullets[ebi].x && bullets[bi].y === enemyBullets[ebi].y) {
                effects.push({x: bullets[bi].x, y: bullets[bi].y});
                const owner = bullets[bi].owner === 'p2' ? player2 : player1;
                owner.score += 5;
                bullets.splice(bi, 1);
                enemyBullets.splice(ebi, 1);
                break;
            }
        }
    }

    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        for (let ti = targets.length - 1; ti >= 0; ti--) {
            if (bullets[bi].x === targets[ti].x && bullets[bi].y === targets[ti].y) {
                effects.push({x: bullets[bi].x, y: bullets[bi].y});
                const owner = bullets[bi].owner === 'p2' ? player2 : player1;
                bullets.splice(bi, 1);
                targets.splice(ti, 1);
                owner.score += 10;
                let side = Math.floor(Math.random() * 4);
                let t = {x: 0, y: 0, dir: 'right'};
                if (side === 0) {
                    t.x = -1;
                    t.y = Math.floor(Math.random() * height);
                    t.dir = 'right';
                } else if (side === 1) {
                    t.x = width;
                    t.y = Math.floor(Math.random() * height);
                    t.dir = 'left';
                } else if (side === 2) {
                    t.x = Math.floor(Math.random() * width);
                    t.y = -1;
                    t.dir = 'down';
                } else {
                    t.x = Math.floor(Math.random() * width);
                    t.y = height;
                    t.dir = 'up';
                }
                targets.push(t);
                break;
            }
        }
    }

    // Check for player vs player hits
    for (let bi = bullets.length - 1; bi >= 0; bi--) {
        const bullet = bullets[bi];
        const owner = bullet.owner === 'p2' ? player2 : player1;
        const targetPlayer = bullet.owner === 'p2' ? player1 : player2;
        if (targetPlayer.active && targetPlayer.health > 0 && bullet.x === targetPlayer.x && bullet.y === targetPlayer.y) {
            effects.push({x: bullet.x, y: bullet.y});
            owner.score += 20;
            targetPlayer.health--;
            bullets.splice(bi, 1);
        }
    }

    const activePlayers = getActivePlayers();
    if (activePlayers.length === 0) {
        endGame(true);
        return;
    }

    renderGame();
}

function shoot(player) {
    if (player.shells > 0 && player.health > 0) {
        bullets.push({x: player.x, y: player.y, dir: player.dir, owner: player.id});
        player.shells--;
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
        if (gameMode === '2P') {
            sendMessage(`Shooter Game Scores: P1: ${player1.score}| P2: ${player2.score}`);
        } else {
            sendMessage('Shooter Game Score: ' + player1.score);
        }
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
        const choice = msg.toUpperCase();
        if(choice === "1P" || choice === "START") {
            gameMenu = false;
            initGame('1P');
        } else if(choice === "2P") {
            gameMenu = false;
            initGame('2P');
        } else if(choice === "EXIT") {
            gameMenu = false;
            input.value = "";
            typingBox.innerHTML = "";
            jumpBtn.style.display = 'block';
            sendBtn.style.display = 'block';
            imageInput.style.display = 'block';
            chat.innerHTML = "";
            loadMessages();
        } else {
            typingBox.innerHTML = "Invalid choice. Type 1P, 2P or EXIT.";
        }
        input.value = "";
    } else if(helpMode) {
        const choice = msg.toUpperCase();
        if(choice === "/exit") {
            helpMode = false;
            input.value = "";
            typingBox.innerHTML = "";
            jumpBtn.style.display = 'block';
            sendBtn.style.display = 'block';
            imageInput.style.display = 'block';
            chat.innerHTML = "";
            loadMessages();
        } else {
            typingBox.innerHTML = "Type EXIT to return to terminal.";
        }
        input.value = "";
    } else if(msg.toLowerCase() === "/t@nk") {
        showGameMenu();
        input.value = "";
    } else if(msg.toLowerCase() === "/dancin") {
        triggerEasterEgg();
        input.value = "";
    } else if(msg.toLowerCase() === "/help") {
        showHelp();
        input.value = "";
    } else if(msg.toLowerCase() === "/back") {
        chat.innerHTML = "";
        loadMessages();
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
    
    const old1X = player1.x;
    const old1Y = player1.y;
    const old2X = player2.x;
    const old2Y = player2.y;

    switch(e.key.toLowerCase()) {
        case 'w':
            player1.dir = 'up';
            if (player1.y > 0) player1.y--;
            break;
        case 's':
            player1.dir = 'down';
            if (player1.y < height - 1) player1.y++;
            break;
        case 'a':
            player1.dir = 'left';
            if (player1.x > 0) player1.x--;
            break;
        case 'd':
            player1.dir = 'right';
            if (player1.x < width - 1) player1.x++;
            break;
        case 'c':
        case ' ':
            e.preventDefault();
            shoot(player1);
            break;
        case 'arrowup':
            if (player2.active) {
                player2.dir = 'up';
                if (player2.y > 0) player2.y--;
            }
            e.preventDefault();
            break;
        case 'arrowdown':
            if (player2.active) {
                player2.dir = 'down';
                if (player2.y < height - 1) player2.y++;
            }
            e.preventDefault();
            break;
        case 'arrowleft':
            if (player2.active) {
                player2.dir = 'left';
                if (player2.x > 0) player2.x--;
            }
            e.preventDefault();
            break;
        case 'arrowright':
            if (player2.active) {
                player2.dir = 'right';
                if (player2.x < width - 1) player2.x++;
            }
            e.preventDefault();
            break;
        case '/':
            if (player2.active) shoot(player2);
            break;
    }
    
    if (player1.x !== old1X || player1.y !== old1Y) {
        player1.prevX = old1X;
        player1.prevY = old1Y;
    }
    if (player2.active && (player2.x !== old2X || player2.y !== old2Y)) {
        player2.prevX = old2X;
        player2.prevY = old2Y;
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
        const choice = msg.toUpperCase();
        if(choice === "1P" || choice === "START") {
            gameMenu = false;
            initGame('1P');
        } else if(choice === "2P") {
            gameMenu = false;
            initGame('2P');
        } else if(choice === "EXIT") {
            gameMenu = false;
            input.value = "";
            typingBox.innerHTML = "";
            jumpBtn.style.display = 'block';
            sendBtn.style.display = 'block';
            imageInput.style.display = 'block';
            chat.innerHTML = "";
            loadMessages();
        } else {
            typingBox.innerHTML = "Invalid choice. Type 1P, 2P, START or EXIT.";
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