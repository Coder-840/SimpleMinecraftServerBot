const mineflayer = require('mineflayer');
const { SocksClient } = require('socks');

const SETTINGS = {
    host: 'noBnoT.org', // REPLACE THIS
    port: 25565,
    botCount: 5,
    password: 'BotPassword123!',
    joinDelay: 2500,
    spamSpeed: 1000,
    proxies: [
        "45.61.121.191:6790", "8.211.195.139:28737", "49.147.86.35:8082", "181.66.37.143:4153",
        "45.190.78.20:999", "85.2.149.139:3128", "103.126.87.112:1285", "5.75.198.16:1080",
        "104.129.199.70:10230", "102.207.191.68:8080", "93.87.73.58:1080", "103.189.197.9:8080",
        "171.248.210.253:1080", "8.210.17.35:9443", "95.182.78.4:5678", "103.191.196.71:8199",
        "93.187.188.30:1080", "103.147.246.184:3127", "8.211.194.85:1081", "57.128.75.104:3128",
        "91.247.92.63:5678", "188.164.199.199:36938", "64.64.115.234:5869", "191.96.117.213:6968",
        "192.111.137.34:18765", "142.147.240.117:6639", "66.29.128.244:23597", "190.94.213.4:999",
        "31.59.33.201:6777", "117.7.201.8:5657", "103.195.141.47:1080", "45.22.209.157:8888",
        "172.104.56.209:9050", "197.234.13.24:4145", "8.213.222.247:8008", "185.87.121.5:8975",
        "147.91.22.150:80", "219.65.73.81:80", "202.162.219.12:1080", "109.194.17.214:3629",
        "72.221.171.135:4145", "43.252.238.166:8080", "185.32.4.65:4153", "98.181.137.80:4145",
        "209.135.168.41:80", "46.29.116.3:4145", "8.209.96.245:89", "162.220.247.95:6690",
        "88.213.214.254:4145", "174.77.111.197:4145"
    ]
};

function createBot(id, proxyIndex = null) {
    const pIdx = proxyIndex !== null ? proxyIndex : Math.floor(Math.random() * SETTINGS.proxies.length);
    const proxyStr = SETTINGS.proxies[pIdx];
    const [pHost, pPort] = proxyStr.split(':');
    const name = `Bot_${Math.random().toString(36).substring(2, 7)}`;

    console.log(`[Bot ${id}] Connecting via ${proxyStr}...`);

    const bot = mineflayer.createBot({
        host: SETTINGS.host,
        port: SETTINGS.port,
        username: name,
        version: '1.8.8',
        connect: (client) => {
            SocksClient.createConnection({
                proxy: { host: pHost, port: parseInt(pPort), type: 5 },
                command: 'connect',
                destination: { host: SETTINGS.host, port: SETTINGS.port }
            }, (err, info) => {
                if (err) {
                    console.log(`[!] Proxy ${proxyStr} failed. Rotating...`);
                    return createBot(id); // Try a different proxy immediately
                }
                client.setSocket(info.socket);
                client.emit('connect');
            });
        }
    });

    bot.on('message', (jsonMsg) => {
        const msg = jsonMsg.toString().toLowerCase();
        if (msg.includes("/register")) bot.chat(`/register ${SETTINGS.password} ${SETTINGS.password}`);
        if (msg.includes("/login")) bot.chat(`/login ${SETTINGS.password}`);
    });

    bot.on('spawn', () => {
        console.log(`>>> ${bot.username} STABLE.`);
        setInterval(() => { if (bot.entity) bot.chat(Math.random().toString(36).substring(2, 10).toUpperCase()); }, SETTINGS.spamSpeed);
    });

    bot.on('kicked', (reason) => {
        console.log(`[!] ${name} kicked. Reason: ${reason}`);
        setTimeout(() => createBot(id), 15000);
    });

    bot.on('error', () => {}); 
}

for (let i = 0; i < SETTINGS.botCount; i++) {
    setTimeout(() => createBot(i), i * SETTINGS.joinDelay);
}
