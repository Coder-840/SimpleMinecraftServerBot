const mineflayer = require('mineflayer');

const CONFIG = {
    host: 'noBnoT.org', 
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    joinDelay: 10000,       
    verifyDelay: 5000,      // 5s wait before re-joining for TCPShield
    spamInterval: 2500
};

function createBot(id, botName = null) {
    const name = botName || `BOT_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    
    console.log(`[Slot ${id + 1}] Connecting: ${name}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8'
    });

    bot.on('message', (json) => {
        const m = json.toString().toLowerCase();
        if (m.includes('/register')) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (m.includes('/login')) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> SUCCESS: ${name} PASSED THE SHIELD!`);
        setInterval(() => {
            if (bot.entity) bot.chat(Math.random().toString(36).substring(2, 8).toUpperCase());
        }, CONFIG.spamInterval);
    });

    bot.on('kicked', (reason) => {
        const kickMsg = reason.toString();
        
        if (kickMsg.includes("verified") || kickMsg.includes("re-connect") || kickMsg.includes("analyzing")) {
            console.log(`[Shield] ${name} needs verification. Waiting ${CONFIG.verifyDelay/1000}s...`);
            // We MUST wait a few seconds or we get "Logged in too fast"
            setTimeout(() => createBot(id, name), CONFIG.verifyDelay);
        } else if (kickMsg.includes("too fast")) {
            console.log(`[RateLimit] ${name} was too fast. Backing off...`);
            setTimeout(() => createBot(id), 20000);
        } else {
            console.log(`[Kicked] ${name}: ${kickMsg.substring(0, 40)}`);
            setTimeout(() => createBot(id), 30000);
        }
    });

    bot.on('error', () => {});
}

// Initial slow roll-out
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => createBot(i), i * CONFIG.joinDelay);
}
