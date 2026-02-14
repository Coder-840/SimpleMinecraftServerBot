const mineflayer = require('mineflayer');
const Socks = require('socks').SocksClient;
const axios = require('axios');

const CONFIG = {
    host: 'noBnoT.org',
    port: 25565,
    botCount: 10,
    password: 'SafeBot123!',
    joinDelay: 25000, // Slower joins = less suspicious
    sources: [
        'https://raw.githubusercontent.com/TheSpeedX/PROXY-List/refs/heads/master/socks5.txt'
    ]
};

let proxyList = [];
let currentProxyIdx = 0;

async function refreshProxies() {
    console.log("[System] Gathering SOCKS5 proxies...");
    for (const url of CONFIG.sources) {
        try {
            const response = await axios.get(url, { timeout: 5000 });
            const parsed = response.data.trim().split(/\r?\n/).filter(p => p.includes(':')).map(p => {
                const [host, port] = p.split(':');
                return { host, port: parseInt(port) };
            });
            proxyList = [...proxyList, ...parsed];
        } catch (e) {}
    }
    proxyList = proxyList.sort(() => Math.random() - 0.5);
    console.log(`[System] ${proxyList.length} proxies loaded.`);
}

function createBot(id, botName = null) {
    if (proxyList.length === 0) return;

    const name = botName || `USER_${Math.random().toString(36).substring(2, 7)}`.toUpperCase();
    const proxy = proxyList[currentProxyIdx++ % proxyList.length];

    console.log(`[Slot ${id + 1}] Testing ${proxy.host}...`);

    const bot = mineflayer.createBot({
        host: CONFIG.host,
        port: CONFIG.port,
        username: name,
        version: '1.8.8',
        // Stealth settings
        fakeHost: CONFIG.host, 
        viewDistance: 'tiny',
        connect: (client) => {
            Socks.createConnection({
                proxy: { host: proxy.host, port: proxy.port, type: 5 },
                command: 'connect',
                timeout: 10000, // More time for TCPShield handshake
                destination: { host: CONFIG.host, port: CONFIG.port }
            }, (err, info) => {
                if (err) return createBot(id, name); // Try next proxy
                client.setSocket(info.socket);
                client.emit('connect');
            });
        }
    });

    bot.once('spawn', () => {
        console.log(`>>> SUCCESS: ${name} IS IN!`);
        // Move slightly to prove we aren't a static bot
        setInterval(() => { if (bot.entity) bot.setControlState('forward', true); setTimeout(() => bot.setControlState('forward', false), 500); }, 30000);
    });

    bot.on('kicked', (reason) => {
        const r = reason.toString();
        // If we hit the captcha wall, ditch this proxy immediately
        if (r.includes("suspicious") || r.includes("notbot")) {
             return createBot(id); 
        }
        setTimeout(() => createBot(id), 45000);
    });

    bot.on('error', () => {});
}

async function main() {
    await refreshProxies();
    for (let i = 0; i < CONFIG.botCount; i++) {
        createBot(i);
        await new Promise(r => setTimeout(r, CONFIG.joinDelay));
    }
}

main();
