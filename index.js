const mineflayer = require('mineflayer');
const Socks = require('socks').SocksClient;
const axios = require('axios');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    joinDelay: 15000, 
    // This API gets SOCKS5 proxies from countries less likely to be blacklisted
    proxyApi: 'https://api.proxyscrape.com'
};

let proxyList = [];
let currentProxyIdx = 0;

async function refreshProxies() {
    try {
        console.log("[System] Scraping fresh proxies...");
        const response = await axios.get(CONFIG.proxyApi);
        proxyList = response.data.split('\r\n').filter(p => p.includes(':')).map(p => {
            const [host, port] = p.split(':');
            return { host, port: parseInt(port) };
        });
        console.log(`[System] Found ${proxyList.length} candidates.`);
    } catch (err) {
        console.error('[Error] Scraper failed:', err.message);
    }
}

function createBot(id, botName = null) {
    const name = botName || `USER_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    
    // FIRST 4 BOTS: Connect directly (no proxy) to ensure they get in.
    // OTHERS: Use proxies.
    const useProxy = id >= 4;
    const proxy = useProxy ? proxyList[currentProxyIdx++ % proxyList.length] : null;

    console.log(`[Slot ${id + 1}] ${name} -> ${useProxy ? 'Proxy: ' + proxy.host : 'DIRECT CONNECTION'}`);

    const botOptions = {
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        physicsEnabled: false,
        hideErrors: true
    };

    if (useProxy && proxy) {
        botOptions.connect = (client) => {
            Socks.createConnection({
                proxy: { host: proxy.host, port: proxy.port, type: 5 },
                command: 'connect',
                timeout: 6000, 
                destination: { host: CONFIG.host, port: CONFIG.port }
            }, (err, info) => {
                if (err) {
                    console.log(`[Fail] Proxy ${proxy.host} dead. Trying next...`);
                    return createBot(id, name); // Retry this slot with next proxy
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        };
    }

    const bot = mineflayer.createBot(botOptions);

    bot.on('message', (json) => {
        const m = json.toString();
        if (m.includes('/register')) bot.chat(`/register ${CONFIG.password} ${CONFIG.password}`);
        if (m.includes('/login')) bot.chat(`/login ${CONFIG.password}`);
    });

    bot.once('spawn', () => {
        console.log(`>>> SUCCESS: ${name} IS IN.`);
        setInterval(() => { if (bot.entity) bot.chat(Math.random().toString(36).substring(7)); }, 5000);
    });

    bot.on('kicked', (reason) => {
        const r = reason.toString();
        if (r.includes("suspicious") || r.includes("notbot")) {
            console.log(`[Blocked] ${name}: IP Blacklisted. Retrying next proxy...`);
            if (useProxy) createBot(id); 
        } else {
            console.log(`[Kicked] ${name}: ${r.slice(0, 50)}...`);
            setTimeout(() => createBot(id), 60000);
        }
    });

    bot.on('error', () => {});
}

async function main() {
    await refreshProxies();
    for (let i = 0; i < CONFIG.botCount; i++) {
        setTimeout(() => createBot(i), i * CONFIG.joinDelay);
    }
}

main();
