const mineflayer = require('mineflayer');

const CONFIG = {
    host: 'noBnoT.org', 
    port: 25565,
    botCount: 5,
    password: 'SafeBot123!',
    spamInterval: 1000,
    reconnectDelay: 35000 // 35s to clear Minecraft/Bungee IP-rate limits
};

function randomStr(len) {
    return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

function spawnBot(id, botName = null) {
    const name = botName || `User_${randomStr(5)}`;
    console.log(`[Bot ${id + 1}] Initializing ${name}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8'
    });

    // --- BINDING EVENTS TO THE NEW INSTANCE ---
    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString().toLowerCase();
        if (msg.includes("/register")) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (msg.includes("/login")) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> ${name} joined and verified.`);
        
        // Anti-AFK & Spam Loops
        const chatInterval = setInterval(() => {
            if (bot.entity) bot.chat(randomStr(8));
            else clearInterval(chatInterval); // Stop if bot is gone
        }, CONFIG.spamInterval);
    });

    // --- RECONNECT LOGIC: MUST RE-BIND ON EVERY KICK ---
    bot.on('kicked', (reason) => {
        const kickMsg = reason.toString();
        console.log(`[!] ${name} kicked. Reason: ${kickMsg.substring(0, 50)}...`);

        // Destroy old instance properly
        bot.end();

        // Limbo Bypass: Rejoin immediately with same name
        if (kickMsg.includes("analyzing") || kickMsg.includes("immediately")) {
            console.log(`[Bypass] Instant rejoin for ${name}`);
            setTimeout(() => spawnBot(id, name), 2000);
        } else {
            // Standard Kick: Wait 35s to avoid Mojang/Server relog lock
            console.log(`[Waiting] ${name} cooling down for ${CONFIG.reconnectDelay/1000}s`);
            setTimeout(() => spawnBot(id), CONFIG.reconnectDelay);
        }
    });

    bot.on('error', (err) => {
        console.log(`[Error] ${name}: ${err.code}`);
        bot.end();
        setTimeout(() => spawnBot(id), CONFIG.reconnectDelay);
    });
}

// --- SEQUENTIAL START ---
// Spreads out the initial joins so the IP doesn't get flagged immediately
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => spawnBot(i), i * 30000);
}
