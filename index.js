const mineflayer = require("mineflayer")

// ===== CONFIG =====
const HOST = "noBnoT.org"
const PORT = 25565
const VERSION = "1.12.2"
const MESSAGE = "Hello from bot!"
const PASSWORD = "botpass"
const DELAY = 30000 // wait 30s before restarting
const BOT_COUNT = 3
const JOIN_STAGGER = 5000 // 5s between bot joins
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

  // Wait for server login packet
  bot.once("login", () => {
    console.log(`Bot ${id} connected, waiting for registration/login readiness...`)

    // Delay a bit to ensure server is ready for commands
    setTimeout(() => {
      bot.chat(`/register ${PASSWORD} ${PASSWORD}`)
      bot.chat(`/login ${PASSWORD}`)
    }, 2000)
  })

  // Listen for messages to detect successful login or registration
  bot.on("message", (msg) => {
    const text = msg.toString().toLowerCase()
    if (!registered && text.includes("successfully registered")) {
      registered = true
      console.log(`Bot ${id} registered successfully`)
    }
    if (!loggedIn && (text.includes("welcome") || text.includes("logged in"))) {
      loggedIn = true
      console.log(`Bot ${id} logged in successfully`)
      bot.chat(MESSAGE)

      // Disconnect a few seconds after chatting
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

// Stagger bot joins to avoid server spam
for (let i = 1; i <= BOT_COUNT; i++) {
  setTimeout(() => startBot(i), (i - 1) * JOIN_STAGGER)
}
