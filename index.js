const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');

const CONFIG = {
    host: 'noBnoT.org', 
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    joinDelay: 10000, 
    verifyDelay: 6000,
    // Freshly gathered public SOCKS5 list
    proxies: [
        "184.178.172.18:15280", "167.103.111.41:43615", "104.129.199.70:10230",
        "103.126.87.112:1285", "117.7.201.8:5657", "202.162.219.12:1080",
        "45.61.121.191:6790", "172.104.56.209:9050", "197.234.13.24:4145",
        "103.195.141.47:1080", "109.194.17.214:3629", "185.87.121.5:8975",
        "5.75.198.16:1080", "93.187.188.30:1080", "181.66.37.143:4153",
        "191.96.117.213:6968", "192.111.137.34:18765", "64.64.115.234:5869",
        "142.147.240.117:6639", "66.29.128.244:23597", "103.191.196.71:8199"
    ]
};

function createBot(id, botName = null) {
    const name = botName || `WARP_${Math.random().toString(36).substring(2, 7).toUpperCase()}`;
    const proxyStr = CONFIG.proxies[Math.floor(Math.random() * CONFIG.proxies.length)];
    const [pHost, pPort] = proxyStr.split(':');

    console.log(`[Bot ${id + 1}] Warping via ${proxyStr}...`);

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
                timeout: 8000 
            }, (err, info) => {
                if (err) {
                    // Try a different proxy immediately if this one is dead
                    return setTimeout(() => createBot(id, botName), 1000); 
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
            if (bot.entity) {
                const hex = Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase();
                bot.chat(hex);
            }
        }, 8000);
    });

    bot.on('kicked', (reason) => {
        const kickMsg = reason.toString();
        if (kickMsg.includes("verified") || kickMsg.includes("re-connect") || kickMsg.includes("analyzing")) {
            console.log(`[Shield] ${name} verifying...`);
            setTimeout(() => createBot(id, name), CONFIG.verifyDelay);
        } else {
            console.log(`[Kicked] ${name}. Retrying slot...`);
            setTimeout(() => createBot(id), 15000);
        }
    });

    bot.on('error', (err) => {
        bot.end();
        setTimeout(() => createBot(id, botName), 2000);
    });
}

// Kick off the slots
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => createBot(i), i * CONFIG.joinDelay);
}
