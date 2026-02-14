const mineflayer = require('mineflayer');

const CONFIG = {
    host: 'noBnoT.org', 
    port: 25565,
    botCount: 5,
    password: 'SafeBot123!',
    spamInterval: 1000,
    minJoinDelay: 1000,
    maxJoinDelay: 35000
};

const activeBots = new Set();

function randomStr(len) {
    return Math.random().toString(36).substring(2, 2 + len).toUpperCase();
}

function createBot(id, existingName = null) {
    const name = existingName || `User_${randomStr(5)}`;
    console.log(`[Queue] Launching ${name}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8'
    });

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString().toLowerCase();
        if (msg.includes("/register")) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (msg.includes("/login")) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.on('spawn', () => {
        console.log(`>>> ${name} IS IN.`);
        activeBots.add(name);
        
        // Anti-AFK Jump
        setInterval(() => {
            if (bot.entity) {
                bot.setControlState('jump', true);
                setTimeout(() => { if (bot.entity) bot.setControlState('jump', false); }, 500);
            }
        }, 15000);

        // Individual Chat Loop
        setInterval(() => {
            if (bot.entity && activeBots.has(name)) {
                bot.chat(randomStr(8));
            }
        }, CONFIG.spamInterval);
    });

    bot.on('kicked', (reason) => {
        const kickMsg = reason.toString();
        console.log(`[!] ${name} kicked.`);

        // THE BYPASS: If the server is "analyzing", rejoin IMMEDIATELY with the same name
        if (kickMsg.includes("analyzing") || kickMsg.includes("immediately")) {
            console.log(`[Bypass] Rejoining ${name} for verification...`);
            setTimeout(() => createBot(id, name), 1000); 
        } else {
            activeBots.delete(name);
            // If it's a normal kick, wait a bit before starting a new bot slot
            setTimeout(() => createBot(id), 45000);
        }
    });

    bot.on('error', () => {});
}

function startQueue(currentId) {
    if (currentId >= CONFIG.botCount) return;
    createBot(currentId);
    const nextDelay = Math.floor(Math.random() * (CONFIG.maxJoinDelay - CONFIG.minJoinDelay + 1)) + CONFIG.minJoinDelay;
    console.log(`[Queue] Bot #${currentId + 2} scheduled in ${Math.round(nextDelay/1000)}s.`);
    setTimeout(() => startQueue(currentId + 1), nextDelay);
}

startQueue(0);
