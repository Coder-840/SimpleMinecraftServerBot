const mineflayer = require("mineflayer")

// ===== CONFIG =====
const HOST = "noBnoT.org"
const PORT = 25565
const VERSION = "1.12.2"
const MESSAGE = "Hello from bot!"
const PASSWORD = "botpass"
const DELAY = 15000
// ==================

function randomName() {
  const chars = "abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789"
  return Array.from({ length: 10 }, () =>
    chars[Math.floor(Math.random() * chars.length)]
  ).join("")
}

function startBot(id) {
  const username = randomName()

  const bot = mineflayer.createBot({
    host: HOST,
    port: PORT,
    username,
    version: VERSION
  })

  console.log(`Bot ${id} joining as ${username}`)

  let registered = false
  let loggedIn = false

  // Once bot spawns, try /register (if server needs it)
  bot.once("spawn", () => {
    console.log(`Bot ${id} spawned`)
    setTimeout(() => bot.chat(`/register ${PASSWORD} ${PASSWORD}`), 2000)
    setTimeout(() => bot.chat(`/login ${PASSWORD}`), 4000)
  })

  // Listen for chat messages to detect successful login/register
  bot.on("message", (msg) => {
    const text = msg.toString()
    if (!registered && text.toLowerCase().includes("successfully registered")) {
      registered = true
      console.log(`Bot ${id} registered successfully`)
    }
    if (!loggedIn && (text.toLowerCase().includes("logged in") || text.toLowerCase().includes("welcome"))) {
      loggedIn = true
      console.log(`Bot ${id} logged in successfully`)
      // Chat the message and quit shortly after
      bot.chat(MESSAGE)
      setTimeout(() => bot.quit(), 4000)
    }
  })

  bot.on("end", () => {
    console.log(`Bot ${id} disconnected, restarting in ${DELAY / 1000}s...`)
    setTimeout(() => startBot(id), DELAY)
  })

  bot.on("error", (err) => {
    console.log(`Bot ${id} error: ${err.message}`)
  })
}

// launch exactly 3 bots
for (let i = 1; i <= 3; i++) startBot(i)
