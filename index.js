const mineflayer = require('mineflayer');
const Socks = require('socks').SocksClient;

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    joinDelay: 45000, 
    verifyDelay: 8000,
    spamInterval: 2500,
    // Filtered SOCKS5 Candidates
    proxies: [
        { host: '110.235.248.142', port: 1080 },
        { host: '202.62.59.218', port: 1080 },
        { host: '136.228.163.150', port: 5678 },
        { host: '31.42.2.113', port: 5678 },
        { host: '8.211.195.173', port: 1080 },
        { host: '195.133.41.113', port: 1080 },
        { host: '144.124.253.249', port: 1080 },
        { host: '202.55.175.237', port: 1080 },
        { host: '197.234.13.27', port: 4145 },
        { host: '199.229.254.129', port: 4145 }
    ]
};

function createBot(id, botName = null) {
    const name = botName || `USER_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    
    // Rotate through proxies (1 proxy per bot to maximize reliability)
    const proxy = CONFIG.proxies[id % CONFIG.proxies.length];

    console.log(`[Slot ${id + 1}] Connecting ${name} via ${proxy.host}:${proxy.port}...`);

    const botOptions = {
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        physicsEnabled: false,
        fakeHost: CONFIG.host,
        connect: (client) => {
            Socks.createConnection({
                proxy: {
                    host: proxy.host,
                    port: proxy.port,
                    type: 5 
                },
                command: 'connect',
                timeout: 15000, // Longer timeout for public proxies
                destination: {
                    host: CONFIG.host,
                    port: CONFIG.port
                }
            }, (err, info) => {
                if (err) {
                    console.log(`[Proxy Error] ${name} (${proxy.host}) failed: ${err.message}`);
                    return;
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        }
    };

    const bot = mineflayer.createBot(botOptions);

    // --- Logic Handlers ---
    bot.on('message', (json) => {
        const m = json.toString().toLowerCase();
        if (m.includes('/register')) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (m.includes('/login')) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> ${name} IS IN.`);
        setInterval(() => {
            if (bot.entity) bot.chat(Math.floor(Math.random() * 0xffffff).toString(16).toUpperCase());
        }, CONFIG.spamInterval);
    });

    bot.on('kicked', (reason) => {
        console.log(`[Kicked] ${name}: ${reason}`);
        setTimeout(() => createBot(id), 60000); // 1-minute retry
    });

    bot.on('error', (err) => {});
}

// Start sequence
console.log("Starting Proxy-Cram sequence...");
for (let i = 0; i < CONFIG.botCount; i++) {
    setTimeout(() => createBot(i), i * CONFIG.joinDelay);
}
