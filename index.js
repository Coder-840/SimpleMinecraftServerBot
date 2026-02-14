const mineflayer = require('mineflayer');

const HOST = 'noBnoT.org'; // Keep the quotes!
const PORT = parseInt(process.env.SERVER_PORT) || 25565;
const MAX_BOTS = parseInt(process.env.BOT_COUNT) || 5;
const PASSWORD = process.env.BOT_PASSWORD || "EaglerBot123";
const JOIN_DELAY = 5000; // 5 seconds between bots to bypass anti-spam

let activeBots = [];

function randomStr(len) {
    return Math.random().toString(36).substring(2, 2 + len);
}

function createBot(id) {
    const name = `Bot_${randomStr(5)}`;
    console.log(`[${id + 1}/${MAX_BOTS}] Deploying ${name}...`);

    const bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: name,
        version: "1.8.8" // Most common version for Eaglercraft proxies
    });

    // --- AUTO AUTHENTICATION ---
    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString().toLowerCase();
        
        if (msg.includes("/register")) {
            bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        } else if (msg.includes("/login")) {
            bot.chat(`/login ${PASSWORD}`);
        }
    });

    // --- TRACKING & BROADCAST TRIGGER ---
    bot.on('spawn', () => {
        if (!activeBots.find(b => b.username === bot.username)) {
            activeBots.push(bot);
            console.log(`${bot.username} is ready.`);
        }

        if (activeBots.length === MAX_BOTS) {
            console.log(">>> ALL BOTS READY. INITIATING CHAT FLOOD.");
            startGlobalBroadcast();
        }
    });

    // --- RECONNECT LOGIC ---
    bot.on('error', (err) => console.log(`[!] ${name} Error: ${err.code}`));
    bot.on('kicked', (reason) => {
        console.log(`[!] ${name} Kicked: ${reason}`);
        activeBots = activeBots.filter(b => b.username !== name);
        setTimeout(() => createBot(id), 10000); // Rejoin after 10s
    });
}

function startGlobalBroadcast() {
    setInterval(() => {
        const randomSpam = `[${randomStr(8).toUpperCase()}]`;
        activeBots.forEach(bot => {
            bot.chat(randomSpam);
        });
    }, 2500); // Sends every 2.5 seconds
}

// Start sequential joins
for (let i = 0; i < MAX_BOTS; i++) {
    setTimeout(() => createBot(i), i * JOIN_DELAY);
}
