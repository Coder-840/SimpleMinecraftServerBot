const mineflayer = require('mineflayer');
const eaglercraft = require('mineflayer-eaglercraft');

const SETTINGS = {
  url: 'wss://eagler.noBnoT.org',
  version: '1.12.2',
  message: '>Domplayzallgames LOVES SPREADING_DARK and they are a really happy couple. Thye cuddle every night in bed :D',
  botCount: 3
};

function generateName() {
  return 'Bot_' + Math.random().toString(36).substring(2, 8);
}

function createBot() {
  const name = generateName();
  console.log(`[Connecting] ${name}`);

  const bot = mineflayer.createBot({
    connect: eaglercraft.createConnector(SETTINGS.url),
    username: name,
    version: SETTINGS.version
  });

  bot.once('spawn', () => {
    console.log(`[Spawned] ${name}`);
    
    // Most Eaglercraft servers use these for initial entry
    bot.chat(`/register Password123 Password123`);
    bot.chat(`/login Password123`);
    
    setTimeout(() => {
      bot.chat(SETTINGS.message);
      console.log(`[Action] ${name} sent message.`);
      
      setTimeout(() => {
        bot.quit();
        console.log(`[Cycle] ${name} left. Next bot in 5s...`);
        setTimeout(createBot, 5000); 
      }, 2000);
    }, 4000);
  });

  bot.on('error', (err) => console.log(`[Error] ${name}:`, err.message));
  bot.on('kicked', (reason) => console.log(`[Kicked] ${name}:`, reason));
}

// Start initial trio
for (let i = 0; i < SETTINGS.botCount; i++) {
  setTimeout(() => createBot(), i * 4000); // Staggered join to avoid IP bans
}
