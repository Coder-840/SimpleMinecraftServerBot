const mineflayer = require('mineflayer');

// Configuration from Environment Variables (set these in Railway)
const HOST = process.env.SERVER_IP || '127.0.0.1'; // The Java IP of the Eagler server
const PORT = parseInt(process.env.SERVER_PORT) || 25565;
const MAX_BOTS = parseInt(process.env.BOT_COUNT) || 5;
const JOIN_DELAY = 5000; // 5 seconds between joins to avoid anti-spam

let bots = [];

function generateRandomString(length) {
    return Math.random().toString(36).substring(2, 2 + length);
}

function createBot(index) {
    const username = `Bot_${generateRandomString(6)}`;
    console.log(`[${index + 1}/${MAX_BOTS}] Spawning ${username}...`);

    const bot = mineflayer.createBot({
        host: HOST,
        port: PORT,
        username: username,
        version: '1.8.8' // Common version for Eaglercraft backends
    });

    bot.on('spawn', () => {
        console.log(`${username} has joined the server.`);
        bots.push(bot);

        // Check if all bots have joined
        if (bots.length === MAX_BOTS) {
            console.log("Target reached. Starting broadcast...");
            startBroadcasting();
        }
    });

    bot.on('error', (err) => console.log(`${username} Error: ${err.message}`));
    bot.on('kicked', (reason) => console.log(`${username} Kicked: ${reason}`));
}

function startBroadcasting() {
    setInterval(() => {
        const randomMsg = generateRandomString(10);
        bots.forEach(bot => {
            try {
                bot.chat(randomMsg);
            } catch (e) {
                console.log("Failed to send message for one bot.");
            }
        });
    }, 3000); // Sends a message every 3 seconds
}

// Sequential Join Logic
for (let i = 0; i < MAX_BOTS; i++) {
    setTimeout(() => {
        createBot(i);
    }, i * JOIN_DELAY);
}
