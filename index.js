import mineflayer from 'mineflayer';

const SERVER = {
  host: 'noBnoT.org',
  port: 25565,
  version: false
};

const PASSWORD = 'Password123'; // for /register and /login
const MAX_BOTS = 3;

let activeBots = [];

// Random bot name
function randomName() {
  return 'Bot' + Math.floor(Math.random() * 10000);
}

// Spawn a single bot
function spawnBot() {
  const name = randomName();
  const bot = mineflayer.createBot({
    host: SERVER.host,
    port: SERVER.port,
    username: name,
    version: SERVER.version
  });

  activeBots.push(bot);

  bot.once('spawn', () => {
    console.log(`${name} spawned.`);

    // ===== AUTO REGISTER / LOGIN =====
    bot.on('messagestr', message => {
      if (message.includes('/register')) {
        bot.chat(`/register ${PASSWORD} ${PASSWORD}`);
      } else if (message.includes('/login')) {
        bot.chat(`/login ${PASSWORD}`);
      }
    });

    // Wait a bit then say hello
    setTimeout(() => {
      bot.chat('Hello!');
      setTimeout(() => bot.quit('Goodbye!'), 3000 + Math.random() * 2000);
    }, 2000 + Math.random() * 2000);
  });

  // ===== RECONNECT / RESPAWN LOGIC =====
  function cleanup() {
    console.log(`${name} left.`);
    activeBots = activeBots.filter(b => b !== bot);
    maintainBots();
  }

  bot.on('end', cleanup);
  bot.on('kicked', cleanup);
  bot.on('error', err => {
    console.log(`${name} error: ${err.message}`);
    cleanup();
  });
}

// Keep 3 bots active at all times
function maintainBots() {
  while (activeBots.length < MAX_BOTS) {
    spawnBot();
  }
}

// Start the musketeers system
maintainBots();
