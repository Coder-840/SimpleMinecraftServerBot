const mineflayer = require('mineflayer');

const SERVER = {
  host: 'noBnoT.org',
  port: 25565,
  version: false
};

const PASSWORD = 'YourSecurePassword123';
let musketsActive = true;
let musketBots = [];

// Generate a random bot name
function randomName() {
  return 'Bot' + Math.floor(Math.random() * 10000);
}

function createMusket() {
  const username = randomName();
  const bot = mineflayer.createBot({
    host: SERVER.host,
    port: SERVER.port,
    username: username,
    version: SERVER.version
  });

  musketBots.push(bot);

  // ===== AUTO REGISTER / LOGIN =====
  bot.on('messagestr', message => {
    if (message.includes('/register')) bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
    if (message.includes('/login')) bot.chat(`/login ${PASSWORD}`);
  });

  // ===== SAY HELLO =====
  bot.once('spawn', () => {
    setTimeout(() => {
      bot.chat('Hello!');
    }, 2000 + Math.random() * 2000);
  });

  // ===== HANDLE DISCONNECT / KICK =====
  function cleanup() {
    console.log(`${username} left.`);
    musketBots = musketBots.filter(b => b !== bot);
    if (musketsActive) setTimeout(createMusket, 5000); // respawn with new random name
  }

  bot.on('end', cleanup);
  bot.on('kicked', cleanup);
  bot.on('error', err => {
    console.log(`${username} error: ${err.message}`);
    cleanup();
  });
}

// ===== START 3 MUSKETEERS =====
for (let i = 0; i < 3; i++) {
  createMusket();
}
