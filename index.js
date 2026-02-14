const mineflayer = require('mineflayer');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'FastPass123!',
    joinDelay: 5000, // INCREASED to 5s to stop the silent throttle
    timeout: 15000   // 15s limit to connect or it resets
};

function createBot(id) {
    const name = `Bot_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    console.log(`[${id + 1}] Attempting ${name}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        connectTimeout: CONFIG.timeout // Stop hanging forever
    });

    // FAILSAFE: If it hasn't spawned in 15s, something is wrong
    const failTimer = setTimeout(() => {
        if (!bot.entity) {
            console.log(`[!] ${name} timed out. Retrying...`);
            bot.end();
            createBot(id);
        }
    }, CONFIG.timeout);

    bot.on('spawn', () => {
        clearTimeout(failTimer); // Connection successful
        console.log(`>>> ${name} online.`);
        setInterval(() => { if (bot.entity) bot.chat(Math.random().toString(36).substring(2, 8)); }, 5000);
    });

    bot.on('kicked', (reason) => {
        console.log(`[Kicked] ${name}: ${reason}`);
        setTimeout(() => createBot(id), 10000);
    });

    bot.on('error', (err) => console.log(`[Error] ${name}: ${err.message}`));
}

// Start with a 5-second staggered delay
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => createBot(i), i * CONFIG.joinDelay);
}
