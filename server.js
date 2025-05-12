const { createServer } = require("http")
const { parse } = require("url")
const next = require("next")

const dev = process.env.NODE_ENV !== "production"
const hostname = "localhost"
const port = process.env.PORT || 3000
const app = next({ dev, hostname, port })
const handle = app.getRequestHandler()

// Import services
let schedulingService
let initializeNotifications

app.prepare().then(() => {
  const server = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true)
      await handle(req, res, parsedUrl)
    } catch (err) {
      console.error("Error occurred handling", req.url, err)
      res.statusCode = 500
      res.end("Internal Server Error")
    }
  })

  server.listen(port, (err) => {
    if (err) throw err

    console.log(`> Ready on http://${hostname}:${port}`)

    // Initialize services
    Promise.all([import("./lib/services/scheduling-service.js"), import("./lib/services/init-notifications.js")])
      .then(([schedulingModule, notificationsModule]) => {
        // Start scheduling service
        schedulingService = schedulingModule.schedulingService
        schedulingService.startScheduler()
        console.log("> Scheduling service started")

        // Initialize notifications
        initializeNotifications = notificationsModule.initializeNotifications
        initializeNotifications()
        console.log("> Notification system initialized")
      })
      .catch((err) => {
        console.error("Failed to initialize services:", err)
      })
  })

  // Handle graceful shutdown
  const signals = ["SIGINT", "SIGTERM"]
  signals.forEach((signal) => {
    process.on(signal, () => {
      console.log(`> ${signal} signal received, stopping services...`)
      if (schedulingService) {
        schedulingService.stopScheduler()
      }
      server.close(() => {
        console.log("> Server closed")
        process.exit(0)
      })
    })
  })
})
