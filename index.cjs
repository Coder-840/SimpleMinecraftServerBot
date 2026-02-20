const mineflayer = require("mineflayer")

const HOST = "noBnoT.org"
const PORT = 25565
const PASSWORD = "BotPass123"
const WORD = "Hello"

function randomName() {
  return "Bot" + Math.floor(Math.random() * 10000)
}

function wait(ms) {
  return new Promise(r => setTimeout(r, ms))
}

async function runBot() {
  const username = randomName()
  console.log("Creating bot:", username)

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username,
    auth: "offline",
    version: false
  })

  // 🔥 LOGIN DETECTION MUST BE HERE (not in spawn)
  bot.on("messagestr", msg => {
    console.log(username, "server:", msg)

    if (msg.toLowerCase().includes("/register")) {
      console.log(username, "registering")
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
    }

    if (msg.toLowerCase().includes("/login")) {
      console.log(username, "logging in")
      bot.chat(`/login ${PASSWORD}`)
    }
  })

  bot.once("spawn", async () => {
    console.log(username, "spawned")

    await wait(3000)

    console.log(username, "saying word")
    bot.chat(WORD)

    await wait(1500)

    console.log(username, "leaving")
    bot.quit()
  })

  bot.on("end", () => {
    console.log(username, "ended")
  })

  bot.on("kicked", r => {
    console.log(username, "kicked:", r)
  })

  bot.on("error", err => {
    console.log(username, "error:", err.message)
  })
}

async function loop() {
  while (true) {
    await runBot()
    await wait(4000)
  }
}

console.log("Starting musketeer system...")
loop()
