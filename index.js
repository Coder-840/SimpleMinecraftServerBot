const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const axios = require('axios');

const CONFIG = {
    host: 'noBnoT.org', 
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    proxyApi: 'https://api.proxyscrape.com',
    joinDelay: 8000, 
    verifyDelay: 6000
};

let scrapedProxies = [];

async function refreshProxies() {
    try {
        console.log("Fetching fresh 'Warp' points...");
        const res = await axios.get(CONFIG.proxyApi, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
            }
        });
        
        // Split by lines and remove any empty results or carriage returns
        scrapedProxies = res.data.toString().replace(/\r/g, '').split('\n').filter(p => p.includes(':'));
        
        if (scrapedProxies.length === 0) {
            console.log("API returned blank. Retrying with backup URL...");
            // Backup URL if the first one fails
            const backupRes = await axios.get('https://api.proxyscrape.com');
            scrapedProxies = backupRes.data.toString().replace(/\r/g, '').split('\n').filter(p => p.includes(':'));
        }
        
        console.log(`Successfully scraped ${scrapedProxies.length} proxies.`);
    } catch (e) {
        console.log(`Failed to fetch proxies: ${e.message}`);
    }
}

function createBot(id, botName = null) {
    if (scrapedProxies.length === 0) {
        console.log("No proxies available. Retrying fetch...");
        return setTimeout(() => createBot(id, botName), 10000);
    }

    const name = botName || `WARP_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    const proxyStr = scrapedProxies[Math.floor(Math.random() * scrapedProxies.length)];
    const [pHost, pPort] = proxyStr.split(':');

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        connect: (client) => {
            SocksClient.createConnection({
                proxy: { host: pHost, port: parseInt(pPort), type: 5 },
                command: 'connect',
                destination: { host: CONFIG.host, port: CONFIG.port },
                timeout: 10000 // Stop hanging on slow proxies
            }, (err, info) => {
                if (err) {
                    // FIX: Wait 2 seconds before retrying to prevent stack overflow
                    return setTimeout(() => createBot(id, botName), 2000); 
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        }
    });

    bot.on('message', (json) => {
        const msg = json.toString().toLowerCase();
        if (msg.includes("/register")) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (msg.includes("/login")) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> ${name} PASSED SHIELD.`);
        setInterval(() => {
            if (bot.entity) bot.chat(Math.random().toString(36).substring(2, 8).toUpperCase());
        }, 8000);
    });

    bot.on('kicked', (reason) => {
        const kickMsg = reason.toString();
        if (kickMsg.includes("verified") || kickMsg.includes("re-connect") || kickMsg.includes("analyzing")) {
            console.log(`[Shield] ${name} verifying...`);
            setTimeout(() => createBot(id, name), CONFIG.verifyDelay);
        } else {
            console.log(`[Kicked] ${name}. Re-warping in 15s...`);
            setTimeout(() => createBot(id), 15000);
        }
    });

    // Handle errors so the bot doesn't just die
    bot.on('error', (err) => {
        bot.end();
        setTimeout(() => createBot(id, botName), 5000);
    });
}

refreshProxies().then(() => {
    for (let i = 0; i < CONFIG.botCount; i++) {
        setTimeout(() => createBot(i), i * CONFIG.joinDelay);
    }
});
