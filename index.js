const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');
const axios = require('axios');

const CONFIG = {
    host: 'noBnoT.org', 
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    // API to get fresh SOCKS5 proxies automatically
    proxyApi: 'https://api.proxyscrape.com',
    joinDelay: 8000, 
    verifyDelay: 6000
};

let scrapedProxies = [];

async function refreshProxies() {
    try {
        console.log("Warping IPs... Fetching fresh proxy list.");
        const res = await axios.get(CONFIG.proxyApi);
        scrapedProxies = res.data.trim().split('\n').map(p => p.trim());
        console.log(`Successfully scraped ${scrapedProxies.length} proxies.`);
    } catch (e) {
        console.log("Error: Could not reach the proxy API.");
    }
}

function createBot(id, botName = null) {
    if (scrapedProxies.length === 0) return;

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
                destination: { host: CONFIG.host, port: CONFIG.port }
            }, (err, info) => {
                if (err) {
                    // If a proxy fails (common with free ones), just pick another and try again
                    return createBot(id, botName); 
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
        console.log(`>>> ${name} PASSED SHIELD VIA WARP.`);
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
            setTimeout(() => createBot(id), 30000);
        }
    });

    bot.on('error', () => {});
}

// Start sequence: Scrape first, then deploy
refreshProxies().then(() => {
    for (let i = 0; i < CONFIG.botCount; i++) {
        setTimeout(() => createBot(i), i * CONFIG.joinDelay);
    }
});
