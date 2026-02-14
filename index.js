const mineflayer = require('mineflayer');

const HOST = 'noBnoT.org'; // Keep the quotes!
const PORT = parseInt(process.env.SERVER_PORT) || 25565;
const MAX_BOTS = parseInt(process.env.BOT_COUNT) || 3;
const PASSWORD = process.env.BOT_PASSWORD || "EaglerBot123!";

// INCREASED DELAYS to bypass "Logging in too fast"
const JOIN_DELAY = 15000; // 15 seconds between bots
const RECONNECT_DELAY = 20000; // 20 seconds after a kick

let activeBots = [];

function randomStr(len) {
    return Math.random().toString(36).substring(2, 2 + len);
}

function createBot(id, customName = null) {
    const name = customName || `Bot_${randomStr(5)}`;
    console.log(`[Attempt] Deploying ${name}...`);

    const bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: name,
        version: "1.8.8"
    });

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString().toLowerCase();
        if (msg.includes("/register")) bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
        if (msg.includes("/login")) bot.chat(`/login ${PASSWORD}`);
    });

    bot.on('spawn', () => {
        if (!activeBots.find(b => b.username === bot.username)) {
            activeBots.push(bot);
            console.log(`>>> SUCCESS: ${bot.username} is in.`);
        }
        if (activeBots.length === MAX_BOTS) startGlobalBroadcast();
    });

    bot.on('kicked', (reason) => {
        const kickMsg = reason.toString();
        console.log(`[!] ${name} kicked.`);

        // SPECIAL BYPASS: If the server says "Join back immediately", we do exactly that.
        if (kickMsg.includes("analyzing") || kickMsg.includes("immediately")) {
            console.log(`[Bypass] Re-joining ${name} instantly...`);
            setTimeout(() => createBot(id, name), 1000); 
        } else {
            // Otherwise, wait longer to avoid the "Too Fast" error
            activeBots = activeBots.filter(b => b.username !== name);
            setTimeout(() => createBot(id), RECONNECT_DELAY);
        }
    });

    bot.on('error', () => {}); // Silencing errors to keep logs clean
}

function startGlobalBroadcast() {
    setInterval(() => {
        activeBots.forEach(bot => bot.chat(`[${randomStr(6).toUpperCase()}]`));
    }, 5000);
}

// Start very slowly
for (let i = 0; i < MAX_BOTS; i++) {
    setTimeout(() => createBot(i), i * JOIN_DELAY);
}
