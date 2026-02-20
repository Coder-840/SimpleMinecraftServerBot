const mineflayer = require('mineflayer')

const HOST = "YOUR.SERVER.IP"
const PORT = 25565
const PASSWORD = "yourpassword"
const WORDS = ["Hello", "Hi", "Hey", "Yo", "Sup"]

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function randomName() {
  return "Bot" + Math.floor(Math.random() * 10000)
}

function randomWord() {
  return WORDS[Math.floor(Math.random() * WORDS.length)]
}

async function runBot() {
  const name = randomName()

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username: name
  })

  bot.once("spawn", async () => {
    try {
      await sleep(1000)

      // Try register
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)

      await sleep(1500)

      // Try login (in case already registered)
      bot.chat(`/login ${PASSWORD}`)

      await sleep(2500)

      // Say word
      bot.chat(randomWord())

      await sleep(1000)

      bot.quit()
    } catch (err) {
      bot.quit()
    }
  })

  bot.on("kicked", () => {})
  bot.on("error", () => {})
}

async function loop() {
  while (true) {
    await runBot()
    await sleep(4000) // wait before next bot joins
  }
}

loop()
